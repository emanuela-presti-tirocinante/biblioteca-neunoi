const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  bookId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  nome_display: { type: DataTypes.STRING, allowNull: true },
  commento: { type: DataTypes.TEXT, allowNull: true },
  approvata: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false,
    get() {
      const rawValue = this.getDataValue('approvata');
      if (typeof rawValue === 'boolean') return rawValue;
      if (rawValue === '1' || rawValue === 1 || rawValue === 'true') return true;
      return false;
    }
  }
}, { timestamps: true });

module.exports = Review;
