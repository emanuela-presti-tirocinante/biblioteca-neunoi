const { Loan } = require('../models');
const { Op } = require('sequelize');

async function cleanDatabase() {
    try {
        console.log('Inizio pulizia database...');

        // 1. Trova e cancella prestiti con bookId null
        const deletedNull = await Loan.destroy({
            where: {
                bookId: null
            }
        });
        console.log(`Cancellati ${deletedNull} record con bookId NULL.`);

        // 2. Trova e cancella prestiti del 24/02/2026
        // Nota: Nel log vedevo date come 2026-02-24T...
        const deletedDate = await Loan.destroy({
            where: {
                createdAt: {
                    [Op.like]: '2026-02-24%'
                }
            }
        });
        console.log(`Cancellati ${deletedDate} record datati 24/02/2026.`);

        console.log('Pulizia completata con successo.');
        process.exit(0);
    } catch (error) {
        console.error('Errore durante la pulizia:', error);
        process.exit(1);
    }
}

cleanDatabase();
