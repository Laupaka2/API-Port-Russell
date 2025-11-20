/**
 * @file routes/authRoutes.js
 * @description Routes d'authentification (login/logout) et utilitaires associés.
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

/**
 * Authentifie un utilisateur et renvoie un JWT.
 * @route POST /auth/login
 * @param {express.Request} req - Doit contenir email et password
 * @param {express.Response} res - Réponse JSON avec token et user
 * @returns {Promise<void>}
 */
router.post('/login', async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  email = email.toLowerCase();

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Générer token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // Renvoyer token + infos utilisateur
    res.json({
      token,
      user: {
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Erreur lors de la connexion:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Point de terminaison de déconnexion (stateless).
 * @route GET /auth/logout
 * @param {express.Request} _req
 * @param {express.Response} res
 */
router.get('/logout', (req, res) => {
  res.json({ message: 'Déconnecté' });
});

/**
 * Route de debug listant tous les utilisateurs (non protégée, à désactiver en prod).
 * @route GET /auth/debug
 * @param {express.Request} _req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.get('/debug', async (req, res) => {
  try {
    const allUsers = await User.find();
    res.json(allUsers);
  } catch (err) {
    console.error('Erreur dans /auth/debug:', err);
    res.status(500).json({ message: 'Erreur serveur debug' });
  }
});

module.exports = router;
