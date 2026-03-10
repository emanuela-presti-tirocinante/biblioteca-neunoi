const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { sequelize, Book, Category } = require('./models/index.js');

async function restoreAssociations() {
    let linkedCount = 0;
    let errorsCount = 0;

    try {
        const excelPath = path.join(__dirname, '../file-informativi/_Registro Catalogazione Libri neu[nòi].xlsx');

        if (!fs.existsSync(excelPath)) {
            console.error(`File Excel non trovato: ${excelPath}`);
            return;
        }

        const workbook = xlsx.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 }).slice(1);

        console.log(`Analisi di ${rows.length} righe per il ripristino delle relazioni...`);

        for (const row of rows) {
            const soggetto = row[0];
            const codArchivio = row[1];
            const stanzaScaffale = row[2];
            const titolo = row[3];

            if (!titolo || !soggetto || !codArchivio) continue;

            const codUnico = `${String(codArchivio).trim()} | ${String(stanzaScaffale).trim()}`;
            const categoryName = String(soggetto).trim().toUpperCase();

            try {
                // Trova il libro
                const book = await Book.findOne({ where: { cod_archivio: codUnico } });
                if (!book) continue;

                // Trova/Crea la categoria
                const [category] = await Category.findOrCreate({ where: { nome: categoryName } });

                // Crea l'associazione
                await book.addCategory(category);
                linkedCount++;

                if (linkedCount % 100 === 0) console.log(`Processati ${linkedCount} legami...`);
            } catch (err) {
                errorsCount++;
                console.error(`Errore riga ${codUnico}:`, err.message, err.name);
                if (err.errors) {
                    err.errors.forEach(e => console.error(' Detail:', e.message, e.path));
                }
            }
        }

        console.log(`\nRipristino completato!`);
        console.log(`✅ Relazioni create: ${linkedCount}`);
        console.log(`❌ Errori: ${errorsCount}`);

    } catch (error) {
        console.error('Errore fatale:', error);
    } finally {
        await sequelize.close();
    }
}

restoreAssociations();
