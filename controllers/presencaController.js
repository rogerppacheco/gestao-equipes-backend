// controllers/presencaController.js
const pool = require('../Config/db');

// @route   GET api/presenca/minha-equipe
// @desc    Buscar todos os vendedores da equipe do supervisor logado
exports.getMinhaEquipe = async (req, res) => {
    try {
        // req.user.id vem do token JWT, que o nosso middleware de autenticação decodificou
        const supervisorId = req.user.id; 
        
        const [vendedores] = await pool.query(
            'SELECT id, nome_completo FROM usuarios WHERE supervisor_id = ? AND status = TRUE', 
            [supervisorId]
        );

        res.json(vendedores);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor.');
    }
};

// @route   POST api/presenca
// @desc    Lançar presença ou ausência para um vendedor
// Em controllers/presencaController.js
// Substitua a função lancarPresenca por esta:
exports.lancarPresenca = async (req, res) => {
    const { vendedorId, data, status, motivoId, observacao } = req.body;
    const lancadoPorId = req.user.id;

    if (!vendedorId || !data || !status) {
        return res.status(400).json({ msg: 'Dados incompletos.' });
    }

    try {
        const sql = `
            INSERT INTO registros_presenca (vendedor_id, data, status, motivo_id, observacao, lancado_por_id)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            status = VALUES(status), 
            motivo_id = VALUES(motivo_id), 
            observacao = VALUES(observacao), 
            lancado_por_id = VALUES(lancado_por_id);
        `;
        
        // Passa o motivoId para a query (será null se não for ausência)
        await pool.query(sql, [vendedorId, data, status, motivoId || null, observacao, lancadoPorId]);

        res.json({ msg: 'Presença registrada com sucesso.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor.');
    }
};