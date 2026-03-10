const { sequelize } = require('./models/index.js');
async function testInsert() {
    try {
        // Pulisci per il test
        await sequelize.query('DELETE FROM BookCategory WHERE CategoryId = 1');

        await sequelize.query('INSERT INTO BookCategory (BookId, CategoryId, createdAt, updatedAt) VALUES (1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)');
        console.log('Insert Book 1 in Category 1: SUCCESS');

        await sequelize.query('INSERT INTO BookCategory (BookId, CategoryId, createdAt, updatedAt) VALUES (2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)');
        console.log('Insert Book 2 in Category 1: SUCCESS');

        const [rows] = await sequelize.query('SELECT * FROM BookCategory WHERE CategoryId = 1');
        console.log('Current Category 1 books count:', rows.length);

    } catch (err) {
        console.error('DATABASE ERROR:', err.message);
    }
    process.exit(0);
}
testInsert();
