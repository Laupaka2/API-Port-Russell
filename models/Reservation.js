/**
 * @file models/Reservation.js
 * @description Modèle Mongoose stockant les réservations attribuées aux catways.
 */

const mongoose = require('mongoose');

/**
 * Schéma d'une réservation : catway concerné, client, bateau et période.
 * @type {mongoose.Schema}
 */
const reservationSchema = new mongoose.Schema({
  catwayNumber: { type: String, required: true },
  clientName: { type: String, required: true },
  boatName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

module.exports = mongoose.model('Reservation', reservationSchema);
