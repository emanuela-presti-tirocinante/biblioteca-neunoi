const path = require('path');
const Sequelize = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'server', 'database.sqlite'),
    logging: false
});

const { QueryTypes } = require('sequelize');

async function checkSchema() {
    try {
        const tableInfo = await sequelize.query("PRAGMA table_info(Loans)", { type: QueryTypes.SELECT });
        console.log("Schema for Loans table:");
        tableInfo.forEach(col => console.log(`- ${col.name} (${col.type})`));

        const loans = await sequelize.query("SELECT * FROM Loans LIMIT 1", { type: QueryTypes.SELECT });
        console.log("\nSample data from Loans table:");
        console.log(JSON.stringify(loans, null, 2));
    } catch (error) {
        console.error("Error checking schema:", error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
