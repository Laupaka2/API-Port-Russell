/**
 * @file routes/reservations.global.routes.js
 * @description Route utilitaire pour consulter l'ensemble des réservations (tous catways).
 */

const express = require('express');
const Reservation = require('../models/Reservation');

const router = express.Router();

/**
 * Retourne toutes les réservations enregistrées.
 * @route GET /reservations
 * @param {express.Request} _req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;