// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import des modules
const connectDB = require('./config/database');
const routes = require('./routes/index');
const errorMiddleware = require('./middleware/error.middleware');

// Initialiser l'application Express
const app = express();

// Connexion à la base de données
connectDB();

// Middleware de sécurité
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Middleware CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware de logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware pour parser le JSON et les cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes API
app.use(`/api/${process.env.API_VERSION || 'v1'}`, routes);

// Middleware de gestion des erreurs
app.use(errorMiddleware);

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API du Restaurant Opulence',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    status: 'online'
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  🚀 Serveur Opulence Restaurant API
  📍 Environnement: ${process.env.NODE_ENV}
  🔌 Port: ${PORT}
  📅 ${new Date().toLocaleString()}
  `);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Erreur non gérée: ${err.message}`);
  console.error(err.stack);
  
  // Fermer le serveur et quitter
  server.close(() => process.exit(1));
});

// Gestion de l'arrêt propre
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM reçu. Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
  });
});