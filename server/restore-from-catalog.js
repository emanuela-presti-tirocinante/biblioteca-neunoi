const { Book, Category, sequelize } = require('./models/index.js');
const { catalogData } = require('../client/src/data/catalog.js');

async function restoreFromCatalog() {
    let linkedCount = 0;
    let skippedCount = 0;

    try {
        console.log('Inizio ripristino associazioni dal catalogo statico...');

        for (const catName in catalogData) {
            const dbCat = await Category.findOne({ where: { nome: catName } });
            if (!dbCat) {
                console.warn(`Categoria non trovata nel DB: ${catName}`);
                continue;
            }

            console.log(`Elaborazione categoria: ${catName}...`);
            const booksInCat = catalogData[catName];

            for (const bookInfo of booksInCat) {
                const code = bookInfo.codice; // es: "AMB 001"

                // Cerca il libro il cui cod_archivio inizia con questo codice
                const dbBook = await Book.findOne({
                    where: {
                        cod_archivio: {
                            [require('sequelize').Op.like]: `${code}%`
                        }
                    }
                });

                if (dbBook) {
                    try {
                        await dbBook.addCategory(dbCat);
                        linkedCount++;
                    } catch (assocErr) {
                        // Se è un errore di unicità, consideralo come "già verificato"
                        if (assocErr.name === 'SequelizeUniqueConstraintError') {
                            linkedCount++;
                        } else {
                            console.error(`Errore associazione book ${dbBook.id}:`, assocErr.message);
                        }
                    }
                } else {
                    skippedCount++;
                }
            }
        }

        console.log(`\nRipristino completato!`);
        console.log(`✅ Associazioni create/verificate: ${linkedCount}`);
        console.log(`⏭ Libri non trovati nel DB: ${skippedCount}`);

        process.exit(0);
    } catch (err) {
        console.error('Errore durante il ripristino:', err);
        process.exit(1);
    }
}

restoreFromCatalog();
