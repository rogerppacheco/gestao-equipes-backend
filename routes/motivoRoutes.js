// routes/motivoRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMotivos, criarMotivo, atualizarMotivo, deletarMotivo } = require('../controllers/motivoController');

router.use(authMiddleware);

router.route('/')
    .get(getMotivos)
    .post(criarMotivo);

router.route('/:id')
    .put(atualizarMotivo)
    .delete(deletarMotivo);

module.exports = router;