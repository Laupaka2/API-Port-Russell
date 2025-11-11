const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

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

// Documentation statique Swagger
app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 10000; // ⚠️ Render utilise un port dynamique
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
