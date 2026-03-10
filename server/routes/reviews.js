const express = require('express');
const { Review, User } = require('../models');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get reviews for a book
router.get('/book/:bookId', async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { bookId: req.params.bookId },
            include: [{ model: User, attributes: ['nome', 'cognome'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a review
router.post('/', auth, async (req, res) => {
    try {
        const { bookId, rating, commento } = req.body;

        // Check if user already reviewed this book? Optional.

        const review = await Review.create({
            userId: req.user.id,
            bookId,
            rating,
            commento
        });

        // Return review with user data
        const fullReview = await Review.findByPk(review.id, {
            include: [{ model: User, attributes: ['nome', 'cognome'] }]
        });

        res.status(201).json(fullReview);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
