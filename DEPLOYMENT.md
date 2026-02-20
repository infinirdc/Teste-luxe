# Opulence Restaurant - Deployment Guide

## 🚀 Deployment Checklist

### Backend Structure (26+ fichiers)
```
config/     ✅ (env.js, db.js)
models/     ✅ (User.js, Product.js, Order.js)
controllers/ ✅ (auth, product, order, stats)
routes/     ✅ (auth, products, orders, stats)
middleware/ ✅ (auth, validation, security, errorHandler)
utils/      ✅ (validators, logger, apiResponse)
```

### Frontend Structure (11 fichiers)
```
js/         ✅ (config, utils, state, api, auth, cart, products, orders, admin, ui, app)
css/        ✅ (styles.css)
index.html  ✅ (simplified and refactored)
```

### Configuration Files
```
package.json       ✅ (updated with new dependencies)
.env.example       ✅ (template for environment variables)
vercel.json        ✅ (optimized for Vercel deployment)
server.js          ✅ (refactored entry point)
app.js             ✅ (Express app setup)
```

---

## 📋 Before Deployment

### 1. Set Environment Variables on Vercel
Go to your Vercel project settings and add:

```
MONGODB_URI=mongodb+srv://marume:DDaa11@infini.ywvovbm.mongodb.net/opulence?retryWrites=true&w=majority
JWT_SECRET=[GENERATE_A_STRONG_32+_CHARACTER_SECRET]
ADMIN_USERNAME=admin
ADMIN_PASSWORD=[STRONG_PASSWORD]
ALLOWED_ORIGINS=https://yourvercelurl.com
NODE_ENV=production
```

### 2. Verify Local Setup
```bash
npm install
npm run dev
```

Test endpoints:
- GET http://localhost:3000/health ✅
- POST http://localhost:3000/api/auth/register
- GET http://localhost:3000/api/products
- POST http://localhost:3000/api/auth/admin/login

---

## 🔐 Security Improvements

✅ **Backend:**
- Environment variable validation (config/env.js)
- JWT authentication on protected routes
- Input validation and sanitization
- CORS with whitelist origin
- Rate limiting (5 attempts/15 min for login)
- Helmet security headers
- MongoDB injection protection
- Structured logging with Winston

✅ **Frontend:**
- sessionStorage instead of localStorage for tokens
- XSS protection via HTML escaping
- Input validation before submission
- HTTPS-only API calls
- Content Security Policy
- Accessibility features (ARIA labels, keyboard support)

✅ **Data:**
- MongoDB password hashing with bcrypt
- No credentials in code (all in env vars)
- Request/response validation
- Error handling without exposing internals

---

## 📊 Performance Improvements

✅ **Backend:**
- Pagination on product/order lists
- HTTP caching headers
- MongoDB aggregation for stats
- Database indexing on frequently queried fields
- Connection pooling

✅ **Frontend:**
- Lazy loading images (loading="lazy")
- Debounced search (300ms)
- Modular JavaScript (11 separate modules)
- CSS extracted and optimized
- Async/await for better flow control
- Minimal DOM manipulation

✅ **Deployment:**
- Serverless on Vercel
- No database backups needed (MongoDB Atlas)
- Auto-scaling
- CDN distribution

---

## 🧪 Test Plan

### Backend Tests
- [ ] POST /api/auth/register → create new user
- [ ] POST /api/auth/login → authenticate visitor
- [ ] POST /api/auth/admin/login → authenticate admin
- [ ] GET /api/products → list products (paginated)
- [ ] POST /api/products → create product (admin only)
- [ ] PUT /api/products/:id → update product (admin only)
- [ ] DELETE /api/products/:id → delete product (admin only)
- [ ] POST /api/orders → create order
- [ ] GET /api/orders/user/:phone → get user orders
- [ ] GET /api/stats/dashboard → get dashboard stats (admin only)

### Frontend Tests
- [ ] Register new account
- [ ] Login to account
- [ ] View product menu
- [ ] Search products (debounced)
- [ ] Filter by category
- [ ] Add items to cart
- [ ] Checkout process
- [ ] View order history
- [ ] Admin dashboard access
- [ ] Create/edit/delete products
- [ ] Responsive design on mobile
- [ ] Accessibility (keyboard navigation, screen readers)

### Security Tests
- [ ] CORS blocks unauthorized origins
- [ ] Rate limiting on login (>5 attempts)
- [ ] JWT token required for admin endpoints
- [ ] Input validation rejects invalid data
- [ ] XSS protection (HTML escape)
- [ ] MongoDB injection prevented
- [ ] No credentials in logs

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "feat: Complete refactoring with best practices

- Modular backend architecture (MVC pattern)
- Frontend modules for auth, cart, products, orders, admin
- Security: JWT, input validation, rate limiting
- Performance: Pagination, caching, lazy loading
- Accessibility: ARIA labels, keyboard support
- Error handling: Centralized handlers, structured logging
"
git push origin main
```

### Step 2: Deploy on Vercel
```bash
vercel --prod
```

Or via GitHub integration:
1. Push to GitHub (see Step 1)
2. Vercel auto-deploys on push to main

### Step 3: Verify Deployment
```bash
# Test API
curl https://your-app.vercel.app/health

# Monitor logs
vercel logs

# View environment variables
vercel env list
```

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB connection fails
- **Solution:** Verify MONGODB_URI in Vercel env vars
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for Vercel)

### Issue: JWT_SECRET undefined
- **Solution:** Add JWT_SECRET to Vercel environment variables
- Must be 32+ characters

### Issue: CORS blocked
- **Solution:** Add your Vercel URL to ALLOWED_ORIGINS env var
- Format: https://your-app.vercel.app

### Issue: 404 on /api routes
- **Solution:** Restart Vercel deployment or check server.js routing

---

## 📈 Monitoring

### Logs
```bash
vercel logs opulence-restaurant
```

### Performance
- Monitor cold starts
- Check database query performance
- Track API response times

### Errors
- All errors logged with Winston
- Check /logs directory locally
- Set up error tracking (Sentry, etc.)

---

## 🔄 Continuous Improvement

After deployment, consider:
1. Add automated tests (Jest/Mocha)
2. Set up CI/CD pipeline
3. Implement database backups
4. Add monitoring (Sentry, DataDog)
5. Performance profiling
6. A/B testing for UI changes
7. User analytics

---

## 📞 Support

If you encounter issues:
1. Check vercel.json routes match server.js setup
2. Verify all env vars are set correctly
3. Check MongoDB Atlas connection limits
4. Review application logs via `vercel logs`

---

**Status:** ✅ Ready for Deployment
**Last Updated:** 2026-02-20
**Version:** 1.1.0 (Refactored)

