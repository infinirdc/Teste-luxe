const Category = require('../models/Category');

// Récupérer toutes les catégories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories',
      error: error.message
    });
  }
};

// Récupérer une catégorie par ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('products');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la catégorie',
      error: error.message
    });
  }
};

// Créer une catégorie
exports.createCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    
    // Gérer l'upload d'image
    if (req.file) {
      categoryData.image = `/uploads/categories/${req.file.filename}`;
    }
    
    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création de la catégorie',
      error: error.message
    });
  }
};

// Mettre à jour une catégorie
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    const updates = req.body;
    
    // Gérer l'upload d'image
    if (req.file) {
      updates.image = `/uploads/categories/${req.file.filename}`;
    }
    
    Object.keys(updates).forEach(key => {
      category[key] = updates[key];
    });
    
    await category.save();

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la catégorie',
      error: error.message
    });
  }
};

// Supprimer une catégorie
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    // Vérifier s'il y a des produits dans cette catégorie
    const Product = require('../models/Product');
    const productCount = await Product.countDocuments({ 
      category: category._id,
      isActive: true 
    });
    
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une catégorie contenant des produits'
      });
    }

    // Soft delete
    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la catégorie',
      error: error.message
    });
  }
};