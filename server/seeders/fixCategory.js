const { sequelize, Category, Sequelize } = require('../models/index.js');
const { Op } = Sequelize;

async function fixCategory() {
    try {
        console.log("Sincronizzazione database...");
        await sequelize.sync();

        console.log("Ricerca e aggiornamento categoria...");
        const [updatedRows] = await Category.update(
            { nome: 'LIBRI PER RAGAZZI' },
            {
                where: {
                    nome: { [Op.like]: '%RAGAZZ%' }
                }
            }
        );

        if (updatedRows > 0) {
            console.log(`✅ Successo: Categoria aggiornata! (${updatedRows} righe modificate)`);
        } else {
            console.log("ℹ️ Nessuna categoria trovata con 'RAGAZZ' nel nome.");
        }

    } catch (error) {
        console.error("❌ Errore durante l'aggiornamento della categoria:", error);
    } finally {
        await sequelize.close();
    }
}

fixCategory();
