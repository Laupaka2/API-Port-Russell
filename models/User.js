/**
 * @file models/User.js
 * @description Modèle Mongoose représentant un utilisateur de la capitainerie.
 */

const mongoose = require('mongoose');

/**
 * Schéma utilisateur : nom, email unique et mot de passe hashé.
 * @type {mongoose.Schema}
 */
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);