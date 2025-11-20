/**
 * @file app.js
 * @description Point d'entrée de l'application Express : configuration du moteur EJS,
 * connexions MongoDB, exposition des routes API et des pages frontend.
 */

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

// Configuration du moteur de templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Connexion MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connecté à MongoDB Atlas'))
  .catch(err => console.error('❌ Erreur MongoDB:', err.message));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const catwayRoutes = require('./routes/catwayRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

// Middleware d’authentification
const authMiddleware = require('./middlewares/authMiddleware');

// Routes API
app.use('/auth', authRoutes);
app.use('/users', authMiddleware, userRoutes);
app.use('/catways', authMiddleware, catwayRoutes);
app.use('/catways/:id/reservations', authMiddleware, reservationRoutes);
app.use('/reservations', authMiddleware, require('./routes/reservations.global.routes'));

/**
 * Fabrique un middleware Express qui rend la vue EJS fournie.
 * @param {string} viewName - Nom du template EJS à rendre
 * @returns {(req: express.Request, res: express.Response) => void}
 */
const renderView = viewName => (req, res) => res.render(viewName);

app.get(['/', '/index', '/index.html'], renderView('index'));
app.get(['/dashboard', '/dashboard.html'], renderView('dashboard'));
app.get(['/catways-ui', '/catways.html'], renderView('catways'));
app.get(['/reservations-ui', '/reservations.html'], renderView('reservations'));
app.get(['/users-ui', '/users.html'], renderView('users'));
app.get(['/docs', '/docs.html'], renderView('docs'));

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 10000; // ⚠️ Render utilise un port dynamique
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
