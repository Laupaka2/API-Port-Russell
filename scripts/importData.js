// scripts/importData.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Catway = require('../models/Catway');
const Reservation = require('../models/Reservation');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('✅ Connexion MongoDB réussie');

  const catwaysData = JSON.parse(fs.readFileSync('./data/catways.json', 'utf-8'));
  const reservationsData = JSON.parse(fs.readFileSync('./data/reservations.json', 'utf-8'));

  await Catway.deleteMany();
  await Reservation.deleteMany();

  await Catway.insertMany(catwaysData);
  await Reservation.insertMany(reservationsData);

  console.log(' Données importées avec succès !');
  process.exit();
}).catch(err => {
  console.error(' Erreur de connexion MongoDB :', err);
  process.exit(1);
});
