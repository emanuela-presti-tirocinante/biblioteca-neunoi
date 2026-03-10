const { sequelize, Category } = require('./models');

async function test() {
    try {
        console.log('Environment:', process.env.NODE_ENV);
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        
        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log('Tables in DB:', tables);
        
        try {
            const categories = await Category.findAll();
            console.log('Categories found:', categories.length);
        } catch (e) {
            console.error('Sequelize Category.findAll() failed:', e.message);
            if (e.original) console.error('Original error:', e.original.message);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('General failure:', error);
        process.exit(1);
    }
}

test();
