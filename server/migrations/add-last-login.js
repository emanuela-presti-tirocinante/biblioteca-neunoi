const sequelize = require('../config/database');

async function migrate() {
    try {
        await sequelize.query(
            'ALTER TABLE users ADD COLUMN last_login DATETIME NULL;'
        );
        console.log('Colonna last_login aggiunta con successo.');
        process.exit(0);
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('La colonna last_login esiste già.');
            process.exit(0);
        }
        console.error('Errore migration:', err.message);
        process.exit(1);
    }
}

migrate().catch(err => {
    console.error('Errore fatale:', err.message);
    process.exit(1);
});
