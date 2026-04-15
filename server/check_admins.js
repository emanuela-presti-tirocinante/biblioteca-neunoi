const { User } = require('./models');
const dotenv = require('dotenv');
dotenv.config();

async function checkAdmins() {
    try {
        const admins = await User.findAll({ where: { role: 'admin' } });
        console.log(`\n--- RISULTATO CONTROLLO ADMIN ---`);
        console.log(`Numero di admin trovati: ${admins.length}`);
        admins.forEach((admin, index) => {
            console.log(`${index + 1}. Nome: ${admin.nome} ${admin.cognome} - Email: ${admin.email}`);
        });
        console.log(`---------------------------------\n`);
        process.exit(0);
    } catch (error) {
        console.error('Errore durante il controllo degli admin:', error);
        process.exit(1);
    }
}

checkAdmins();
