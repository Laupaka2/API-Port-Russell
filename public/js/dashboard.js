/**
 * @file dashboard.js
 * @description Gestion du tableau de bord : affichage des informations utilisateur,
 * liste des catways et tri des réservations par statut (passé, en cours, futur).
 */

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token) window.location.href = '/index.html';

const userInfoEl = document.getElementById('userInfo');
const todayDateEl = document.getElementById('todayDate');

/**
 * Affiche les informations de l'utilisateur connecté et la date du jour.
 */
if (user) {
  userInfoEl.textContent = `${user.username} (${user.email})`;
  todayDateEl.textContent = new Date().toLocaleDateString();
}

/**
 * Déconnexion de l'utilisateur.
 */
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
});

/**
 * Récupère la liste des catways depuis l'API et met à jour le tableau HTML.
 * @async
 * @throws {Error} Si la récupération échoue
 */
async function fetchCatways() {
  try {
    const res = await fetch('/catways', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Erreur lors de la récupération des catways');

    const catways = await res.json();
    const catwayTable = document.getElementById('catwayTable').querySelector('tbody');

    catwayTable.innerHTML = catways.map(catway => `
      <tr>
        <td>${catway.catwayNumber}</td>
        <td>${catway.catwayType}</td>
        <td>${catway.catwayState}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error(error);
    alert('Erreur lors du chargement des catways.');
  }
}

/**
 * Récupère toutes les réservations depuis l'API et les trie en trois tableaux
 * : en cours, à venir, passées. Applique des classes Bootstrap pour les couleurs.
 * @async
 */
async function fetchReservations() {
  try {
    const res = await fetch('/reservations', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Erreur lors de la récupération des réservations');

    const reservations = await res.json();
    const today = new Date();

    const currentTable = document.getElementById('reservationCurrent').querySelector('tbody');
    const futureTable = document.getElementById('reservationFuture').querySelector('tbody');
    const pastTable = document.getElementById('reservationPast').querySelector('tbody');

    currentTable.innerHTML = '';
    futureTable.innerHTML = '';
    pastTable.innerHTML = '';

    reservations.forEach(r => {
      const startDate = new Date(r.startDate);
      const endDate = new Date(r.endDate);

      let rowClass = '';
      let targetTable;

      if (endDate < today) {
        rowClass = 'table-secondary';
        targetTable = pastTable;
      } else if (startDate > today) {
        rowClass = 'table-info';
        targetTable = futureTable;
      } else {
        rowClass = 'table-success';
        targetTable = currentTable;
      }

      const rowHTML = `
        <tr class="${rowClass}">
          <td>${r.catwayNumber}</td>
          <td>${r.clientName}</td>
          <td>${r.boatName}</td>
          <td>${startDate.toLocaleDateString()}</td>
          <td>${endDate.toLocaleDateString()}</td>
        </tr>
      `;
      targetTable.innerHTML += rowHTML;
    });

  } catch (error) {
    console.error(error);
    alert('Erreur lors du chargement des réservations.');
  }
}

// Chargement initial
fetchCatways();
fetchReservations();
