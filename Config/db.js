// config/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

let pool;

// Verifica se está no ambiente de produção do Heroku (procurando pela JAWSDB_URL)
if (process.env.JAWSDB_URL) {
    // Se estiver no Heroku, usa a URL de conexão completa
    pool = mysql.createPool(process.env.JAWSDB_URL);
} else {
    // Se estiver na sua máquina local, usa as variáveis do arquivo .env
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

module.exports = pool;