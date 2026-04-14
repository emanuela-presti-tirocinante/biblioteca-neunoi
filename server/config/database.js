const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASS && process.env.DB_NAME) {
    // Produzione: MySQL
    console.log('[DB] Connessione a MySQL:', process.env.DB_NAME, 'su', process.env.DB_HOST);
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            dialectOptions: {
                charset: 'utf8mb4',
            },
            logging: false,
        }
    );
} else {
    // Sviluppo locale: SQLite
    console.log('[DB] Variabili MySQL non trovate — uso SQLite locale.');
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '..', 'database.sqlite'),
        logging: false,
    });
}

module.exports = sequelize;
