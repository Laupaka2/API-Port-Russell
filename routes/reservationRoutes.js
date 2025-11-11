const express = require('express');
const Reservation = require('../models/Reservation');
const Catway = require('../models/Catway');

const router = express.Router({ mergeParams: true });

// GET all reservations for a catway
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

// GET reservation by idReservation with catway check
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

// POST create reservation for a catway
router.post('/', async (req, res) => {
  try {
    const catwayNumber = req.params.id;
    const catway = await Catway.findOne({ catwayNumber });
    if (!catway) return res.status(404).json({ message: 'Catway non trouvé' });

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

// PUT update a reservation by idReservation with catway check
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

// DELETE reservation by idReservation with catway check
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
