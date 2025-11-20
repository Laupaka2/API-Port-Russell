/**
 * @file routes/userRoutes.js
 * @description Routes REST pour la gestion des utilisateurs de la capitainerie.
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

/**
 * Retourne la liste de tous les utilisateurs (sans mot de passe).
 * @route GET /users
 * @param {express.Request} _req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // on exclut le mdp
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Retourne les détails d'un utilisateur identifié par son email.
 * @route GET /users/:email
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.get('/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }, '-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Crée un nouvel utilisateur après validation de l'unicité de l'email.
 * @route POST /users
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Utilisateur créé', user: { username, email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Met à jour le nom ou le mot de passe d'un utilisateur identifié par email.
 * @route PUT /users/:email
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.put('/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const { username, password } = req.body;

    if (username) user.username = username;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({ message: 'Utilisateur mis à jour', user: { username: user.username, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Supprime un utilisateur à partir de son email.
 * @route DELETE /users/:email
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.delete('/:email', async (req, res) => {
  try {
    const result = await User.deleteOne({ email: req.params.email });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
