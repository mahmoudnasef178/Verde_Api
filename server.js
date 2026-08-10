require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('');
    console.log('🌿 ─────────────────────────────────');
    console.log(`🌿  Verde API running on port ${PORT}`);
    console.log(`🌿  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌿  Swagger UI:   http://localhost:${PORT}/api-docs`);
    console.log(`🌿  OpenAPI JSON: http://localhost:${PORT}/api-docs.json`);
    console.log('🌿 ─────────────────────────────────');
    console.log('');
  });
});
