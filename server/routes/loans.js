const express = require('express');
const { Loan, Book, User, Category } = require('../models');
const { auth, adminParams } = require('../middleware/auth');
const router = express.Router();

// Request a Loan (User)
router.post('/', auth, async (req, res) => {
    try {
        const { bookId, data_inizio, data_fine_prevista } = req.body;
        const userId = req.user.id;

        const book = await Book.findByPk(bookId);
        if (!book) return res.status(404).json({ message: 'Libro non trovato' });

        if (book.copie_disponibili <= 0) {
            return res.status(400).json({ message: 'Libro non disponibile al momento' });
        }

        // Validate Duration (max 31 days)
        if (data_inizio && data_fine_prevista) {
            const start = new Date(data_inizio);
            const end = new Date(data_fine_prevista);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 31) {
                return res.status(400).json({ message: 'La durata massima del prestito è di 31 giorni' });
            }
            if (end < start) {
                return res.status(400).json({ message: 'La data di fine non può essere precedente alla data di inizio' });
            }
        }

        // Check if user already has an active or requested loan for this book
        const existingLoan = await Loan.findOne({
            where: {
                userId,
                bookId,
                stato: ['richiesto', 'approvato']
            }
        });

        if (existingLoan) {
            return res.status(400).json({ message: 'Hai già richiesto questo libro o lo hai già in prestito' });
        }

        const loan = await Loan.create({
            userId,
            bookId,
            data_inizio,
            data_fine_prevista,
            stato: 'richiesto'
        });

        res.status(201).json(loan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante la richiesta del prestito' });
    }
});

// Get Loans (Admin: All, User: Mine)
router.get('/', auth, async (req, res) => {
    try {
        let where = {};
        if (req.user.role !== 'admin') {
            where.userId = req.user.id;
        }

        const loans = await Loan.findAll({
            where,
            include: [
                { 
                    model: Book, 
                    attributes: ['titolo', 'autore', 'copertina_url', 'cod_archivio', 'copie_disponibili'],
                    include: [{ model: Category, attributes: ['nome'] }]
                },
                { model: User, attributes: ['nome', 'cognome', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(loans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero dei prestiti' });
    }
});

// Update Loan Status (Admin)
router.put('/:id', [auth], async (req, res) => {
    try {
        // Simple manual check for admin for now within the route
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accesso negato' });
        }

        const { stato } = req.body; // 'approvato', 'rifiutato', 'restituito'
        const loan = await Loan.findByPk(req.params.id, {
            include: [Book, User]
        });

        if (!loan) return res.status(404).json({ message: 'Prestito non trovato' });

        // Logic for state transitions
        if (stato === 'approvato' && loan.stato === 'richiesto') {
            if (loan.Book.copie_disponibili > 0) {
                await loan.Book.decrement('copie_disponibili');
                loan.data_inizio = new Date();

                // Default 30 days due date
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 30);
                loan.data_fine_prevista = dueDate;
            } else {
                return res.status(400).json({ message: 'Nessuna copia disponibile per l\'approvazione' });
            }
        } else if (stato === 'restituito' && loan.stato === 'approvato') {
            await loan.Book.increment('copie_disponibili');
            loan.data_restituzione_effettiva = new Date();
        } else if (stato === 'rifiutato' && loan.stato === 'richiesto') {
            // Just transition status
        } else if (loan.stato === stato) {
            return res.status(400).json({ message: `Il prestito è già in stato ${stato}` });
        }

        loan.stato = stato;
        await loan.save();

        // Send Email Notification
        const { sendEmail } = require('../services/email');
        const statusMap = {
            'approvato': 'Approvato',
            'rifiutato': 'Rifiutato',
            'restituito': 'Richiuso (Libro Restituito)'
        };

        try {
            await sendEmail(
                loan.User.email,
                `Aggiornamento Prestito: ${loan.Book.titolo}`,
                `<h1>Aggiornamento Biblioteca Neunoi</h1>
                 <p>Il caricamento della tua richiesta per il libro <strong>${loan.Book.titolo}</strong> è ora: <strong>${statusMap[stato] || stato}</strong>.</p>
                 <p>Grazie,<br/>Il Team della Biblioteca</p>`
            );
        } catch (emailErr) {
            console.error('Errore invio email:', emailErr);
            // Don't fail the whole request if email fails
        }

        res.json(loan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante l\'aggiornamento del prestito' });
    }
});

// Cancel Loan Request (User)
router.delete('/:id', auth, async (req, res) => {
    try {
        const loan = await Loan.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!loan) {
            return res.status(404).json({ message: 'Richiesta di prestito non trovata o non appartiene a te' });
        }

        if (loan.stato !== 'richiesto') {
            return res.status(400).json({ message: 'Puoi annullare solo le richieste in attesa di approvazione' });
        }

        await loan.destroy();
        res.json({ message: 'Richiesta di prestito annullata con successo' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante l\'annullamento della richiesta' });
    }
});

module.exports = router;
