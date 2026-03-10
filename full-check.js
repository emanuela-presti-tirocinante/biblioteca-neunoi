const path = require('path');
const Sequelize = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'server', 'database.sqlite'),
    logging: false
});

async function check() {
    try {
        const [cols] = await sequelize.query('PRAGMA table_info(Loans)');
        console.log('ALL COLUMNS:', cols.map(c => c.name));

        const [data] = await sequelize.query('SELECT * FROM Loans');
        console.log('SAMPLE ROW:', data[0]);
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

check();
