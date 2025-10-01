const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// ============== 1. SERVER AND DATABASE SETUP ==============
const app = express();
const port = 3000;

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false // Set to true to see SQL queries in the console
});

app.use(cors());
app.use(express.json());


// ============== 2. DEFINE DATABASE MODELS ==============

const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.FLOAT, allowNull: false },
    imageUrl: { type: DataTypes.STRING }
});

const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }
});

const Order = sequelize.define('Order', {
    totalPrice: { type: DataTypes.FLOAT, allowNull: false }
});

// This "through" table connects Orders and Products
const OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false } // Price of the item at the time of purchase
});


// ============== 3. DEFINE MODEL RELATIONSHIPS (Corrected) ==============

// User-Order Relationship
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Order-Product Many-to-Many Relationship
Order.belongsToMany(Product, {
    through: OrderItem,
    foreignKey: 'orderId',
    otherKey: 'productId'
});
Product.belongsToMany(Order, {
    through: OrderItem,
    foreignKey: 'productId',
    otherKey: 'orderId'
});


// ============== 4. DEFINE API ROUTES ==============

// --- PRODUCT ROUTES ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products: ' + error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product: ' + error.message });
    }
});

// --- AUTHENTICATION ROUTES ---
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword });
        res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Username already exists.' });
        }
        res.status(500).json({ message: 'Error registering new user.', error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        res.status(200).json({ message: 'Login successful!', user: { id: user.id, username: user.username } });
    } catch (error) {
        res.status(500).json({ message: 'Error during login.', error: error.message });
    }
});

// --- ORDER ROUTES ---
app.post('/api/orders', async (req, res) => {
    const { userId, cart } = req.body;
    if (!userId || !cart || cart.length === 0) {
        return res.status(400).json({ message: 'User ID and cart are required.' });
    }

    const t = await sequelize.transaction();
    try {
        const productIds = cart.map(item => item.id);
        const products = await Product.findAll({ where: { id: productIds } });
        const productMap = products.reduce((map, product) => {
            map[product.id] = product;
            return map;
        }, {});

        let finalTotalPrice = 0;
        for (const item of cart) {
            const product = productMap[item.id];
            if (!product) {
                throw new Error(`Product with ID ${item.id} from cart not found in database.`);
            }
            finalTotalPrice += product.price * item.quantity;
        }

        const order = await Order.create({ userId, totalPrice: finalTotalPrice }, { transaction: t });

        const orderItems = cart.map(item => ({
            orderId: order.id,
            productId: item.id,
            quantity: item.quantity,
            price: productMap[item.id].price
        }));

        await OrderItem.bulkCreate(orderItems, { transaction: t });
        await t.commit();
        res.status(201).json({ message: 'Order created successfully!', orderId: order.id });

    } catch (error) {
        await t.rollback();
        console.error('ORDER CREATION FAILED:', error);
        res.status(500).json({ message: 'Failed to create order.', error: error.message });
    }
});

app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.orderId, {
            include: [
                { model: User, attributes: ['username'] },
                { model: Product, through: { attributes: ['quantity', 'price'] } }
            ]
        });
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order.', error: error.message });
    }
});


// ============== 5. INITIALIZE DATABASE AND START SERVER ==============
const initialize = async () => {
    try {
        // { force: true } will drop and recreate tables on every server start
        await sequelize.sync({ force: true });
        console.log('Database tables recreated successfully.');

        // Add sample products to the fresh database
        await Product.bulkCreate([
            { name: 'Classic Leather Wallet', description: 'A sleek, durable wallet made from genuine leather.', price: 49.99, imageUrl: 'https://placehold.co/400x400/556B2F/white?text=Wallet' },
            { name: 'Modern Smartwatch', description: 'Stay connected with this stylish smartwatch. Tracks fitness and notifications.', price: 199.50, imageUrl: 'https://placehold.co/400x400/4682B4/white?text=Watch' },
            { name: 'Wireless Headphones', description: 'Experience high-fidelity sound with these comfortable over-ear headphones.', price: 89.99, imageUrl: 'https://placehold.co/400x400/2F4F4F/white?text=Headphones' }
        ]);
        console.log('Sample products have been added.');

        app.listen(port, () => {
            console.log(`✅ Server is running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Unable to initialize the database:', error);
    }
};

initialize();