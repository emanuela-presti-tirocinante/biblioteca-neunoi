const express = require('express');
const { Quote, sequelize } = require('../models');
const router = express.Router();

// Get random quote
router.get('/random', async (req, res) => {
    try {
        const quote = await Quote.findOne({
            order: [sequelize.random()]
        });
        res.json(quote);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
