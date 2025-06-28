// routes/perfilRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getPerfis, criarPerfil, atualizarPerfil, deletarPerfil } = require('../controllers/perfilController');

// Todas as rotas de perfis exigem autenticação
router.use(authMiddleware);

router.get('/', getPerfis);
router.post('/', criarPerfil);
router.put('/:id', atualizarPerfil);
router.delete('/:id', deletarPerfil);

module.exports = router;