const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { sequelize, Book, Category } = require('../models/index.js');

async function seedBooks() {
    let insertedCount = 0;
    let skippedCount = 0;
    let categoriesCreated = 0;

    try {
        // Path to the Excel file relative to this script
        // Using the file found in project: _Registro Catalogazione Libri neu[nòi].xlsx
        const excelPath = path.join(__dirname, '../../file-informativi/_Registro Catalogazione Libri neu[nòi].xlsx');

        if (!fs.existsSync(excelPath)) {
            console.error(`File Excel non trovato al percorso: ${excelPath}`);
            return;
        }

        const workbook = xlsx.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert sheet to array of arrays, skipping headers (header: 1)
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        // Remove the first row (headers)
        const rows = data.slice(1);

        // Assicura che le tabelle esistano prima di procedere
        console.log("Sincronizzazione database...");
        await sequelize.sync();

        console.log(`Inizio elaborazione di ${rows.length} righe...`);

        for (const row of rows) {
            const soggetto = row[0];        // Index 0: SOGGETTO
            const codArchivio = row[1];        // Index 1: CODICE LIBRO
            const stanzaScaffale = row[2];     // Index 2: STANZA-SCAFFALE-NUMERO
            const codUnico = `${String(codArchivio).trim()} | ${String(stanzaScaffale).trim()}`;
            const titolo = row[3];          // Index 3: TIITOLO
            let autore = row[4];            // Index 4: AUTORE
            const aCuraDi = row[5];         // Index 5: A CURA DI
            const annoEdizione = row[7];    // Index 7: ANNO DI EDIZIONE
            const tipologia = row[9];       // Index 9: TIPOLOGIA (descrizione)

            // a. Salta se titolo è vuoto
            if (!titolo || String(titolo).trim() === '') continue;

            // b. Salta se SOGGETTO è vuoto
            if (!soggetto || String(soggetto).trim() === '') continue;

            // c. Gestione Autore
            autore = (autore && String(autore).trim() !== '') ? String(autore).trim() : 'AA.VV.';
            if (aCuraDi && String(aCuraDi).trim() !== '') {
                autore += ` (a cura di: ${String(aCuraDi).trim()})`;
            }

            // d. Gestione Anno
            let anno = parseInt(annoEdizione);
            if (isNaN(anno) || anno === 0) {
                anno = null;
            }

            // e. findOrCreate Category (trim e uppercase)
            const categoryName = String(soggetto).trim().toUpperCase();
            const [category, created] = await Category.findOrCreate({
                where: { nome: categoryName }
            });
            if (created) categoriesCreated++;

            // f. Controlla duplicati per cod_archivio
            const existingBook = await Book.findOne({
                where: { cod_archivio: codUnico }
            });

            if (existingBook) {
                skippedCount++;
                continue;
            }

            // g. Crea il Book
            const book = await Book.create({
                titolo: String(titolo).trim(),
                autore: autore,
                isbn: null,
                descrizione: tipologia ? String(tipologia).trim() : null,
                copertina_url: null,
                copie_totali: 1,
                copie_disponibili: 1,
                anno_pubblicazione: anno,
                cod_archivio: codUnico
            });

            // h. Collega book e category
            await book.addCategory(category);
            insertedCount++;
        }

        console.log(`\nImportazione completata!`);
        console.log(`✅ Libri inseriti: ${insertedCount}`);
        console.log(`⏭ Duplicati saltati: ${skippedCount}`);
        console.log(`📂 Categorie create: ${categoriesCreated}`);

    } catch (error) {
        console.error('Errore durante il seeding dei libri:', error);
    } finally {
        await sequelize.close();
    }
}

seedBooks();
