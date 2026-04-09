const { User } = require('./models');

const updateAdminEmail = async () => {
    try {
        const admin = await User.findOne({ where: { role: 'admin' } });
        if (admin) {
            admin.email = 'emanuelapresti@neunoi.it';
            await admin.save();
            console.log('✅ Email admin aggiornata nel database con successo!');
        } else {
            console.log('⚠️ Nessun utente admin trovato nel database.');
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Errore durante l\'aggiornamento dell\'email:', error);
        process.exit(1);
    }
};

updateAdminEmail();
