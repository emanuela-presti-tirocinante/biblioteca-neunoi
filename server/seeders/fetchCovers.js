const { sequelize, Book } = require('../models/index.js');
const { Op } = require('sequelize');

async function fetchCovers() {
    let foundCount = 0;
    let totalToProcess = 0;

    try {
        // 1. Legge tutti i libri che hanno "placeholder" nel campo copertina_url
        const books = await Book.findAll({
            where: {
                copertina_url: {
                    [Op.is]: null
                }
            }
        });

        totalToProcess = books.length;
        console.log(`Inizio elaborazione di ${totalToProcess} libri senza copertina...`);

        for (const book of books) {
            const { titolo, autore, id } = book;

            // Pulisce i parametri per l'URL
            const queryTitle = encodeURIComponent(titolo);
            const queryAuthor = encodeURIComponent(autore || '');
            const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${queryTitle}+inauthor:${queryAuthor}&langRestrict=it`;

            try {
                const response = await fetch(url);
                const data = await response.json();

                if (data.items && data.items.length > 0) {
                    // Cerca il primo risultato che abbia le immagini
                    const volumeInfo = data.items.find(item => item.volumeInfo && item.volumeInfo.imageLinks)?.volumeInfo;

                    if (volumeInfo && volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail) {
                        const newCoverUrl = volumeInfo.imageLinks.thumbnail.replace('http:', 'https:');

                        await Book.update(
                            { copertina_url: newCoverUrl },
                            { where: { id } }
                        );

                        console.log(`✅ TROVATA: ${titolo}`);
                        foundCount++;
                    } else {
                        console.log(`❌ NON TROVATA: ${titolo}`);
                    }
                } else {
                    console.log(`❌ NON TROVATA: ${titolo}`);
                }
            } catch (apiError) {
                console.error(`⚠️ ERRORE API per "${titolo}":`, apiError.message);
            }

            // 7. Aggiunge un ritardo di 300ms tra una richiesta e l'altra
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        console.log(`\nFinito!`);
        console.log(`📈 Copertine trovate: ${foundCount} / ${totalToProcess}`);

    } catch (error) {
        console.error('❌ Errore generale durante il recupero delle copertine:', error);
    } finally {
        await sequelize.close();
    }
}

fetchCovers();
