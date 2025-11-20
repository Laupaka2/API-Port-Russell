/**
 * @file reservations.js
 * @description Gestion CRUD des réservations pour chaque catway, avec
 * affichage dynamique dans le tableau HTML et validation des dates.
 */

const token = localStorage.getItem('token');
if (!token) window.location.href = '/index.html';

const catwaySelect = document.getElementById('catwayNumber');
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

let editingReservation = null;
let catwaysCache = [];
const reservationsByCatway = new Map();
const TOTAL_CATWAYS = 24;

/**
 * Récupère toutes les réservations pour tous les catways et les affiche dans le tableau.
 * @async
 */
async function fetchAllReservations() {
  try {
    // Récupère les catways
    const resCatways = await fetch('/catways', { headers: { Authorization: `Bearer ${token}` } });
    if (!resCatways.ok) throw new Error('Erreur lors du chargement des catways');
    const catways = await resCatways.json();
    const enforcedCatways = Array.from({ length: TOTAL_CATWAYS }, (_, idx) => {
      const number = idx + 1;
      return catways.find(c => Number(c.catwayNumber) === number) || { catwayNumber: number };
    });

    catwaysCache = enforcedCatways;
    populateCatwaySelect(enforcedCatways);
    reservationsByCatway.clear();
    enforcedCatways.forEach(c => reservationsByCatway.set(Number(c.catwayNumber), []));

    const allReservations = [];
    // Récupère les réservations pour chaque catway
    for (const c of enforcedCatways) {
      const res = await fetch(`/catways/${c.catwayNumber}/reservations`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) continue;
      const reservations = await res.json();
      reservationsByCatway.set(Number(c.catwayNumber), reservations);
      allReservations.push(...reservations);
    }

    const tbody = document.getElementById('reservationsTableBody');
    if (allReservations.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center">Aucune réservation</td></tr>`;
    } else {
      tbody.innerHTML = allReservations.map(r => `
        <tr data-id="${r._id}" data-catway="${r.catwayNumber}">
          <td>${r.catwayNumber}</td>
          <td>${r.clientName}</td>
          <td>${r.boatName}</td>
          <td>${r.startDate.slice(0,10)}</td>
          <td>${r.endDate.slice(0,10)}</td>
          <td>
            <button class="btn btn-sm btn-warning editBtn">Modifier</button>
            <button class="btn btn-sm btn-danger ms-2 deleteBtn">Supprimer</button>
          </td>
        </tr>
      `).join('');
    }

    updateCatwayAvailability();

    // Ajout des listeners pour modification/suppression
    document.querySelectorAll('.editBtn').forEach(btn => btn.addEventListener('click', onEditClick));
    document.querySelectorAll('.deleteBtn').forEach(btn => btn.addEventListener('click', onDeleteClick));

  } catch (error) {
    console.error(error);
    alert('Erreur lors du chargement des réservations.');
  }
}

// Déconnexion
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/index.html';
});

/**
 * Gestion de la soumission du formulaire de création ou modification de réservation.
 * @async
 * @param {Event} e - Événement de soumission
 */
document.getElementById('reservationForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const catwayNumber = document.getElementById('catwayNumber').value.trim();
  const clientName = document.getElementById('clientName').value.trim();
  const boatName = document.getElementById('boatName').value.trim();
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  if (new Date(startDate) >= new Date(endDate)) {
    alert('La date de début doit être avant la date de fin.');
    return;
  }

  if (editingReservation) {
    // Modification
    try {
      const res = await fetch(`/catways/${catwayNumber}/reservations/${editingReservation._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ clientName, boatName, startDate, endDate })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Erreur lors de la mise à jour de la réservation');
        return;
      }
      alert('Réservation mise à jour avec succès !');
      resetForm();
      fetchAllReservations();
    } catch (error) {
      alert('Erreur réseau : ' + error.message);
    }
  } else {
    // Création
    try {
      const res = await fetch(`/catways/${catwayNumber}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ clientName, boatName, startDate, endDate })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Erreur lors de la création de la réservation');
        return;
      }
      alert('Réservation créée avec succès !');
      e.target.reset();
      fetchAllReservations();
    } catch (error) {
      alert('Erreur réseau : ' + error.message);
    }
  }
});

/**
 * Réinitialise le formulaire après création ou modification.
 */
function resetForm() {
  editingReservation = null;
  const form = document.getElementById('reservationForm');
  form.reset();
  catwaySelect.disabled = false;
  catwaySelect.selectedIndex = 0;
  updateCatwayAvailability();
  document.getElementById('submitBtn').textContent = 'Enregistrer';
  document.getElementById('cancelBtn').style.display = 'none';
}

// Annuler la modification
document.getElementById('cancelBtn').addEventListener('click', resetForm);

/**
 * Événement de clic sur bouton "Modifier"
 * @param {Event} event 
 */
function onEditClick(event) {
  const tr = event.target.closest('tr');
  const id = tr.getAttribute('data-id');
  const catwayNumber = tr.getAttribute('data-catway');

  fetch(`/catways/${catwayNumber}/reservations/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.json())
    .then(reservation => {
      editingReservation = reservation;
      catwaySelect.value = reservation.catwayNumber;
      catwaySelect.disabled = true;
      document.getElementById('clientName').value = reservation.clientName;
      document.getElementById('boatName').value = reservation.boatName;
      startInput.value = reservation.startDate.slice(0,10);
      endInput.value = reservation.endDate.slice(0,10);

      document.getElementById('submitBtn').textContent = 'Mettre à jour';
      document.getElementById('cancelBtn').style.display = 'inline-block';
      updateCatwayAvailability();
    })
    .catch(() => alert('Impossible de récupérer la réservation'));
}

/**
 * Événement de clic sur bouton "Supprimer"
 * @param {Event} event 
 */
function onDeleteClick(event) {
  const tr = event.target.closest('tr');
  const id = tr.getAttribute('data-id');
  const catwayNumber = tr.getAttribute('data-catway');

  if (!confirm('Voulez-vous vraiment supprimer cette réservation ?')) return;

  fetch(`/catways/${catwayNumber}/reservations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    .then(res => {
      if (res.ok) {
        alert('Réservation supprimée');
        fetchAllReservations();
      } else {
        res.json().then(data => alert(data.message || 'Erreur lors de la suppression'));
      }
    })
    .catch(() => alert('Erreur réseau'));
}

/**
 * Remplit la liste déroulante des catways avec les numéros disponibles.
 * @param {Array} catways 
 */
function populateCatwaySelect(catways = []) {
  const previouslySelected = catwaySelect.value;
  const wasDisabled = catwaySelect.disabled;

  catwaySelect.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.textContent = 'Sélectionnez un catway';
  catwaySelect.appendChild(placeholder);

  catways
    .map(c => Number(c.catwayNumber))
    .filter(num => !Number.isNaN(num))
    .sort((a, b) => a - b)
    .forEach(num => {
      const option = document.createElement('option');
      option.value = num;
      option.dataset.catway = num;
      option.textContent = num;
      catwaySelect.appendChild(option);
    });

  if (previouslySelected && catways.some(c => String(c.catwayNumber) === String(previouslySelected))) {
    catwaySelect.value = previouslySelected;
    placeholder.selected = false;
  }

  catwaySelect.disabled = wasDisabled;
}

/**
 * Met à jour la disponibilité des catways en fonction des dates choisies.
 */
function updateCatwayAvailability() {
  if (!catwaysCache.length) return;

  const { ready, startDate, endDate } = getSelectedDateRange();
  if (!editingReservation) {
    catwaySelect.disabled = !ready;
    if (!ready) {
      catwaySelect.selectedIndex = 0;
    }
  }
  const options = catwaySelect.querySelectorAll('option[data-catway]');

  options.forEach(option => {
    option.disabled = false;
    option.classList.remove('text-muted');
  });

  if (!ready) {
    return;
  }

  reservationsByCatway.forEach((reservations, catwayNum) => {
    const option = catwaySelect.querySelector(`option[data-catway="${catwayNum}"]`);
    if (!option) return;

    const hasOverlap = reservations.some(reservation => {
      if (editingReservation && reservation._id === editingReservation._id) return false;
      const resStart = new Date(reservation.startDate);
      const resEnd = new Date(reservation.endDate);
      return resStart <= endDate && resEnd >= startDate;
    });

    if (hasOverlap) {
      option.disabled = true;
      option.classList.add('text-muted');
      if (catwaySelect.value === option.value && !catwaySelect.disabled) {
        catwaySelect.selectedIndex = 0;
      }
    }
  });
}

function getSelectedDateRange() {
  const startValue = startInput.value;
  const endValue = endInput.value;
  if (!startValue || !endValue) return { ready: false };

  const startDate = new Date(startValue);
  const endDate = new Date(endValue);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate >= endDate) {
    return { ready: false };
  }

  return { ready: true, startDate, endDate };
}

startInput.addEventListener('change', updateCatwayAvailability);
endInput.addEventListener('change', updateCatwayAvailability);

// Chargement initial
fetchAllReservations();
