const { User, Book, Category } = require('./models');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

async function seedTestDB() {
    try {
        // Clear existing (just in case)
        // await User.destroy({ where: {} });
        
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash('password123', salt);

        // 1. Create Admins
        const admin1 = await User.create({
            nome: 'Admin',
            cognome: 'Uno',
            email: 'admin1@test.com',
            password_hash,
            role: 'admin'
        });
        console.log('Admin 1 creato:', admin1.email);

        const admin2 = await User.create({
            nome: 'Admin',
            cognome: 'Due',
            email: 'admin2@test.com',
            password_hash,
            role: 'admin'
        });
        console.log('Admin 2 creato:', admin2.email);

        // 2. Create User
        const testUser = await User.create({
            nome: 'Mario',
            cognome: 'Rossi',
            email: 'user@test.com',
            password_hash,
            role: 'user'
        });
        console.log('Utente test creato:', testUser.email);

        // 3. Create Category & Book
        const category = await Category.findOrCreate({ where: { nome: 'Saggistica' } });
        
        const book = await Book.create({
            titolo: 'Libro di Test Multi-Admin',
            autore: 'Autore Test',
            categoriaId: category[0].id,
            isbn: '1234567890',
            copie_totali: 5,
            copie_disponibili: 5,
            collocazione: 'A1-01'
        });
        console.log('Libro test creato:', book.titolo);

        console.log('\n--- SEEDING COMPLETATO ---');
        process.exit(0);
    } catch (error) {
        console.error('Errore durante il seeding:', error);
        process.exit(1);
    }
}

seedTestDB();
