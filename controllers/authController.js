// controllers/authController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    // --- PISTA 1: O que o frontend está enviando? ---
    console.log('--- Nova Tentativa de Login ---');
    console.log('Dados recebidos do frontend:', req.body);

    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ msg: 'Por favor, insira email e senha.' });
    }

    try {
        const sql = `
            SELECT u.*, p.nome as perfil_nome 
            FROM usuarios u
            JOIN perfis p ON u.perfil_id = p.id
            WHERE u.email = ? AND u.status = TRUE
        `;
        console.log('Tentando acessar o banco');
        const [users] = await pool.query(sql, [email]);
        
        // --- PISTA 2: O que o banco de dados encontrou? ---
        console.log('Resultado da busca no banco:', users);

        if (users.length === 0) {
            console.log('VEREDITO: Usuário não encontrado no banco ou está inativo.');
            return res.status(401).json({ msg: 'Credenciais inválidas.' });
        }

        const user = users[0];
        console.log('Usuário encontrado:', user.email);

        const isMatch = await bcrypt.compare(senha, user.senha);
        
        // --- PISTA 3: A senha bateu com a do banco? ---
        console.log('A senha fornecida corresponde à do banco?', isMatch);

        if (!isMatch) {
            console.log('VEREDITO: A senha não corresponde.');
            return res.status(401).json({ msg: 'Credenciais inválidas.' });
        }

        console.log('VEREDITO: Login bem-sucedido! Gerando token...');
        const payload = { user: { id: user.id, perfil: user.perfil_nome } };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, perfil: user.perfil_nome });
            }
        );
    } catch (err) {
        console.error('ERRO CRÍTICO NO SERVIDOR:', err.message);
        res.status(500).send('Erro no servidor');
    }
};