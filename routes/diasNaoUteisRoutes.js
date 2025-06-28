// routes/diasNaoUteisRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getDiasNaoUteis, adicionarDiaNaoUtil, deletarDiaNaoUtil } = require('../controllers/diasNaoUteisController');

router.use(authMiddleware);

router.route('/')
    .get(getDiasNaoUteis)
    .post(adicionarDiaNaoUtil);

router.delete('/:id', deletarDiaNaoUtil);

module.exports = router;