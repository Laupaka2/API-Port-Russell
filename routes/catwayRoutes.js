/**
 * @file routes/catwayRoutes.js
 * @description Routes REST pour gérer les catways (CRUD complet).
 */

const express = require('express');
const Catway = require('../models/Catway');

const router = express.Router();

/**
 * Liste tous les catways.
 * @route GET /catways
 * @param {express.Request} _req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.get('/', async (req, res) => {
  try {
    const catways = await Catway.find();
    res.json(catways);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Récupère un catway à partir de son numéro.
 * @route GET /catways/:id
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.get('/:id', async (req, res) => {
  try {
    const catway = await Catway.findOne({ catwayNumber: req.params.id.toString() });
    if (!catway) return res.status(404).json({ message: 'Catway non trouvé' });
    res.json(catway);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Crée un nouveau catway après validation des champs requis.
 * @route POST /catways
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.post('/', async (req, res) => {
  try {
    const { catwayNumber, catwayType, catwayState } = req.body;
    if (!catwayNumber || !catwayType || !catwayState) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const exists = await Catway.findOne({ catwayNumber: catwayNumber.toString() });
    if (exists) {
      return res.status(409).json({ message: 'Numéro de catway déjà utilisé' });
    }

    const catway = new Catway({
      catwayNumber: catwayNumber.toString(),
      catwayType,
      catwayState
    });

    await catway.save();
    res.status(201).json({ message: 'Catway créé', catway });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Met à jour l'état d'un catway existant.
 * @route PUT /catways/:id
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.put('/:id', async (req, res) => {
  try {
    const { catwayState } = req.body;
    if (!catwayState || typeof catwayState !== 'string') {
      return res.status(400).json({ message: 'catwayState est requis et doit être une chaîne' });
    }

    const catway = await Catway.findOne({ catwayNumber: req.params.id.toString() });
    if (!catway) return res.status(404).json({ message: 'Catway non trouvé' });

    catway.catwayState = catwayState;
    await catway.save();

    res.json({ message: 'Catway mis à jour', catway });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Supprime un catway à partir de son numéro.
 * @route DELETE /catways/:id
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await Catway.deleteOne({ catwayNumber: req.params.id.toString() });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Catway non trouvé' });
    }
    res.json({ message: 'Catway supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
