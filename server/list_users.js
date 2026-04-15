const { User } = require('./models');
const dotenv = require('dotenv');
dotenv.config();

async function listUsers() {
    try {
        const users = await User.findAll();
        console.log(`\n--- TUTTI GLI UTENTI NEL DB ---`);
        console.log(`Totale utenti: ${users.length}`);
        users.forEach((user, index) => {
            console.log(`${index + 1}. Nome: ${user.nome} ${user.cognome} - Email: ${user.email} - Ruolo: ${user.role}`);
        });
        console.log(`-------------------------------\n`);
        process.exit(0);
    } catch (error) {
        console.error('Errore durante il recupero degli utenti:', error);
        process.exit(1);
    }
}

listUsers();
