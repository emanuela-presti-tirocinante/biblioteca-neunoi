const { User } = require('./models');

async function checkAdmin() {
    try {
        const admin = await User.findOne({ where: { email: 'admin@neunoi.it' } });
        if (admin) {
            console.log('Admin found:', JSON.stringify(admin, null, 2));
        } else {
            console.log('Admin NOT found in database.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error checking admin:', error);
        process.exit(1);
    }
}

checkAdmin();
