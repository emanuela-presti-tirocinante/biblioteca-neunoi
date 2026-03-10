const { sequelize } = require('../models/index.js');

async function recreateTable() {
    try {
        console.log('Eliminazione tabella BookCategory...');
        await sequelize.query('DROP TABLE IF EXISTS BookCategory');

        console.log('Sincronizzazione modelli per ricreare la tabella...');
        await sequelize.sync();

        console.log('Tabella BookCategory ricreata con successo (senza vincoli errati).');
        process.exit(0);
    } catch (err) {
        console.error('Errore durante la ricreazione della tabella:', err);
        process.exit(1);
    }
}

recreateTable();
