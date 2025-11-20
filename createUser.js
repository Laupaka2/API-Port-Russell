/**
 * @file createUser.js
 * @description Script utilitaire pour insérer un utilisateur par défaut dans la base MongoDB.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

/**
 * Crée un utilisateur administrateur préconfiguré dans la base MongoDB.
 * @async
 * @returns {Promise<void>}
 */
async function createUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion à MongoDB réussie');

    const hashedPassword = await bcrypt.hash('22101992', 10);

    const newUser = new User({
      username: 'jeremy',
      email: 'jeremy.beaugendre@gmail.com',
      password: hashedPassword,
    });

    await newUser.save();
    console.log('✅ Utilisateur créé avec succès :', newUser);

    mongoose.connection.close();
    console.log('🔌 Déconnexion de MongoDB');
  } catch (error) {
    console.error('❌ Erreur lors de la création de l’utilisateur :', error.message);
    mongoose.connection.close();
  }
}

createUser();
