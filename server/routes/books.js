const express = require('express');
const { Book, Category, Sequelize } = require('../models');
const { auth, adminParams } = require('../middleware/auth');
const router = express.Router();
const { Op } = Sequelize;

// Get all books (with filters and search)
router.get('/', async (req, res) => {
    try {
        const { search, category, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let where = {};
        if (search) {
            where = {
                [Op.or]: [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('titolo')), { [Op.like]: `%${search.toLowerCase()}%` }),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('autore')), { [Op.like]: `%${search.toLowerCase()}%` })
                ]
            };
        }

        let include = [];
        if (category && category !== '') {
            include.push({
                model: Category,
                where: { id: parseInt(category) },
                required: true // Assicura che vengano restituiti solo i libri con questa categoria
            });
        } else {
            include.push({ model: Category });
        }

        const { count, rows } = await Book.findAndCountAll({
            where,
            include,
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true // for correct count with associations
        });

        res.json({
            books: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single book
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id, { include: Category });
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Create Book
router.post('/', [auth, adminParams], async (req, res) => {
    try {
        const { titolo, autore, isbn, descrizione, copie_totali, categoryIds, anno_pubblicazione, cod_archivio, copertina_url } = req.body;
        const book = await Book.create({
            titolo,
            autore,
            isbn,
            descrizione,
            copie_totali,
            copie_disponibili: copie_totali,
            anno_pubblicazione,
            cod_archivio,
            copertina_url
        });

        if (categoryIds && categoryIds.length > 0) {
            await book.setCategories(categoryIds);
        }

        res.status(201).json(book);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Update Book
router.put('/:id', [auth, adminParams], async (req, res) => {
    try {
        const { titolo, autore, isbn, descrizione, copie_totali, categoryIds, anno_pubblicazione, cod_archivio, copertina_url } = req.body;
        const book = await Book.findByPk(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        await book.update({
            titolo,
            autore,
            isbn,
            descrizione,
            copie_totali,
            anno_pubblicazione,
            cod_archivio,
            copertina_url
        });

        if (categoryIds) {
            await book.setCategories(categoryIds);
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Delete Book
router.delete('/:id', [auth, adminParams], async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        await book.destroy();
        res.json({ message: 'Book deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
