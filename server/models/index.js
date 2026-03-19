const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Book = require('./Book');
const Category = require('./Category');
const Loan = require('./Loan');
const Review = require('./Review');
const Quote = require('./Quote');

// Associations

// User <-> Loan (One-to-Many)
User.hasMany(Loan, { foreignKey: 'userId' });
Loan.belongsTo(User, { foreignKey: 'userId' });

// Book <-> Loan (One-to-Many)
Book.hasMany(Loan, { foreignKey: 'bookId' });
Loan.belongsTo(Book, { foreignKey: 'bookId' });

// Book <-> Category (Many-to-Many)
Book.belongsToMany(Category, { through: 'BookCategory' });
Category.belongsToMany(Book, { through: 'BookCategory' });

// User <-> Review (One-to-Many)
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

// Book <-> Review (One-to-Many)
Book.hasMany(Review, { foreignKey: 'bookId' });
Review.belongsTo(Book, { foreignKey: 'bookId' });

// Sync DB schema (adds missing columns without data loss)
sequelize.sync({ alter: true });

module.exports = {
    sequelize,
    Sequelize,
    User,
    Book,
    Category,
    Loan,
    Review,
    Quote
};
