const { Category, sequelize } = require('./models/index.js');
const { getCategories } = require('../client/src/data/catalog.js');

async function fixCategoryNames() {
    try {
        const catalogCategories = getCategories().map(c => c.nome);
        const dbCategories = await Category.findAll();

        console.log('Inizio allineamento nomi categorie...');

        for (const dbCat of dbCategories) {
            // Trova una corrispondenza nel catalogo che inizi con il nome nel DB (per gestire il troncamento)
            const match = catalogCategories.find(name => name.startsWith(dbCat.nome));

            if (match && match !== dbCat.nome) {
                console.log(`Ridenominazione: "${dbCat.nome}" -> "${match}"`);
                await dbCat.update({ nome: match });
            }
        }

        console.log('Allineamento completato.');
        process.exit(0);
    } catch (err) {
        console.error('Errore:', err);
        process.exit(1);
    }
}

fixCategoryNames();
