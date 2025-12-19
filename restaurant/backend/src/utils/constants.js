// Rôles utilisateur
exports.USER_ROLES = {
  ADMIN: 'admin',
  CHEF: 'chef',
  SERVEUR: 'serveur',
  CLIENT: 'client'
};

// Statuts de commande
exports.ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Types de produits
exports.PRODUCT_TYPES = {
  REPAS: 'repas',
  BOISSON: 'boisson',
  DESSERT: 'dessert',
  ENTREE: 'entree'
};

// Statuts de paiement
exports.PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed'
};

// Méthodes de paiement
exports.PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  ONLINE: 'online',
  MOBILE: 'mobile'
};

// Emplacements de table
exports.TABLE_LOCATIONS = {
  TERRASSE: 'terrasse',
  INTERIEUR: 'interieur',
  SALON_PRIVE: 'salon-prive',
  BAR: 'bar'
};

// Statuts de table
exports.TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  MAINTENANCE: 'maintenance',
  CLEANING: 'cleaning'
};

// Codes d'erreur HTTP
exports.HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Messages d'erreur
exports.ERROR_MESSAGES = {
  NOT_FOUND: 'Ressource non trouvée',
  UNAUTHORIZED: 'Non autorisé',
  FORBIDDEN: 'Accès interdit',
  BAD_REQUEST: 'Requête invalide',
  INTERNAL_ERROR: 'Erreur interne du serveur',
  VALIDATION_ERROR: 'Erreur de validation'
};