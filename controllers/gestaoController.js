// controllers/gestaoController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Função para criar um novo usuário
exports.criarUsuario = async (req, res) => {
    const { nome_completo, cpf, email, senha, perfil_id, supervisor_id, valor_almoco, valor_passagem } = req.body;
    if (!nome_completo || !email || !senha || !perfil_id) {
        return res.status(400).json({ msg: 'Por favor, preencha todos os campos obrigatórios.' });
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        const [resultUsuario] = await connection.query(
            'INSERT INTO usuarios (nome_completo, cpf, email, senha, perfil_id, supervisor_id, status) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
            [nome_completo, cpf, email, senhaHash, perfil_id, supervisor_id || null]
        );
        const novoUsuarioId = resultUsuario.insertId;
        await connection.query(
            'INSERT INTO auxilios_financeiros (vendedor_id, valor_almoco, valor_passagem) VALUES (?, ?, ?)',
            [novoUsuarioId, valor_almoco || 0, valor_passagem || 0]
        );
        await connection.commit();
        res.status(201).json({ msg: 'Usuário criado com sucesso!' });
    } catch (err) {
        await connection.rollback();
        console.error(err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ msg: 'Este e-mail ou CPF já está cadastrado.' });
        }
        res.status(500).send('Erro no servidor.');
    } finally {
        connection.release();
    }
};

// Função para buscar um usuário específico pelo ID para edição
exports.getUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT u.id, u.nome_completo, u.cpf, u.email, u.perfil_id, u.supervisor_id, a.valor_almoco, a.valor_passagem
            FROM usuarios u LEFT JOIN auxilios_financeiros a ON u.id = a.vendedor_id
            WHERE u.id = ?;
        `;
        const [rows] = await pool.query(sql, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Usuário não encontrado.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

// Função para atualizar um usuário existente, incluindo a senha
exports.atualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nome_completo, cpf, email, perfil_id, supervisor_id, valor_almoco, valor_passagem, senha } = req.body;

    if (!nome_completo || !email || !perfil_id) {
        return res.status(400).json({ msg: 'Campos obrigatórios estão faltando.' });
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query(
            'UPDATE usuarios SET nome_completo = ?, cpf = ?, email = ?, perfil_id = ?, supervisor_id = ? WHERE id = ?',
            [nome_completo, cpf, email, perfil_id, supervisor_id || null, id]
        );
        if (senha && senha.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(senha, salt);
            await connection.query('UPDATE usuarios SET senha = ? WHERE id = ?', [senhaHash, id]);
        }
        await connection.query(
            `INSERT INTO auxilios_financeiros (vendedor_id, valor_almoco, valor_passagem) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE valor_almoco = VALUES(valor_almoco), valor_passagem = VALUES(valor_passagem)`,
            [id, valor_almoco || 0, valor_passagem || 0]
        );
        await connection.commit();
        res.json({ msg: 'Usuário atualizado com sucesso!' });
    } catch (err) {
        await connection.rollback();
        console.error(err.message);
        res.status(500).send('Erro no servidor.');
    } finally {
        connection.release();
    }
};

// Funções para listar usuários ativos e inativos
exports.getUsuariosAtivos = async (req, res) => {
    try {
        const sql = `
            SELECT u.id, u.nome_completo, u.email, p.nome as perfil, s.nome_completo as supervisor
            FROM usuarios u JOIN perfis p ON u.perfil_id = p.id
            LEFT JOIN usuarios s ON u.supervisor_id = s.id
            WHERE u.status = TRUE ORDER BY u.nome_completo;
        `;
        const [usuarios] = await pool.query(sql);
        res.json(usuarios);
    } catch (err) { console.error(err.message); res.status(500).send('Erro no servidor'); }
};

exports.getUsuariosInativos = async (req, res) => {
    try {
        const sql = `
            SELECT u.id, u.nome_completo, u.email, p.nome as perfil
            FROM usuarios u JOIN perfis p ON u.perfil_id = p.id
            WHERE u.status = FALSE ORDER BY u.nome_completo;
        `;
        const [usuarios] = await pool.query(sql);
        res.json(usuarios);
    } catch (err) { console.error(err.message); res.status(500).send('Erro no servidor'); }
};

// Funções para inativar e reativar usuários
exports.inativarUsuario = async (req, res) => {
    try {
        await pool.query('UPDATE usuarios SET status = FALSE WHERE id = ?', [req.params.id]);
        res.json({ msg: 'Usuário inativado com sucesso.' });
    } catch (err) { console.error(err.message); res.status(500).send('Erro no servidor.'); }
};

exports.reativarUsuario = async (req, res) => {
    try {
        await pool.query('UPDATE usuarios SET status = TRUE WHERE id = ?', [req.params.id]);
        res.json({ msg: 'Usuário reativado com sucesso.' });
    } catch (err) { console.error(err.message); res.status(500).send('Erro no servidor.'); }
};

// Função para buscar todos os perfis que podem ser líderes
exports.getSupervisores = async (req, res) => {
    try {
        const sql = `
            SELECT u.id, u.nome_completo 
            FROM usuarios u 
            JOIN perfis p ON u.perfil_id = p.id 
            WHERE p.nome IN ('Diretoria', 'Gerente', 'Supervisor') AND u.status = TRUE
            ORDER BY u.nome_completo;
        `;
        const [supervisores] = await pool.query(sql);
        res.json(supervisores);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};