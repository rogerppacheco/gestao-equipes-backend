// controllers/motivoController.js
const pool = require('../config/db');

exports.getMotivos = async (req, res) => {
    try {
        const [motivos] = await pool.query('SELECT * FROM motivos_ausencia ORDER BY motivo');
        res.json(motivos);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

// @desc    Criar um novo motivo (VERSÃO CORRIGIDA)
exports.criarMotivo = async (req, res) => {
    // Agora também recebemos 'gera_desconto' do frontend
    const { motivo, gera_desconto } = req.body;
    if (!motivo) {
        return res.status(400).json({ msg: 'O nome do motivo é obrigatório.' });
    }
    try {
        // A query SQL agora inclui a coluna 'gera_desconto'
        const [result] = await pool.query(
            'INSERT INTO motivos_ausencia (motivo, gera_desconto) VALUES (?, ?)', 
            [motivo, gera_desconto]
        );
        res.status(201).json({ id: result.insertId, motivo, gera_desconto });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

// @desc    Atualizar um perfil (VERSÃO CORRIGIDA)
exports.atualizarMotivo = async (req, res) => {
    const { id } = req.params;
    // Agora também recebemos 'gera_desconto' do frontend
    const { motivo, gera_desconto } = req.body;
    if (!motivo) {
        return res.status(400).json({ msg: 'O nome do motivo é obrigatório.' });
    }
    try {
        // A query SQL agora atualiza também a coluna 'gera_desconto'
        await pool.query(
            'UPDATE motivos_ausencia SET motivo = ?, gera_desconto = ? WHERE id = ?', 
            [motivo, gera_desconto, id]
        );
        res.json({ msg: 'Motivo atualizado com sucesso.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

// @desc    Deletar um motivo
exports.deletarMotivo = async (req, res) => {
    const { id } = req.params;
    try {
        const [registros] = await pool.query('SELECT COUNT(*) as count FROM registros_presenca WHERE motivo_id = ?', [id]);
        if (registros[0].count > 0) {
            return res.status(400).json({ msg: 'Não é possível excluir. Este motivo já foi usado em um lançamento.' });
        }
        await pool.query('DELETE FROM motivos_ausencia WHERE id = ?', [id]);
        res.json({ msg: 'Motivo deletado com sucesso.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};