const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// Sequelize setup
const sequelize = new Sequelize('currency_converter', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    storage: './database.sqlite'
});

// Model definition
const FavoritePair = sequelize.define('FavoritePair', {
    pair: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

// Routes
app.get('/favorites', async (req, res) => {
    try {
        const favoritePairs = await FavoritePair.findAll();
        res.json(favoritePairs);
    } catch (error) {
        res.status(500).send('Error loading favorite pairs.');
    }
});

app.post('/favorites', async (req, res) => {
    const { pair } = req.body;
    try {
        const newFavoritePair = await FavoritePair.create({ pair });
        res.status(201).json(newFavoritePair);
    } catch (error) {
        res.status(500).send('Error saving favorite pair.');
    }
});

// Sync and start server
sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
});
