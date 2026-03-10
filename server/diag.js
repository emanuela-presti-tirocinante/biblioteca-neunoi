const { Book, Category, sequelize } = require('./models');

async function diagnose() {
    try {
        console.log('--- DIAGNOSTICA ---');

        // 1. Libri totali
        const totalBooks = await Book.count();
        console.log('Totale Libri (Books):', totalBooks);

        // 2. Categorie totali
        const totalCategories = await Category.count();
        console.log('Totale Categorie (Categories):', totalCategories);

        // 3. Relazioni (BookCategory)
        const [results] = await sequelize.query('SELECT COUNT(*) as count FROM BookCategory');
        console.log('Relazioni Book-Category (BookCategory):', results[0].count);

        // 4. Campione relazioni
        const [sample] = await sequelize.query('SELECT * FROM BookCategory LIMIT 5');
        console.log('Campione BookCategory:', JSON.stringify(sample));

        // 5. Verifica se esiste categoryId in Books (come legacy)
        const [columns] = await sequelize.query('PRAGMA table_info(Books)');
        const hasCategoryId = columns.some(c => c.name === 'categoryId');
        console.log('Colonna categoryId in Books:', hasCategoryId);

        if (hasCategoryId) {
            const [countLegacy] = await sequelize.query('SELECT COUNT(*) as count FROM Books WHERE categoryId IS NOT NULL');
            console.log('Libri con categoryId (legacy):', countLegacy[0].count);
        }

        process.exit(0);
    } catch (err) {
        console.error('ERRORE DIAGNOSTICA:', err);
        process.exit(1);
    }
}

diagnose();
