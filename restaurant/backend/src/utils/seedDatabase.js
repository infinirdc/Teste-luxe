// src/utils/seedDatabase.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Table = require('../models/Table');

const seedDatabase = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opulence_restaurant');
    console.log('✅ Connecté à MongoDB');

    // Nettoyer la base de données (optionnel - en développement seulement)
    if (process.env.NODE_ENV === 'development') {
      await User.deleteMany({});
      await Category.deleteMany({});
      await Product.deleteMany({});
      await Table.deleteMany({});
      console.log('🗑️  Base de données nettoyée');
    }

    // 1. Créer l'administrateur
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin1234', 10);
    
    const admin = await User.create({
      username: 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@opulence.com',
      password: adminPassword,
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      phone: '+33123456789'
    });
    console.log('👑 Administrateur créé');

    // 2. Créer les catégories
    const categories = [
      {
        name: 'Plats Principaux',
        slug: 'plats-principaux',
        description: 'Nos plats traditionnels congolais',
        icon: 'fas fa-utensils',
        color: '#E11D48',
        type: 'repas'
      },
      {
        name: 'Boissons',
        slug: 'boissons',
        description: 'Boissons locales et internationales',
        icon: 'fas fa-wine-glass',
        color: '#3B82F6',
        type: 'boisson'
      },
      {
        name: 'Entrées',
        slug: 'entrees',
        description: 'Nos entrées maison',
        icon: 'fas fa-carrot',
        color: '#10B981',
        type: 'entree'
      },
      {
        name: 'Desserts',
        slug: 'desserts',
        description: 'Douceurs traditionnelles',
        icon: 'fas fa-ice-cream',
        color: '#F59E0B',
        type: 'dessert'
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('📂 Catégories créées');

    // 3. Créer des produits
    const products = [
      {
        name: "Malangua",
        description: "Plat traditionnel à base de légumes frais",
        price: 18.00,
        category: createdCategories[0]._id,
        type: "repas",
        image: "/uploads/products/malangua.jpg",
        stock: 25,
        stockMax: 50,
        ingredients: [
          { name: "Feuilles de manioc", quantity: "500", unit: "g" },
          { name: "Arachides", quantity: "200", unit: "g" },
          { name: "Tomates", quantity: "3", unit: "pièces" }
        ],
        preparationTime: 25,
        isFeatured: true
      },
      {
        name: "Primus",
        description: "Bière Locale Congolaise",
        price: 5.00,
        category: createdCategories[1]._id,
        type: "boisson",
        image: "https://images.unsplash.com/photo-1608270586620-248524c67de9",
        stock: 120,
        stockMax: 200,
        preparationTime: 2
      },
      {
        name: "Chikwangue",
        description: "Pain de manioc traditionnel",
        price: 14.00,
        category: createdCategories[0]._id,
        type: "repas",
        image: "/uploads/products/chikwangue.jpg",
        stock: 40,
        stockMax: 70,
        preparationTime: 15
      },
      {
        name: "Vin de Palme",
        description: "Malafu / Nsamba - Vin traditionnel",
        price: 8.00,
        category: createdCategories[1]._id,
        type: "boisson",
        image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
        stock: 65,
        stockMax: 120,
        preparationTime: 5
      }
    ];

    await Product.insertMany(products);
    console.log('🍽️  Produits créés');

    // 4. Créer des tables
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      tables.push({
        number: `T${i.toString().padStart(2, '0')}`,
        name: `Table ${i}`,
        capacity: i <= 5 ? 4 : 6,
        location: i <= 3 ? 'terrasse' : 'interieur',
        status: 'available'
      });
    }

    // Ajouter une table VIP
    tables.push({
      number: 'VIP-01',
      name: 'Salon Privé',
      capacity: 10,
      location: 'salon-prive',
      status: 'available',
      description: 'Table VIP avec vue panoramique'
    });

    await Table.insertMany(tables);
    console.log('🪑 Tables créées');

    // 5. Mettre à jour les compteurs de produits dans les catégories
    for (const category of createdCategories) {
      await category.updateProductCount();
    }
    console.log('📊 Compteurs de produits mis à jour');

    console.log('\n✅ Base de données peuplée avec succès!');
    console.log('\n📋 Résumé:');
    console.log(`   👥 Utilisateurs: 1 (admin)`);
    console.log(`   📂 Catégories: ${createdCategories.length}`);
    console.log(`   🍽️  Produits: ${products.length}`);
    console.log(`   🪑 Tables: ${tables.length}`);
    console.log(`\n🔑 Identifiants admin:`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Mot de passe: ${process.env.ADMIN_PASSWORD || 'Admin1234'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du peuplement de la base de données:', error);
    process.exit(1);
  }
};

// Exécuter le script
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;