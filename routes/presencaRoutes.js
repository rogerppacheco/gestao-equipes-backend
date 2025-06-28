// routes/presencaRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMinhaEquipe, lancarPresenca } = require('../controllers/presencaController');

// As rotas abaixo só podem ser acessadas por usuários autenticados (com token válido)
router.get('/minha-equipe', authMiddleware, getMinhaEquipe);
router.post('/', authMiddleware, lancarPresenca);

module.exports = router;