const cron = require('node-cron');
const { Op } = require('sequelize');
const { Loan, User, Book } = require('../models');
const { sendEmail } = require('./email');

// Utility: calcola i giorni di differenza tra oggi e una data
const giorniDifferenza = (data) => {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const target = new Date(data);
    target.setHours(0, 0, 0, 0);
    return Math.round((target - oggi) / (1000 * 60 * 60 * 24));
};

// Funzione logica per CRON 1
const checkExpiringLoans = async () => {
    console.log('[CRON] Controllo promemoria scadenza...');
    try {
        const loans = await Loan.findAll({
            where: { stato: 'approvato' },
            include: [
                { model: User, attributes: ['nome', 'email'] },
                { model: Book, attributes: ['titolo', 'autore'] }
            ]
        });

        for (const loan of loans) {
            const giorni = giorniDifferenza(loan.data_fine_prevista);
            console.log(`[DEBUG] ${loan.Book.titolo} | scadenza: ${loan.data_fine_prevista} | giorni: ${giorni}`);
            if (giorni === 3) {
                await sendEmail(
                    loan.User.email,
                    `Promemoria: il tuo prestito scade tra 3 giorni — ${loan.Book.titolo}`,
                    `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                        <h2 style="color: #E21F1D;">Il tuo prestito sta per scadere ⏳</h2>
                        <p>Ciao ${loan.User.nome},</p>
                        <p>ti ricordiamo che il prestito di <strong>${loan.Book.titolo}</strong> di ${loan.Book.autore} scade il <strong>${loan.data_fine_prevista}</strong> — mancano solo 3 giorni.</p>
                        <p>Se hai bisogno di più tempo, contattaci. Altrimenti ti aspettiamo per la restituzione </p>
                        <p>A presto,<br/>La Biblioteca di neu [nòi]</p>
                    </div>`
                );
                console.log(`[CRON] Promemoria inviato a ${loan.User.email} per "${loan.Book.titolo}"`);
            }
        }
    } catch (err) {
        console.error('[CRON] Errore promemoria scadenza:', err);
        throw err;
    }
};

// Funzione logica per CRON 2
const checkOverdueLoans = async () => {
    console.log('[CRON] Controllo ritardi...');
    try {
        const loans = await Loan.findAll({
            where: { stato: 'approvato' },
            include: [
                { model: User, attributes: ['nome', 'cognome', 'email'] },
                { model: Book, attributes: ['titolo', 'autore'] }
            ]
        });

        for (const loan of loans) {
            const giorni = giorniDifferenza(loan.data_fine_prevista); // negativo = in ritardo
            const ritardo = Math.abs(giorni);

            if (giorni >= 0) continue; // non ancora scaduto, skip

            if (ritardo === 1 || ritardo % 5 === 0) {
                await sendEmail(
                    loan.User.email,
                    `Il tuo prestito è scaduto — ${loan.Book.titolo}`,
                    `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                        <h2 style="color: #E21F1D;">Prestito scaduto</h2>
                        <p>Ciao ${loan.User.nome},</p>
                        <p>il prestito di <strong>${loan.Book.titolo}</strong> di ${loan.Book.autore} è scaduto il <strong>${loan.data_fine_prevista}</strong> — sono passati <strong>${ritardo} giorn${ritardo === 1 ? 'o' : 'i'}</strong>.</p>
                        <p>Ti chiediamo di restituirlo il prima possibile, così anche altri lettori possono goderne.</p>
                        <p>Grazie per la collaborazione,<br/>La Biblioteca di neu [nòi]</p>
                    </div>`
                );
                console.log(`[CRON] Notifica ritardo (${ritardo}gg) inviata a ${loan.User.email} per "${loan.Book.titolo}"`);
            }

            // Notifica admin dopo 5 giorni di ritardo
            if (ritardo === 5) {
                try {
                    const admin = await User.findOne({ where: { role: 'admin' } });
                    if (admin) {
                        await sendEmail(
                            admin.email,
                            `Segnalazione ritardo — ${loan.Book.titolo}`,
                            `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                                <h2 style="color: #E21F1D;">Segnalazione ritardo</h2>
                                <p>Ciao ${admin.nome},</p>
                                <p>il seguente prestito è in ritardo di <strong>5 giorni</strong>:</p>
                                <ul>
                                    <li><strong>Libro:</strong> ${loan.Book.titolo} di ${loan.Book.autore}</li>
                                    <li><strong>Utente:</strong> ${loan.User.nome} ${loan.User.cognome}</li>
                                    <li><strong>Email utente:</strong> ${loan.User.email}</li>
                                    <li><strong>Scadenza:</strong> ${loan.data_fine_prevista}</li>
                                    <li><strong>Giorni di ritardo:</strong> ${ritardo}</li>
                                </ul>
                                <p>Accedi all'app per verificare la situazione.</p>
                                <p>La Biblioteca di neu [nòi]</p>
                            </div>`
                        );
                        console.log(`[CRON] Segnalazione ritardo inviata all'admin per "${loan.Book.titolo}" — utente: ${loan.User.email}`);
                    }
                } catch (emailErr) {
                    console.error('[CRON] Errore notifica admin ritardo:', emailErr);
                }
            }
        }
    } catch (err) {
        console.error('[CRON] Errore notifica ritardi:', err);
        throw err;
    }
};

// CRON 1 — ogni giorno alle 08:00
cron.schedule('0 8 * * *', checkExpiringLoans);

// CRON 2 — ogni giorno alle 09:00
cron.schedule('0 9 * * *', checkOverdueLoans);

module.exports = {
    checkExpiringLoans,
    checkOverdueLoans
};

console.log('[CRON] Job schedulati attivi.');
