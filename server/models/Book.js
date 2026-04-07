const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    titolo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    autore: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isbn: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    descrizione: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    copertina_url: {
        type: DataTypes.STRING, // URL to image
        allowNull: true
    },
    copie_totali: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    copie_disponibili: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    anno_pubblicazione: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    cod_archivio: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true
});

module.exports = Book;
