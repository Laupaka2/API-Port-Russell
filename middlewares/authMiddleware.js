/**
 * @file middlewares/authMiddleware.js
 * @description Vérifie la présence et la validité d'un JWT dans l'en-tête Authorization.
 */

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Middleware qui protège les routes privées en validant le token JWT.
 * @param {import('express').Request} req - Requête entrante
 * @param {import('express').Response} res - Réponse sortante
 * @param {import('express').NextFunction} next - Callback Express
 * @returns {void}
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou mal formé' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
}

module.exports = authMiddleware;
