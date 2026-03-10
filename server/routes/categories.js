const express = require('express');
const { Category, Book } = require('../models');
const { auth, adminParams } = require('../middleware/auth');
const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Create Category
router.post('/', [auth, adminParams], async (req, res) => {
    try {
        const { nome, copertina_url } = req.body;
        const category = await Category.create({ nome, copertina_url });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Update Category
router.put('/:id', [auth, adminParams], async (req, res) => {
    try {
        const { nome, copertina_url } = req.body;
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        category.nome = nome;
        if (copertina_url !== undefined) category.copertina_url = copertina_url;
        await category.save();
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Delete Category
router.delete('/:id', [auth, adminParams], async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        await category.destroy();
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
