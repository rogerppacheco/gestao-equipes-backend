const pool = require('../config/db');

// @desc    Registrar ou atualizar a presença de um usuário (vendedor)
// @route   POST /api/presenca
// @access  Private (Supervisor, Diretoria)
exports.registrarPresenca = async (req, res) => {
    const { usuarioId, data, status, motivoId, observacao } = req.body;

    // Validação inicial mais explícita no backend
    // 'status' deve ser um booleano, não string.
    if (!usuarioId || !data || typeof status !== 'boolean') {
        console.error('Validação de dados falhou: ', { usuarioId, data, status });
        return res.status(400).json({ msg: 'Dados de presença (usuarioId, data, status) incompletos ou inválidos.' });
    }

    // Se o status for ausente (false), motivoId deve ser fornecido e não nulo/vazio
    if (status === false && !motivoId) {
        return res.status(400).json({ msg: 'Motivo da ausência é obrigatório.' });
    }

    try {
        // Verifica se o usuário que está registrando tem permissão (Supervisor ou Diretoria)
        const userPerfil = req.user.perfil;
        if (userPerfil !== 'Supervisor' && userPerfil !== 'Diretoria') {
            return res.status(403).json({ msg: 'Acesso negado. Você não tem permissão para registrar presenças.' });
        }

        // Antes de inserir/atualizar, verifique se já existe um registro para o usuário e data
        const [existingPresenca] = await pool.query(
            'SELECT id FROM presencas WHERE usuario_id = ? AND data = ?',
            [usuarioId, data]
        );

        let sql;
        let params;

        if (existingPresenca.length > 0) {
            // Se já existe, atualiza
            sql = `
                UPDATE presencas
                SET status = ?, motivo_id = ?, observacao = ?, ultima_atualizacao = NOW()
                WHERE id = ?
            `;
            // Se o status for presente (true), motivo_id e observacao devem ser NULL
            params = [
                status,
                status ? null : motivoId, // Se presente, motivo_id é NULL
                status ? null : (observacao || null), // Se presente, observacao é NULL; se ausente mas vazio, também NULL
                existingPresenca[0].id
            ];
        } else {
            // Se não existe, insere
            sql = `
                INSERT INTO presencas (usuario_id, data, status, motivo_id, observacao)
                VALUES (?, ?, ?, ?, ?)
            `;
            params = [
                usuarioId,
                data,
                status,
                status ? null : motivoId, // Se presente, motivo_id é NULL
                status ? null : (observacao || null) // Se presente, observacao é NULL; se ausente mas vazio, também NULL
            ];
        }

        await pool.query(sql, params);
        res.json({ msg: 'Presença registrada/atualizada com sucesso!' });

    } catch (err) {
        console.error('ERRO INTERNO NO SERVIDOR ao registrar presença:', err.message);
        res.status(500).send('Erro no servidor');
    }
};

// @desc    Obter a lista de vendedores da equipe do usuário logado
// @route   GET /api/presenca/minha-equipe
// @access  Private (Supervisor, Diretoria)
exports.listarMinhaEquipe = async (req, res) => {
    try {
        const userPerfil = req.user.perfil;
        if (userPerfil !== 'Supervisor' && userPerfil !== 'Diretoria') {
            return res.status(403).json({ msg: 'Acesso negado. Você não tem permissão para ver a equipe.' });
        }

        // Consulta para obter usuários com perfil 'Vendedor'
        // 'u.nome AS nome_completo' é usado para que o campo corresponda a 'vendedor.nome_completo' no frontend.
        const sql = `
            SELECT u.id, u.nome AS nome_completo, u.email
            FROM usuarios u
            JOIN perfis p ON u.perfil_id = p.id
            WHERE p.nome = 'Vendedor' AND u.status = TRUE
            ORDER BY u.nome ASC
        `;
        const [equipe] = await pool.query(sql);

        res.json(equipe);
    } catch (err) {
        console.error('ERRO INTERNO NO SERVIDOR ao listar minha equipe:', err.message);
        res.status(500).send('Erro no servidor');
    }
};

// Se houver outras funções neste arquivo, mantenha-as aqui.