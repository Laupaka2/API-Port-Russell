/**
 * @file reservations.js
 * @description Gestion CRUD des réservations pour chaque catway, avec
 * affichage dynamique dans le tableau HTML et validation des dates.
 */

const token = localStorage.getItem('token');
if (!token) window.location.href = '/index.html';

const catwaySelect = document.getElementById('catwayNumber');
let editingReservation = null;

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

    const allReservations = [];
    // Récupère les réservations pour chaque catway
    for (const c of catways) {
      const res = await fetch(`/catways/${c.catwayNumber}/reservations`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) continue;
      const reservations = await res.json();
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
      document.getElementById('startDate').value = reservation.startDate.slice(0,10);
      document.getElementById('endDate').value = reservation.endDate.slice(0,10);

      document.getElementById('submitBtn').textContent = 'Mettre à jour';
      document.getElementById('cancelBtn').style.display = 'inline-block';
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

// Chargement initial
fetchAllReservations();
