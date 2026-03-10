const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'server', 'database.sqlite'),
    logging: console.log,
});

async function check() {
    try {
        const [results] = await sequelize.query("PRAGMA table_info(Loans)");
        console.log("Columns in Loans table:", results.map(r => r.name));
    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
}

check();
