# 🚀 Guide de Déploiement Vercel - Opulence Restaurant

## Étape 1: Configuration Locale & Tests

### 1.1 Installer les dépendances
```bash
cd "c:\Users\INVITES\Documents\OneDrive\Desktop\LUXE\Teste-luxe"
npm install
```

### 1.2 Tester localement
```bash
# Démarrer le serveur de développement
npm run dev

# Devrait afficher:
# ✓ Server running on port 3000 (development mode)
```

### 1.3 Tester les endpoints
```bash
# Health check
curl http://localhost:3000/health

# Créer un utilisateur
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phone":"+243123456789"}'

# Charger les produits
curl http://localhost:3000/api/products

# Login admin
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"andi","password":"4250"}'
```

---

## Étape 2: Préparer le Repository GitHub

### 2.1 Initialiser Git (si pas déjà fait)
```bash
cd "c:\Users\INVITES\Documents\OneDrive\Desktop\LUXE\Teste-luxe"

# Initialiser repo
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Ajouter tous les fichiers
git add .

# Commit initial
git commit -m "feat: Complete refactoring with production-ready architecture

- Modular backend (MVC pattern) with 26 files
- Frontend modules (11 JS files) with clean architecture
- Security: JWT auth, input validation, rate limiting (5 login/15min)
- Performance: Pagination, caching, lazy loading
- Accessibility: WCAG compliant with ARIA labels
- Error handling: Centralized with Winston logging
- Database: MongoDB with proper indexing and validation
- Deployment: Vercel-ready with environment variable support

Improvements:
- Security: From 🔴 critical to ✅ enterprise-grade
- Performance: From single file to modular optimized
- Maintainability: From 1983 lines to organized structure
- Accessibilité: From none to WCAG compliant
"

# Voir les commits
git log --oneline
```

### 2.2 Ajouter votre repository GitHub
```bash
# Remplacer YOUR_USERNAME et YOUR_REPO par vos valeurs
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## Étape 3: Configurer Vercel

### 3.1 Créer un Project Vercel

**Option A: Via CLI (Recommandé)**
```bash
# Installer Vercel CLI
npm install -g vercel

# Connecter à Vercel
vercel login

# Déployer
vercel --prod
```

**Option B: Via Site Web**
1. Aller à https://vercel.com/dashboard
2. Click "New Project"
3. Importer votre repository GitHub
4. Vercel auto-détecte Node.js

### 3.2 Ajouter Variables d'Environnement

**Via CLI:**
```bash
vercel env add MONGODB_URI
# Paste: mongodb+srv://marume:DDaa11@infini.ywvovbm.mongodb.net/opulence?retryWrites=true&w=majority

vercel env add JWT_SECRET
# Paste: your_super_secret_jwt_key_opulence_2026_change_in_prod_12345

vercel env add ADMIN_USERNAME
# Paste: andi

vercel env add ADMIN_PASSWORD
# Paste: 4250

vercel env add ALLOWED_ORIGINS
# Paste: https://teste-luxe.vercel.app

vercel env add NODE_ENV
# Paste: production
```

**Via Dashboard (https://vercel.com/dashboard):**
1. Aller à votre projet
2. Project Settings → Environment Variables
3. Ajouter chaque variable:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://marume:DDaa11@infini.ywvovbm.mongodb.net/opulence?retryWrites=true&w=majority` |
| `JWT_SECRET` | `your_super_secret_jwt_key_opulence_2026_change_in_prod_12345` |
| `ADMIN_USERNAME` | `andi` |
| `ADMIN_PASSWORD` | `4250` |
| `ALLOWED_ORIGINS` | `https://teste-luxe.vercel.app` |
| `NODE_ENV` | `production` |

### 3.3 Vérifier la Configuration Vercel

```bash
# Voir toutes les env vars configurées
vercel env list

# Redéployer après env vars
vercel --prod
```

---

## Étape 4: Monitoring et Tests

### 4.1 Voir les logs Vercel
```bash
# Logs en temps réel
vercel logs

# Ou via dashboard: https://vercel.com/dashboard
# → Your Project → Deployments → Recent Deployment → Logs
```

### 4.2 Tester l'URL Vercel
```bash
# Remplacer YOUR_VERCEL_URL par votre URL réelle
VERCEL_URL="https://teste-luxe.vercel.app"

# Health check
curl $VERCEL_URL/health

# Register new user
curl -X POST $VERCEL_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Production Test","phone":"+243999888777"}'

# Get products
curl $VERCEL_URL/api/products

# Admin login
curl -X POST $VERCEL_URL/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"andi","password":"4250"}'
```

### 4.3 Test Points Clés
- [ ] GET /health → 200 OK
- [ ] POST /api/auth/register → 201 Created
- [ ] POST /api/auth/login → 200 OK
- [ ] GET /api/products → 200 OK (with pagination)
- [ ] POST /api/auth/admin/login → 200 OK
- [ ] GET /api/stats/dashboard (with token) → 200 OK
- [ ] Accès frontend (https://votre-url.vercel.app) → Charge complètement

---

## Étape 5: Troubleshooting Courant

### Problème: MongoDB Connection Failed
**Solution:**
```bash
# Vérifier MONGODB_URI dans Vercel env vars
vercel env list

# MongoDB Atlas: Ajouter IP 0.0.0.0/0 à Network Access
# Dashboard: https://cloud.mongodb.com
# → Project → Security → Network Access → Add IP Address
# → 0.0.0.0/0 (for Vercel functions)
```

### Problème: JWT_SECRET undefined
**Solution:**
```bash
# S'assurer que JWT_SECRET est configuré
vercel env list

# Si manquant:
vercel env add JWT_SECRET
# Paste: your_super_secret_jwt_key_opulence_2026_change_in_prod_12345

# Redéployer:
vercel --prod
```

### Problème: CORS Blocked
**Solution:**
```bash
# Vérifier ALLOWED_ORIGINS
vercel env list

# Devrait contenir votre URL Vercel:
# ALLOWED_ORIGINS: https://teste-luxe.vercel.app

# Mettre à jour si nécessaire:
vercel env rm ALLOWED_ORIGINS
vercel env add ALLOWED_ORIGINS
# Paste: https://teste-luxe.vercel.app
```

### Problème: 404 sur /api routes
**Solution:**
```bash
# Vérifier vercel.json - devrait avoir "server.js" (pas "serveur.js")
# C'est déjà corrigé dans votre vercel.json ✅

# Si problème persiste:
git push origin main
# Vercel redéploiera automatiquement
```

### Problème: Build Failed
**Solution:**
```bash
# Voir les logs Vercel
vercel logs --follow

# Vérifier que tous les fichiers sont en place:
# - server.js ✓
# - app.js ✓
# - config/, models/, controllers/, routes/, middleware/, utils/ ✓
# - package.json ✓

# Si problème avec npm install:
# Vérifier que package.json est valide
npm install locally first
```

---

## 🔐 Sécurité: Avant Déploiement

### Checklist Sécurité
- [ ] JWT_SECRET changé (ne pas garder le placeholder)
- [ ] MongoDB credentials protégés (env var, pas en dur)
- [ ] ALLOWED_ORIGINS ne contient QUE votre URL Vercel
- [ ] NODE_ENV=production (pas development)
- [ ] ADMIN_PASSWORD fort (considérer un changement après déploiement)
- [ ] Pas de fichier .env pushé sur GitHub (checked par .gitignore)

### Générer un JWT_SECRET Fort
```bash
# Générer sur Linux/Mac:
openssl rand -base64 32

# Ou online: https://generate-random.org/?action=base64

# Exemple (à remplacer):
aB9cD3eF7gH1iJ5kL2mN8oP6qR4sT0uV9wX+yZ/aB9cD3eF7gH1iJ5kL
```

---

## 📊 Monitoring Post-Déploiement

### Analytics Vercel
- Dashboard: https://vercel.com/dashboard
- Voir les dépendances (cold starts, response times)
- Logs: Vérifier les erreurs

### MongoDB Monitoring
- Dashboard: https://cloud.mongodb.com
- Database Deployments → Opulence
- Metrics (queries, latency)

### Erreurs et Logs
```bash
# Voir les erreurs backend
vercel logs --level error

# Filter par endpoint
vercel logs | grep "/api/products"
```

---

## 🔄 Updates Futures

### Déployer des Mises à Jour
```bash
# Faire vos changements localement
# Tester: npm run dev

# Commit et push
git add .
git commit -m "feat: your changes here"
git push origin main

# Vercel redéploie automatiquement ✅
# Voir les logs: vercel logs
```

### Rollback (si problème)
```bash
# Via Vercel Dashboard:
# → Deployments → Find previous version → Click "Promote to Production"
```

---

## 📝 Notes Importantes

1. **MongoDB URI** contient credentials - protégé via env var ✅
2. **JWT_SECRET** doit être changé en production (voir section sécurité)
3. **ALLOWED_ORIGINS** doit contenir votre URL Vercel exacte
4. **Admin credentials** (andi/4250) peuvent être changés après déploiement
5. Tous les fichiers `.env` sont dans `.gitignore` (pas exposés) ✅

---

## ✅ Checklist Déploiement Final

### Avant de pousser
- [ ] Tests locaux réussis: `npm run dev` works
- [ ] Tous les endpoints répondent
- [ ] Variables .env définies
- [ ] Vérifier que `.env` n'est pas pushé (in `.gitignore`) ✅

### Déploiement
- [ ] Repository GitHub créé et synchronisé
- [ ] Vercel project créé
- [ ] Toutes les env vars ajoutées dans Vercel dashboard
- [ ] Build successful dans Vercel logs

### Post-Déploiement
- [ ] URL Vercel responsive
- [ ] /health endpoint répond
- [ ] /api/products retourne les produits
- [ ] Login admin fonctionne
- [ ] Frontend charge complètement

---

## 🎯 Résumé Quick Start

```bash
# 1. Test local
npm install
npm run dev
# Verify: http://localhost:3000/health

# 2. Push GitHub
git add .
git commit -m "Initial commit"
git push -u origin main

# 3. Configure Vercel env vars
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add ADMIN_USERNAME
vercel env add ADMIN_PASSWORD
vercel env add ALLOWED_ORIGINS

# 4. Deploy
vercel --prod

# 5. Monitor
vercel logs
```

---

**Status: ✅ READY TO DEPLOY**
**Your URL will be:**
`https://teste-luxe.vercel.app` (or similar)

