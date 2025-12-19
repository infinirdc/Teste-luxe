const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const products = [
    { name: "Malangua", price: 18.00, category: "repas", image: "/asset/1malangua.webp", stock: 25, maxStock: 50, description: "Plat traditionnel à base de légumes." },
    { name: "Niania", price: 22.00, category: "repas", image: "/asset/2niania.webp", stock: 18, maxStock: 40, description: "Plat savoureux de viande mijotée." },
    { name: "Riz Local", price: 15.00, category: "repas", image: "/asset/3riz.webp", stock: 35, maxStock: 60, description: "Riz accompagné de sauce traditionnelle." },
    { name: "Porc Grillé", price: 20.00, category: "repas", image: "/asset/4porc.webp", stock: 22, maxStock: 45, description: "Porc grillé aux épices locales." },
    { name: "Poulet Mayonnaise", price: 19.00, category: "repas", image: "/asset/5poulet-mayo.webp", stock: 30, maxStock: 50, description: "Poulet frais avec sauce mayonnaise maison." },
    { name: "Chenilles", price: 16.00, category: "repas", image: "/asset/6chenille.webp", stock: 15, maxStock: 35, description: "Chenilles locales, riches en protéines." },
    { name: "Fumbwa et Poisson", price: 23.00, category: "repas", image: "/asset/7fumbwa-et-poison.webp", stock: 28, maxStock: 50, description: "Légumes feuilles avec poisson frais." },
    { name: "Chikwangue", price: 14.00, category: "repas", image: "/asset/8chikang.webp", stock: 40, maxStock: 70, description: "Pain de manioc traditionnel." },
    { name: "Champignons Sautés", price: 17.00, category: "repas", image: "/asset/9champignon.webp", stock: 32, maxStock: 55, description: "Champignons frais sautés aux herbes." },
    { name: "Poulet Grillé", price: 24.00, category: "repas", image: "/asset/10poulet.webp", stock: 20, maxStock: 40, description: "Poulet entier grillé aux épices." },
    { name: "Primus", price: 5.00, category: "boisson", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=150&q=80", stock: 120, maxStock: 200, description: "Bière Locale Congolaise" },
    { name: "Tembo", price: 6.00, category: "boisson", image: "https://images.unsplash.com/photo-1535958636474-b021ee8876a3?auto=format&fit=crop&w=150&q=80", stock: 95, maxStock: 180, description: "Bière Brune Africaine" },
    { name: "Skol", price: 5.00, category: "boisson", image: "https://images.unsplash.com/photo-1586993451228-097180589669?auto=format&fit=crop&w=150&q=80", stock: 150, maxStock: 250, description: "Bière Légère Internationale" },
    { name: "Castel", price: 6.00, category: "boisson", image: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&w=150&q=80", stock: 85, maxStock: 160, description: "Bière Premium" },
    { name: "Vin de Palme", price: 8.00, category: "boisson", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=150&q=80", stock: 65, maxStock: 120, description: "Malafu / Nsamba - Vin traditionnel" }
];

const importData = async () => {
    try {
        await Product.deleteMany();
        await User.deleteMany();
        
        await Product.insertMany(products);
        
        await User.create({
            username: 'admin',
            password: 'password123',
            role: 'admin'
        });

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
