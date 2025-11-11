/**
 * @file login.js
 * @description Gestion de l'authentification des utilisateurs pour le Port de Russell.
 * Permet la connexion via email et mot de passe, et stocke le token et les informations utilisateur.
 */

/**
 * Gestionnaire de soumission du formulaire de connexion.
 * @async
 * @param {Event} e - L'événement de soumission du formulaire.
 */
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  /** @type {string} Email de l'utilisateur (normalisé en minuscules) */
  const email = document.getElementById('email').value.toLowerCase();

  /** @type {string} Mot de passe de l'utilisateur */
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      /**
       * @type {{ token: string, user: { username: string, email: string } }}
       */
      const data = await response.json();

      // Stockage des informations dans le localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirection vers le tableau de bord
      window.location.href = '/dashboard.html';
    } else {
      /**
       * @type {{ message?: string }}
       */
      const err = await response.json();
      const loginError = document.getElementById('loginError');
      loginError.textContent = err.message || 'Erreur de connexion';
      loginError.style.display = 'block';
    }
  } catch (error) {
    const loginError = document.getElementById('loginError');
    loginError.textContent = 'Erreur réseau : ' + error.message;
    loginError.style.display = 'block';
  }
});
