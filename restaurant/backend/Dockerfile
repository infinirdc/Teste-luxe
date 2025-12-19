# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer le dossier uploads
RUN mkdir -p uploads/products uploads/users

# Exposer le port
EXPOSE 5000

# Commande de démarrage
CMD ["node", "src/server.js"]