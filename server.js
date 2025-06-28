// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors()); 
app.use(express.json()); 

app.get('/', (req, res) => res.send('API do Sistema de Gestão Rodando'));

// Registra todas as nossas rotas de API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/presenca', require('./routes/presencaRoutes'));
app.use('/api/perfis', require('./routes/perfilRoutes'));
app.use('/api/gestao', require('./routes/gestaoRoutes'));
app.use('/api/motivos', require('./routes/motivoRoutes'));
app.use('/api/relatorios', require('./routes/relatorioRoutes')); // Garante que esta linha está presente e correta
app.use('/api/dias-nao-uteis', require('./routes/diasNaoUteisRoutes')); // <<< ADICIONE ESTA LINHA

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor iniciado na porta ${PORT}`));