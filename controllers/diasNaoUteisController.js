// controllers/diasNaoUteisController.js
const pool = require('../config/db');

exports.getDiasNaoUteis = async (req, res) => {
    try {
        const [dias] = await pool.query('SELECT * FROM dias_nao_uteis ORDER BY data DESC');
        res.json(dias);
    } catch (err) {
        console.error("Erro ao buscar dias não úteis:", err);
        res.status(500).send('Erro no servidor');
    }
};

exports.adicionarDiaNaoUtil = async (req, res) => {
    const { data, descricao } = req.body;
    if (!data || !descricao) {
        return res.status(400).json({ msg: 'A data e a descrição são obrigatórias.' });
    }
    try {
        await pool.query('INSERT INTO dias_nao_uteis (data, descricao) VALUES (?, ?)', [data, descricao]);
        res.status(201).json({ msg: 'Dia não útil adicionado com sucesso.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ msg: 'Esta data já está cadastrada.' });
        }
        console.error("Erro ao adicionar dia não útil:", err);
        res.status(500).send('Erro no servidor');
    }
};

exports.deletarDiaNaoUtil = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM dias_nao_uteis WHERE id = ?', [id]);
        res.json({ msg: 'Dia não útil deletado com sucesso.' });
    } catch (err) {
        console.error("Erro ao deletar dia não útil:", err);
        res.status(500).send('Erro no servidor');
    }
};