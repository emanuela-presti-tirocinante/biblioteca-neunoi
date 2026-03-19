const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User } = require('../models');

const router = express.Router();

// Multer config per documenti utente
const documentiDir = path.join(__dirname, '../uploads/documenti');
if (!fs.existsSync(documentiDir)) {
    fs.mkdirSync(documentiDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, documentiDir),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// Register
router.post('/register', upload.single('documento'), async (req, res) => {
    try {
        const { nome, cognome, email, password, telefono, tipo_documento, numero_documento } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Percorso file documento (se caricato)
        const documento_path = req.file ? req.file.path : null;

        // Create user
        const user = await User.create({
            nome,
            cognome,
            email,
            password_hash,
            role: 'user',
            telefono: telefono || null,
            tipo_documento: tipo_documento || null,
            numero_documento: numero_documento || null,
            documento_path: documento_path || null
        });

        // Send Welcome Email
        const { sendEmail } = require('../services/email');
        await sendEmail(
            email,
            'Benvenuto nella Biblioteca Neunoi',
            `<h1>Ciao ${nome}!</h1><p>Grazie per esserti registrato.</p>`
        );

        // Create Token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ token, user: { id: user.id, nome, cognome, email, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log(`Login attempt for ${email}: User found: yes, Password match: ${isMatch}`);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Update last login
        user.last_login = new Date();
        await user.save();

        // Create Token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, nome: user.nome, cognome: user.cognome, email: user.email, role: user.role, last_login: user.last_login } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get User Profile
const { auth } = require('../middleware/auth');
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password_hash'] } });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email richiesta' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // Logic here would send an email with a reset link.
        // For now, we mock success.
        res.json({ message: 'Link di reset inviato con successo!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore del server' });
    }
});

module.exports = router;
