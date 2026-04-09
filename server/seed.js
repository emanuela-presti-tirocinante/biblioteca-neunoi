const { sequelize, Category, Book, User, Quote } = require('./models');
const bcrypt = require('bcryptjs'); // You might need to install bcryptjs if not present

const seedDatabase = async () => {
    try {
        await sequelize.sync({ force: true }); // WARNING: This drops tables!
        console.log('Database synced!');

        // Seed Categories
        const categories = await Category.bulkCreate([
            { nome: 'Narrativa' },
            { nome: 'Saggistica' },
            { nome: 'Bambini' },
            { nome: 'Scienza' },
            { nome: 'Arte' }
        ]);
        console.log('Categories seeded!');

        // Seed Admin User
        // Note: In real app, password should be hashed. Here we do a quick mock or need bcrypt.
        // Let's assume we handle hashing in the route or model hook. 
        // For now, I'll manually match what the auth will expect.
        // If we haven't installed bcryptjs yet, I should check or rely on plain text for a split second debug
        // but better to install it. I'll add bcryptjs to the plan if missing or just use a placeholder.
        // "hash_password" implies it expects a hash.

        // Simple hash simulation if bcrypt not available or just do it right from start.
        // I will use a dummy hash for now, assuming "password123"
        const adminHash = await bcrypt.hash('password123', 10);

        await User.create({
            nome: 'Admin',
            cognome: 'Neunoi',
            email: 'tirocinante@neunoi.it',
            password_hash: adminHash,
            role: 'admin'
        });
        console.log('Admin user seeded!');

        // Seed Quotes
        await Quote.bulkCreate([
            { testo: 'Un libro che si lascia interrotto non si finisce mai.', autore: 'Marcel Proust' },
            { testo: 'Leggere è andare incontro a qualcosa che sta per essere e che ancora nessuno sa cosa sarà.', autore: 'Italo Calvino' }
        ]);
        console.log('Quotes seeded!');

        console.log('Seeding complete.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
