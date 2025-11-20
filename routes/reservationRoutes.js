/**
 * @file routes/reservationRoutes.js
 * @description Routes imbriquées pour gérer les réservations liées à un catway précis.
 */

const express = require('express');
const Reservation = require('../models/Reservation');
const Catway = require('../models/Catway');
const catwaySeed = require('../data/catways.json');

const router = express.Router({ mergeParams: true });

/**
 * Retourne toutes les réservations pour un catway donné.
 * @route GET /catways/:id/reservations
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.get('/', async (req, res) => {
  try {
    const catwayNumber = req.params.id;
    const catway = await Catway.findOne({ catwayNumber });
    if (!catway) return res.status(404).json({ message: 'Catway non trouvé' });

    const reservations = await Reservation.find({ catwayNumber });
    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Retourne une réservation spécifique après vérification du catway parent.
 * @route GET /catways/:id/reservations/:idReservation
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.get('/:idReservation', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.idReservation);
    if (!reservation) return res.status(404).json({ message: 'Réservation non trouvée' });

    if (reservation.catwayNumber.toString() !== req.params.id) {
      return res.status(404).json({ message: 'Réservation non trouvée pour ce catway' });
    }

    res.json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Crée une réservation pour un catway (en le créant automatiquement s'il n'existe pas encore).
 * @route POST /catways/:id/reservations
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.post('/', async (req, res) => {
  try {
    const rawCatwayNumber = Number(req.params.id);
    if (!Number.isInteger(rawCatwayNumber) || rawCatwayNumber <= 0) {
      return res.status(400).json({ message: 'Numéro de catway invalide' });
    }

    const catwayNumber = rawCatwayNumber.toString();
    let catway = await Catway.findOne({ catwayNumber });

    if (!catway) {
      const seedCatway = catwaySeed.find(c => Number(c.catwayNumber) === rawCatwayNumber);
      if (!seedCatway) {
        return res.status(404).json({ message: 'Catway introuvable dans la configuration du port' });
      }

      catway = new Catway({
        catwayNumber,
        catwayType: seedCatway.catwayType,
        catwayState: seedCatway.catwayState
      });
      await catway.save();
    }

    const { clientName, boatName, startDate, endDate } = req.body;
    if (!clientName || !boatName || !startDate || !endDate) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'La date de début doit être avant la date de fin' });
    }

    const newReservation = new Reservation({
      catwayNumber,
      clientName,
      boatName,
      startDate,
      endDate
    });
    await newReservation.save();

    res.status(201).json({ message: 'Réservation créée', reservation: newReservation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Met à jour une réservation existante (client, bateau ou dates).
 * @route PUT /catways/:id/reservations/:idReservation
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.put('/:idReservation', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.idReservation);
    if (!reservation) return res.status(404).json({ message: 'Réservation non trouvée' });

    if (reservation.catwayNumber.toString() !== req.params.id) {
      return res.status(404).json({ message: 'Réservation non trouvée pour ce catway' });
    }

    const { clientName, boatName, startDate, endDate } = req.body;

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'La date de début doit être avant la date de fin' });
    }

    if (clientName) reservation.clientName = clientName;
    if (boatName) reservation.boatName = boatName;
    if (startDate) reservation.startDate = startDate;
    if (endDate) reservation.endDate = endDate;

    await reservation.save();

    res.json({ message: 'Réservation mise à jour', reservation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Supprime une réservation après vérification de son appartenance au catway fourni.
 * @route DELETE /catways/:id/reservations/:idReservation
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.delete('/:idReservation', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.idReservation);
    if (!reservation) return res.status(404).json({ message: 'Réservation non trouvée' });

    if (reservation.catwayNumber.toString() !== req.params.id) {
      return res.status(404).json({ message: 'Réservation non trouvée pour ce catway' });
    }

    await reservation.deleteOne();

    res.json({ message: 'Réservation supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
