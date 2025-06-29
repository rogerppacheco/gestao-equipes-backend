// controllers/perfilController.js
const pool = require('../config/db');

// @desc    Buscar todos os perfis
exports.getPerfis = async (req, res) => {
    try {
        const [perfis] = await pool.query('SELECT * FROM perfis ORDER BY nome');
        res.json(perfis);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

// @desc    Criar um novo perfil
exports.criarPerfil = async (req, res) => {
    const { nome } = req.body;
    if (!nome) {
        return res.status(400).json({ msg: 'O nome do perfil é obrigatório.' });
    }
    try {
        const [result] = await pool.query('INSERT INTO perfis (nome) VALUES (?)', [nome]);
        res.status(201).json({ id: result.insertId, nome });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

// @desc    Atualizar um perfil
exports.atualizarPerfil = async (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome) {
        return res.status(400).json({ msg: 'O nome do perfil é obrigatório.' });
    }
    try {
        await pool.query('UPDATE perfis SET nome = ? WHERE id = ?', [nome, id]);
        res.json({ msg: 'Perfil atualizado com sucesso.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

// @desc    Deletar um perfil
exports.deletarPerfil = async (req, res) => {
    const { id } = req.params;
    try {
        // Adicionar verificação se o perfil está em uso antes de deletar
        const [usuarios] = await pool.query('SELECT COUNT(*) as count FROM usuarios WHERE perfil_id = ?', [id]);
        if (usuarios[0].count > 0) {
            return res.status(400).json({ msg: 'Não é possível excluir. Este perfil está em uso por um ou mais usuários.' });
        }

        await pool.query('DELETE FROM perfis WHERE id = ?', [id]);
        res.json({ msg: 'Perfil deletado com sucesso.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};