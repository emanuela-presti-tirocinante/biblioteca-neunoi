const { sequelize, Category } = require('./models');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        
        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log('Tables in DB:', tables);
        
        const categories = await Category.findAll();
        console.log('Categories found:', categories.length);
        console.log(JSON.stringify(categories, null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

test();
