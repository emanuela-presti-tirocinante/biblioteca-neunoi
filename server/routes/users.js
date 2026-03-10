const express = require('express');
const router = express.Router();
const { User, Loan, Review, Sequelize } = require('../models');
const { auth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// GET /api/utenti/profilo
router.get('/profilo', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get User
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) return res.status(404).json({ message: 'Utente non trovato' });

        // Calculate Stats
        const stats = {
            inAttesa: await Loan.count({ where: { userId, stato: 'richiesto' } }),
            libriPresi: await Loan.count({
                where: {
                    userId,
                    stato: { [Sequelize.Op.in]: ['approvato', 'restituito'] }
                }
            }),
            inLettura: await Loan.count({ where: { userId, stato: 'approvato' } }),
            restituiti: await Loan.count({ where: { userId, stato: 'restituito' } }),
            recensioni: await Review.count({ where: { userId } })
        };

        res.json({
            user,
            stats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero del profilo' });
    }
});

// PATCH /api/utenti/profilo
router.patch('/profilo', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { nome, cognome, currentPassword, newPassword } = req.body;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'Utente non trovato' });

        // Update basic info
        if (nome) user.nome = nome;
        if (cognome) user.cognome = cognome;

        // Update password if provided
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Password attuale richiesta per la modifica' });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ message: 'Password attuale errata' });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({ message: 'La nuova password deve essere di almeno 8 caratteri' });
            }

            const salt = await bcrypt.genSalt(10);
            user.password_hash = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        res.json({
            message: 'Profilo aggiornato con successo',
            user: {
                id: user.id,
                nome: user.nome,
                cognome: user.cognome,
                email: user.email,
                role: user.role,
                last_login: user.last_login
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante l\'aggiornamento del profilo' });
    }
});

module.exports = router;
