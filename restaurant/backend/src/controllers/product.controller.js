// src/controllers/product.controller.js
const Product = require('../models/Product');
const Category = require('../models/Category');

// Récupérer tous les produits
exports.getAllProducts = async (req, res) => {
  try {
    const {
      category,
      type,
      minPrice,
      maxPrice,
      inStock,
      featured,
      search,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Construire le filtre
    const filter = { isActive: true };
    
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      }
    }
    
    if (type) filter.type = type;
    if (featured) filter.isFeatured = featured === 'true';
    if (inStock === 'true') filter.stock = { $gt: 0 };
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    // Options de pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort]: order === 'desc' ? -1 : 1 },
      populate: 'category'
    };

    // Exécuter la requête avec pagination
    const products = await Product.paginate(filter, options);

    res.status(200).json({
      success: true,
      count: products.totalDocs,
      totalPages: products.totalPages,
      currentPage: products.page,
      products: products.docs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits',
      error: error.message
    });
  }
};

// Récupérer un produit par ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('relatedProducts');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit',
      error: error.message
    });
  }
};

// Créer un produit
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Gérer l'upload d'image
    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
    }
    
    const product = await Product.create(productData);
    
    // Mettre à jour le compteur de produits dans la catégorie
    await Category.findByIdAndUpdate(product.category, {
      $inc: { productCount: 1 }
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création du produit',
      error: error.message
    });
  }
};

// Mettre à jour un produit
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    const updates = req.body;
    
    // Gérer l'upload d'image
    if (req.file) {
      updates.image = `/uploads/products/${req.file.filename}`;
      // TODO: Supprimer l'ancienne image si nécessaire
    }
    
    Object.keys(updates).forEach(key => {
      product[key] = updates[key];
    });
    
    await product.save();

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour du produit',
      error: error.message
    });
  }
};

// Supprimer un produit (soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    // Décrémenter le compteur de produits dans la catégorie
    await Category.findByIdAndUpdate(product.category, {
      $inc: { productCount: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du produit',
      error: error.message
    });
  }
};

// Mettre à jour le stock
exports.updateStock = async (req, res) => {
  try {
    const { stock, action } = req.body; // action: 'add', 'remove', 'set'
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    
    let newStock = product.stock;
    
    switch (action) {
      case 'add':
        newStock += parseInt(stock);
        break;
      case 'remove':
        newStock = Math.max(0, newStock - parseInt(stock));
        break;
      case 'set':
        newStock = parseInt(stock);
        break;
      default:
        newStock = parseInt(stock);
    }
    
    product.stock = newStock;
    await product.save();
    
    res.status(200).json({
      success: true,
      product,
      message: `Stock mis à jour: ${newStock} unités`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour du stock',
      error: error.message
    });
  }
};

// Récupérer les produits en rupture de stock
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      stock: { $lte: '$minStockAlert' },
      isActive: true
    }).populate('category');
    
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits en rupture',
      error: error.message
    });
  }
};