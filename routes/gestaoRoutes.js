// routes/gestaoRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Importa todas as funções necessárias do controller
const { 
    criarUsuario, 
    getSupervisores, 
    getUsuario, 
    atualizarUsuario,
    getUsuariosAtivos, 
    getUsuariosInativos, 
    inativarUsuario, 
    reativarUsuario
} = require('../controllers/gestaoController');

// Protege todas as rotas de gestão, exigindo um token válido
router.use(authMiddleware);

// --- Rotas para Gestão de Usuários ---

// Rota para CRIAR um novo usuário
router.post('/usuarios', criarUsuario);

// Rota para LISTAR os usuários ATIVOS
router.get('/usuarios/ativos', getUsuariosAtivos);

// Rota para LISTAR os usuários INATIVOS
router.get('/usuarios/inativos', getUsuariosInativos);

// Rota para BUSCAR um usuário específico pelo ID (para edição)
router.get('/usuarios/:id', getUsuario);

// Rota para ATUALIZAR um usuário existente
router.put('/usuarios/:id', atualizarUsuario);

// Rota para REATIVAR um usuário
router.put('/usuarios/:id/reativar', reativarUsuario);

// Rota para INATIVAR um usuário (usando o método DELETE)
// >>> ESTA É A LINHA CORRIGIDA <<<
router.delete('/usuarios/:id', inativarUsuario); 

// Rota auxiliar para listar supervisores no formulário
router.get('/supervisores', getSupervisores);

router.get('/vendedores', auth, listarVendedores);

module.exports = router;