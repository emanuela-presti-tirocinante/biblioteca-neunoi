const { User, Book, Loan } = require('./models');
const { sendEmail } = require('./services/email');
const dotenv = require('dotenv');
dotenv.config();

async function testTrigger() {
    try {
        console.log('--- AVVIO TEST DI TRIGGER NOTIFICHE MULTI-ADMIN ---');
        
        // 1. Recupero dati per il test
        const book = await Book.findOne();
        const user = await User.findOne({ where: { role: 'user' } });
        
        if (!book || !user) {
            console.error('Dati mancanti! Esegui prima seed_test_data.js');
            process.exit(1);
        }

        console.log(`Simulazione richiesta prestito:`);
        console.log(`- Utente: ${user.nome} ${user.cognome} (${user.email})`);
        console.log(`- Libro: ${book.titolo}`);

        // 2. LOGICA DI NOTIFICA (copiata da server/routes/loans.js)
        try {
            const admins = await User.findAll({ where: { role: 'admin' } });
            console.log(`[DEBUG - Notifica Admin] Trovati ${admins.length} amministratori:`, admins.map(a => a.email));
            
            for (const admin of admins) {
                console.log(`[DEBUG - Notifica Admin] Tentativo invio email a: ${admin.email}`);
                // In questo test non chiamiamo sendEmail effettivamente se non vogliamo sporcare, 
                // ma per il test multi-admin vogliamo vedere i log. 
                // sendEmail è stata modificata ieri per essere "non-blocking" ma qui la eseguiamo.
                
                await sendEmail(
                    admin.email,
                    `[TEST] Nuova richiesta di prestito — ${book.titolo}`,
                    `<h1>Test Multi-Admin</h1><p>Invio a ${admin.nome}</p>`
                );
            }
        } catch (emailErr) {
            console.error('Errore notifica admin:', emailErr);
        }

        console.log('--- FINE TEST ---');
        process.exit(0);
    } catch (error) {
        console.error('Errore durante il test:', error);
        process.exit(1);
    }
}

testTrigger();
