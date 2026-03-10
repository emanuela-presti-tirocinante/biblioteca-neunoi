const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Loan = sequelize.define('Loan', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    stato: {
        type: DataTypes.ENUM('richiesto', 'approvato', 'rifiutato', 'restituito', 'scaduto'),
        defaultValue: 'richiesto'
    },
    data_inizio: {
        type: DataTypes.DATEONLY, // Date without time
        allowNull: true
    },
    data_fine_prevista: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    data_restituzione_effettiva: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    luogo_ritiro: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Loan;
