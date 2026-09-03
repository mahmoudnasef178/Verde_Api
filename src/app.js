const express = require('express');
const cors = require('cors');

const rateLimit = require('express-rate-limit');

const swaggerSpec = require('./config/swagger');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const orderRoutes = require('./routes/order.routes');
const couponRoutes = require('./routes/coupon.routes');
const telegramRoutes = require('./routes/telegram.routes');

const app = express();

// ─────────────────────────────────────────────
// Middleware & Rate Limiting
// ─────────────────────────────────────────────

// CORS — allow requests from the Next.js frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiter: 150 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح به من الطلبات، يرجى المحاولة لاحقاً بعد 15 دقيقة',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Auth Limiter: 20 login/signup attempts per 15 minutes per IP (Brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'محاولات تسجيل دخول كثيرة جداً، يرجى المحاولة بعد 15 دقيقة',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Order Creation Limiter: 15 orders per 15 minutes per IP (Anti-Spam protection)
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح لإنشاء الطلبات، يرجى المحاولة بعد قليل',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─────────────────────────────────────────────
// Swagger UI — 100% Online via Cloudflare CDN
// No local static files served at all
// ─────────────────────────────────────────────
const SWAGGER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14';

const swaggerHtml = (specUrl) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verde Parfums API Docs</title>
  <link rel="stylesheet" href="${SWAGGER_CDN}/swagger-ui.min.css" />
  <style>
    body { margin: 0; background: #fafafa; }
    .swagger-ui .topbar { display: none !important; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${SWAGGER_CDN}/swagger-ui-bundle.min.js"></script>
  <script src="${SWAGGER_CDN}/swagger-ui-standalone-preset.min.js"></script>
  <script>
    window.onload = function () {
      SwaggerUIBundle({
        url: "${specUrl}",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        plugins: [SwaggerUIBundle.plugins.DownloadUrl],
        layout: 'StandaloneLayout',
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
      });
    };
  </script>
</body>
</html>`;

// Serve fully online Swagger UI at /api-docs and /docs
const serveSwagger = (req, res) => {
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const specUrl = `${protocol}://${host}/api-docs.json`;
  res.setHeader('Content-Type', 'text/html');
  res.send(swaggerHtml(specUrl));
};

app.get('/api-docs', serveSwagger);
app.get('/docs', serveSwagger);

// OpenAPI JSON spec — open CORS so SwaggerHub / Postman / any online tool can import it
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(swaggerSpec);
});

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/orders', orderLimiter, orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/telegram', telegramRoutes);



/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: فحص حالة السيرفر (Health Check)
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: السيرفر يعمل بنجاح
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🌿 Verde API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `المسار ${req.originalUrl} غير موجود`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'خطأ داخلي في الخادم',
  });
});

module.exports = app;
