/**
 * @file catways.js
 * @description Gestion CRUD des catways (création, lecture, mise à jour, suppression)
 * et affichage dans la table HTML.
 */

const token = localStorage.getItem('token');
if (!token) window.location.href = '/';

const apiUrl = '/catways';
const logoutBtn = document.getElementById('logoutBtn');
const createCatwayForm = document.getElementById('createCatwayForm');
const catwaysTableBody = document.querySelector('#catwaysTable tbody');
const editModalEl = document.getElementById('editModal');
const editModal = new bootstrap.Modal(editModalEl);
const editCatwayForm = document.getElementById('editCatwayForm');

let editingCatwayNumber = null;

// Déconnexion
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/';
});

/**
 * Récupère tous les catways et les affiche dans le tableau.
 * @async
 */
async function fetchCatways() {
  try {
    const res = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Erreur API: ' + res.status);

    const catways = await res.json();
    catwaysTableBody.innerHTML = '';

    catways.forEach(catway => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${catway.catwayNumber}</td>
        <td>${catway.catwayType}</td>
        <td>${catway.catwayState}</td>
        <td>
          <button class="btn btn-sm btn-info btn-detail" data-number="${catway.catwayNumber}">Détail / Modifier</button>
          <button class="btn btn-sm btn-danger btn-delete ms-2" data-number="${catway.catwayNumber}">Supprimer</button>
        </td>
      `;
      catwaysTableBody.appendChild(tr);
    });

  } catch (error) {
    console.error(error);
    alert('Erreur lors du chargement des catways.');
  }
}

/**
 * Création d’un nouveau catway
 * @async
 * @param {Event} e - Événement de soumission du formulaire
 */
createCatwayForm.addEventListener('submit', async e => {
  e.preventDefault();

  const catwayNumber = parseInt(document.getElementById('catwayNumber').value.trim(), 10);
  const catwayType = document.getElementById('catwayType').value.trim();
  const catwayState = document.getElementById('catwayState').value.trim();

  if (!catwayNumber || !catwayType || !catwayState) {
    alert('Veuillez remplir tous les champs');
    return;
  }

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ catwayNumber, catwayType, catwayState })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.message || 'Erreur lors de la création du catway');
      return;
    }

    alert('Catway créé avec succès !');
    createCatwayForm.reset();
    fetchCatways();
  } catch (error) {
    alert('Erreur réseau : ' + error.message);
  }
});

// Event delegation pour boutons Détail / Supprimer
catwaysTableBody.addEventListener('click', event => {
  if (event.target.classList.contains('btn-detail')) {
    openEditModal(event.target.getAttribute('data-number'));
  } else if (event.target.classList.contains('btn-delete')) {
    deleteCatway(event.target.getAttribute('data-number'));
  }
});

/**
 * Ouvre le modal pour modifier un catway existant
 * @async
 * @param {number} catwayNumber - Numéro du catway à modifier
 */
async function openEditModal(catwayNumber) {
  editingCatwayNumber = parseInt(catwayNumber, 10);
  try {
    const res = await fetch(`${apiUrl}/${editingCatwayNumber}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erreur API: ' + res.status);

    const catway = await res.json();
    document.getElementById('editCatwayNumber').value = catway.catwayNumber;
    document.getElementById('editCatwayType').value = catway.catwayType;
    document.getElementById('editCatwayState').value = catway.catwayState;

    editModal.show();
  } catch (error) {
    console.error(error);
    alert('Erreur lors du chargement du catway');
  }
}

/**
 * Sauvegarde la modification d'un catway
 * @async
 * @param {Event} e - Événement de soumission du formulaire
 */
editCatwayForm.addEventListener('submit', async e => {
  e.preventDefault();

  const catwayState = document.getElementById('editCatwayState').value.trim();
  if (!catwayState) {
    alert("L'état ne peut pas être vide.");
    return;
  }

  try {
    const res = await fetch(`${apiUrl}/${editingCatwayNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ catwayState })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.message || 'Erreur lors de la mise à jour du catway');
      return;
    }

    alert('Catway mis à jour avec succès !');
    editModal.hide();
    fetchCatways();
  } catch (error) {
    alert('Erreur réseau : ' + error.message);
  }
});

/**
 * Supprime un catway
 * @async
 * @param {number} catwayNumber - Numéro du catway à supprimer
 */
async function deleteCatway(catwayNumber) {
  if (!confirm(`Confirmez-vous la suppression du catway numéro ${catwayNumber} ?`)) return;

  try {
    const res = await fetch(`${apiUrl}/${parseInt(catwayNumber, 10)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.message || 'Erreur lors de la suppression');
      return;
    }

    alert('Catway supprimé avec succès !');
    fetchCatways();
  } catch (error) {
    alert('Erreur réseau : ' + error.message);
  }
}

// Chargement initial
fetchCatways();
