const bcrypt = require('bcryptjs');
const { User } = require('../models');
const sequelize = require('../config/database');

const seedUsers = async () => {
    try {
        await sequelize.sync(); // Assicura che la tabella esista

        const salt = await bcrypt.genSalt(10);
        const hashedAdminPassword = await bcrypt.hash('password123', salt);
        const hashedUserPassword = await bcrypt.hash('password123', salt);

        // Creazione Admin
        const [admin, adminCreated] = await User.findOrCreate({
            where: { email: 'emanuelapresti@neunoi.it' },
            defaults: {
                nome: 'Admin',
                cognome: 'Biblioteca',
                password_hash: hashedAdminPassword,
                role: 'admin'
            }
        });

        if (adminCreated) {
            console.log('✅ Utente Admin creato: admin@neunoi.it / password123');
        } else {
            console.log('ℹ️ Utente Admin già esistente.');
        }

        // Creazione Utente Standard
        const [user, userCreated] = await User.findOrCreate({
            where: { email: 'user@neunoi.it' },
            defaults: {
                nome: 'Mario',
                cognome: 'Rossi',
                password_hash: hashedUserPassword,
                role: 'user'
            }
        });

        if (userCreated) {
            console.log('✅ Utente Standard creato: user@neunoi.it / password123');
        } else {
            console.log('ℹ️ Utente Standard già esistente.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Errore durante il seeding degli utenti:', error);
        process.exit(1);
    }
};

seedUsers();
