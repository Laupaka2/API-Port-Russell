/**
 * @file models/Catway.js
 * @description Modèle Mongoose représentant un catway (ponton) du port.
 */

const mongoose = require('mongoose');

/**
 * Schéma d'un catway, identifié par un numéro unique et décrit par son type et son état.
 * @type {mongoose.Schema}
 */
const catwaySchema = new mongoose.Schema({
  catwayNumber: { type: String, unique: true, required: true },
  catwayType: { type: String, enum: ['long', 'short'], required: true },
  catwayState: { type: String, required: true }
});

module.exports = mongoose.model('Catway', catwaySchema);
