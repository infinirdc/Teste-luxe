// src/middleware/validation.middleware.js
const { validationResult } = require('express-validator');

exports.validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));
    
    return res.status(400).json({
      success: false,
      errors: errorMessages
    });
  };
};

// Validation spécifique pour les produits
exports.productValidation = [
  // À implémenter avec express-validator
];

// Validation pour les utilisateurs
exports.userValidation = [
  // À implémenter avec express-validator
];