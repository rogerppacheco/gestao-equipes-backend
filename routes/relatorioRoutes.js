// routes/relatorioRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const { 
    getRelatorioSemanal, 
    getPrevisaoPagamento,
    getRelatorioDescontos
} = require('../controllers/relatorioController');

// Protege todas as rotas de relatórios
router.use(authMiddleware);

// Rota para o relatório final consolidado
router.get('/semanal', getRelatorioSemanal);

// Rota para o relatório de previsão de custos
router.get('/previsao', getPrevisaoPagamento);

// Rota para o relatório detalhado de descontos
router.get('/descontos', getRelatorioDescontos);

module.exports = router;