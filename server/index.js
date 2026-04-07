const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
require('./services/email');
require('./services/cronJobs');

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const categoryRoutes = require('./routes/categories');
const loanRoutes = require('./routes/loans');
const quoteRoutes = require('./routes/quotes');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const { sequelize } = require('./models');

// Verifica connessione al Database (senza modificare le tabelle)
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
  } catch (err) {
    console.error('Unable to connect to database:', err);
  }
};
testConnection();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '..')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/utenti', userRoutes);

// Fallback per React SPA: tutte le rotte non-API servono index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
