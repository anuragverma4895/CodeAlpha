const { Sequelize, DataTypes } = require('sequelize');

// 1. Create a new Sequelize instance and connect to an SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite' // This will create a file named database.sqlite
});

// 2. Define the 'Product' model (like a table in the database)
const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING
  }
});

// We will add User and Order models later

// 3. Sync the models with the database
sequelize.sync({ alter: true }).then(() => {
  console.log('Database & tables created!');
});

module.exports = { Product, sequelize };