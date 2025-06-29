const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { registrarPresenca, listarMinhaEquipe } = require('../controllers/presencaController'); // Importe a nova função

// @route   POST api/presenca
// @desc    Registrar ou atualizar a presença de um usuário
// @access  Private (Supervisor, Diretoria)
router.post('/', auth, registrarPresenca);

// @route   GET api/presenca/minha-equipe
// @desc    Obter a lista de vendedores da equipe do usuário logado
// @access  Private (Supervisor, Diretoria)
router.get('/minha-equipe', auth, listarMinhaEquipe); // Esta linha deve ser adicionada/verificada

module.exports = router;