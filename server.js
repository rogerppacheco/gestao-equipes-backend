const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- CONFIGURAÇÃO DE CORS DINÂMICA ---
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://127.0.0.1:5500', // Desenvolvimento local com Live Server
      'https://cerulean-gumption-f1ae5f.netlify.app' // Produção
    ];
    // Permite requisições sem origem (ex.: ferramentas como Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS não permitido para esta origem: ' + origin));
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true // Habilita cookies/autenticação se necessário
};
app.use(cors(corsOptions));
// ----------------------------------------------------

app.use(express.json()); // Parseia o body das requisições JSON

// Rota de teste
app.get('/', (req, res) => res.send('API do Sistema de Gestão Rodando'));

// Registra todas as nossas rotas de API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/presenca', require('./routes/presencaRoutes'));
app.use('/api/perfis', require('./routes/perfilRoutes'));
app.use('/api/gestao', require('./routes/gestaoRoutes'));
app.use('/api/motivos', require('./routes/motivoRoutes'));
app.use('/api/dias-nao-uteis', require('./routes/diasNaoUteisRoutes'));
app.use('/api/relatorios', require('./routes/relatorioRoutes'));

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro inesperado:', err.message);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor iniciado na porta ${PORT} em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`));
