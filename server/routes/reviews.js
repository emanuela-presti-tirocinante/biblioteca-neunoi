const express = require('express');
const { Review, User, Book } = require('../models');
const { auth, adminParams } = require('../middleware/auth');
const router = express.Router();

// GET recensioni approvate per un libro (pubblico)
router.get('/book/:bookId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { bookId: req.params.bookId, approvata: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST nuova recensione (pubblico — loggato o no)
router.post('/book/:bookId', async (req, res) => {
  try {
    const { commento, nome_display } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    let userId = null;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_dev');
        userId = decoded.id;
      } catch (_) {}
    }
    if (commento && commento.length > 1000) {
      return res.status(400).json({ message: 'Commento troppo lungo (max 1000 caratteri).' });
    }
    const review = await Review.create({
      bookId: req.params.bookId,
      userId,
      nome_display: nome_display || null,
      commento: commento || null,
      approvata: false
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH approva recensione (solo admin)
router.patch('/:reviewId/approva', auth, adminParams, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Recensione non trovata.' });
    await review.update({ approvata: true });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE rimuovi recensione (solo admin)
router.delete('/:reviewId', auth, adminParams, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Recensione non trovata.' });
    await review.destroy();
    res.json({ message: 'Recensione eliminata.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET recensioni dell'utente loggato
router.get('/user/me', auth, async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { userId: req.user.id },
      include: [{ model: Book, attributes: ['titolo', 'copertina_url'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET recensioni in attesa di approvazione (solo admin)
router.get('/pending', auth, adminParams, async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { approvata: false },
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
