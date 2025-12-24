require('dotenv').config(); // Pour charger les variables d'environnement
const jwt = require('jsonwebtoken'); // Pour JWT
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuration MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://marume:Anikulapo0@infini.ywvovbm.mongodb.net/?appName=INFINI?retryWrites=true&w=m';

// Connexion MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur MongoDB:', err));

// Schémas Mongoose
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: ['visitor', 'admin'], default: 'visitor' },
    createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    type: { type: String, enum: ['repas', 'boisson', 'dessert', 'entree'], required: true },
    image: { type: String, default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80' },
    stock: { type: Number, default: 0 },
    stockMax: { type: Number, default: 50 },
    desc: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customerPhone: { type: String, required: true },
    customerName: { type: String, required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        productName: { type: String },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true }
    }],
    total: { type: Number, required: true },
    status: { type: String, enum: ['en cours', 'terminé'], default: 'en cours' },
    time: { type: String, default: () => new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) },
    createdAt: { type: Date, default: Date.now }
});

// Modèles
const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// Routes d'authentification
// Route d'inscription
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, phone } = req.body;
        
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: 'Ce numéro de téléphone est déjà utilisé' });
        }
        
        // Créer un nouvel utilisateur
        const user = new User({ name, phone, role: 'visitor' });
        await user.save();
        
        // Générer un token JWT
        const token = jwt.sign(
            { userId: user._id, phone: user.phone, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({ 
            message: 'Inscription réussie', 
            token,
            user: { name, phone, role: 'visitor' } 
        });
    } catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route de connexion
app.post('/api/auth/login', async (req, res) => {
    try {
        const { phone } = req.body;
        
        // Rechercher l'utilisateur
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        // Générer un token JWT
        const token = jwt.sign(
            { userId: user._id, phone: user.phone, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            message: 'Connexion réussie', 
            token,
            user: { 
                name: user.name, 
                phone: user.phone, 
                role: user.role 
            } 
        });
    } catch (error) {
        console.error('Erreur connexion:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route de connexion admin
app.post('/api/auth/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Vérifier les identifiants admin
        if (username === (process.env.ADMIN_USERNAME || 'gt') && 
            password === (process.env.ADMIN_PASSWORD || '55436')) {
            
            // Créer ou récupérer l'utilisateur admin
            let adminUser = await User.findOne({ phone: 'admin' });
            if (!adminUser) {
                adminUser = new User({ 
                    name: 'Administrateur', 
                    phone: 'admin', 
                    role: 'admin' 
                });
                await adminUser.save();
            }
            
            // Générer un token JWT
            const token = jwt.sign(
                { userId: adminUser._id, phone: adminUser.phone, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            return res.json({
                message: 'Connexion admin réussie',
                token,
                user: {
                    name: 'Administrateur',
                    phone: 'admin',
                    role: 'admin'
                }
            });
        }
        
        res.status(401).json({ message: 'Identifiants administrateur incorrects' });
    } catch (error) {
        console.error('Erreur connexion admin:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Routes des produits
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Erreur récupération produits:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Erreur création produit:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(product);
    } catch (error) {
        console.error('Erreur modification produit:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Produit supprimé' });
    } catch (error) {
        console.error('Erreur suppression produit:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Gestion du stock
app.put('/api/products/:id/stock', async (req, res) => {
    try {
        const { change } = req.body;
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        
        const newStock = Math.max(0, product.stock + change);
        product.stock = newStock;
        
        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Erreur modification stock:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Routes des commandes
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().populate('items.productId', 'name');
        res.json(orders);
    } catch (error) {
        console.error('Erreur récupération commandes:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/api/orders/user/:phone', async (req, res) => {
    try {
        const orders = await Order.find({ customerPhone: req.params.phone })
            .populate('items.productId', 'name')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Erreur récupération commandes utilisateur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { customerPhone, customerName, items, total } = req.body;
        
        // Générer un ID de commande unique
        const orderId = `#OP-${Math.floor(1000 + Math.random() * 9000)}`;
        
        // Préparer les items avec les noms de produits
        const orderItems = await Promise.all(items.map(async (item) => {
            const product = await Product.findById(item.productId);
            return {
                productId: item.productId,
                productName: product ? product.name : 'Produit inconnu',
                quantity: item.quantity,
                price: item.price
            };
        }));
        
        const order = new Order({
            orderId,
            customerPhone,
            customerName,
            items: orderItems,
            total,
            status: 'en cours'
        });
        
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        console.error('Erreur création commande:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOneAndUpdate(
            { orderId: req.params.id },
            { status },
            { new: true }
        );
        res.json(order);
    } catch (error) {
        console.error('Erreur modification statut commande:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour les données initiales
app.post('/api/seed', async (req, res) => {
    try {
        // Créer utilisateur admin
        await User.findOneAndUpdate(
            { phone: 'admin' },
            { name: 'Administrateur', role: 'admin' },
            { upsert: true }
        );

        // Données initiales des produits
        const initialProducts = [
            { name: "Malangua", price: 18.00, type: "repas", image: "/asset/1malangua.webp", stock: 25, stockMax: 50, desc: "Plat traditionnel à base de légumes." },
            { name: "Niania", price: 22.00, type: "repas", image: "/asset/2niania.webp", stock: 18, stockMax: 40, desc: "Plat savoureux de viande mijotée." },
            { name: "Riz Local", price: 15.00, type: "repas", image: "/asset/3riz.webp", stock: 35, stockMax: 60, desc: "Riz accompagné de sauce traditionnelle." },
            { name: "Porc Grillé", price: 20.00, type: "repas", image: "/asset/4porc.webp", stock: 22, stockMax: 45, desc: "Porc grillé aux épices locales." },
            { name: "Poulet Mayonnaise", price: 19.00, type: "repas", image: "/asset/5poulet-mayo.webp", stock: 30, stockMax: 50, desc: "Poulet frais avec sauce mayonnaise maison." },
            { name: "Primus", price: 5.00, type: "boisson", stock: 120, stockMax: 200, desc: "Bière Locale Congolaise" },
            { name: "Tembo", price: 6.00, type: "boisson", stock: 95, stockMax: 180, desc: "Bière Brune Africaine" }
        ];

        // Ajouter les produits
        for (const productData of initialProducts) {
            await Product.findOneAndUpdate(
                { name: productData.name },
                productData,
                { upsert: true }
            );
        }

        res.json({ message: 'Base de données initialisée' });
    } catch (error) {
        console.error('Erreur initialisation données:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour les statistiques
app.get('/api/stats', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const activeOrders = await Order.countDocuments({ status: 'en cours' });
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
        
        res.json({
            totalProducts,
            totalOrders,
            activeOrders,
            totalRevenue: totalRevenue[0]?.total || 0
        });
    } catch (error) {
        console.error('Erreur récupération statistiques:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Servir l'application frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;