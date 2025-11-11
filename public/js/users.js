/**
 * @file users.js
 * @description Gestion CRUD des utilisateurs (création, lecture, modification, suppression) avec affichage HTML.
 */

const token = localStorage.getItem('token');
if (!token) window.location.href = '/index.html';

const apiUrl = '/users';

// Éléments du DOM
const userListEl = document.getElementById('userList');
const createUserForm = document.getElementById('createUserForm');
const newUsernameEl = document.getElementById('newUsername');
const newEmailEl = document.getElementById('newEmail');

let editingUserEmail = null; // Email de l'utilisateur en cours de modification

// Déconnexion
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/index.html';
});

/**
 * Récupère et affiche tous les utilisateurs.
 * @async
 */
async function fetchUsers() {
  try {
    const res = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
    const users = await res.json();

    userListEl.innerHTML = users.map(user => `
      <li class="list-group-item d-flex justify-content-between align-items-center" data-email="${user.email}">
        ${user.username} – ${user.email}
        <span>
          <button class="btn btn-sm btn-warning editBtn">Modifier</button>
          <button class="btn btn-sm btn-danger ms-2 deleteBtn">Supprimer</button>
        </span>
      </li>
    `).join('');

    attachEventListeners();
  } catch (error) {
    console.error(error);
    alert('Erreur lors du chargement des utilisateurs.');
  }
}

/**
 * Récupère les détails d'un utilisateur par email.
 * @param {string} email
 * @returns {Promise<Object>} L'objet utilisateur
 */
async function fetchUser(email) {
  try {
    const res = await fetch(`${apiUrl}/${email}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Impossible de récupérer l\'utilisateur');
    return await res.json();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

/**
 * Crée un nouvel utilisateur ou met à jour un utilisateur existant.
 * @param {Event} e
 */
createUserForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = newUsernameEl.value.trim();
  const email = newEmailEl.value.trim();

  if (!username || !email) {
    alert('Veuillez remplir tous les champs');
    return;
  }

  try {
    let res;
    if (editingUserEmail) {
      // Mise à jour utilisateur
      res = await fetch(`${apiUrl}/${editingUserEmail}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username, email })
      });
    } else {
      // Création utilisateur
      res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username, email })
      });
    }

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Erreur lors de l’opération utilisateur');
      return;
    }

    alert(editingUserEmail ? 'Utilisateur mis à jour !' : 'Utilisateur créé !');
    resetForm();
    fetchUsers();
  } catch (error) {
    alert('Erreur réseau : ' + error.message);
  }
});

/**
 * Supprime un utilisateur.
 * @param {string} email
 */
async function deleteUser(email) {
  if (!confirm(`Voulez-vous vraiment supprimer l'utilisateur ${email} ?`)) return;
  try {
    const res = await fetch(`${apiUrl}/${email}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.message || 'Erreur lors de la suppression');
      return;
    }
    alert('Utilisateur supprimé !');
    fetchUsers();
  } catch (error) {
    alert('Erreur réseau : ' + error.message);
  }
}

/**
 * Prépare le formulaire pour modifier un utilisateur existant.
 * @param {string} email
 */
async function editUser(email) {
  const user = await fetchUser(email);
  if (!user) return;

  editingUserEmail = user.email;
  newUsernameEl.value = user.username;
  newEmailEl.value = user.email;
  newEmailEl.disabled = true;
  createUserForm.querySelector('button[type="submit"]').textContent = 'Mettre à jour';
}

/**
 * Réinitialise le formulaire de création/modification.
 */
function resetForm() {
  editingUserEmail = null;
  createUserForm.reset();
  newEmailEl.disabled = false;
  createUserForm.querySelector('button[type="submit"]').textContent = 'Créer';
}

/**
 * Attache les événements pour modifier et supprimer les utilisateurs.
 */
function attachEventListeners() {
  document.querySelectorAll('.editBtn').forEach(btn => {
    btn.addEventListener('click', e => {
      const li = e.target.closest('li');
      const email = li.getAttribute('data-email');
      editUser(email);
    });
  });

  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', e => {
      const li = e.target.closest('li');
      const email = li.getAttribute('data-email');
      deleteUser(email);
    });
  });
}

// Chargement initial
fetchUsers();
