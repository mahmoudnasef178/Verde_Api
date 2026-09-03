require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { startPolling } = require('./src/services/telegramPolling.service');

const PORT = process.env.PORT || 5000;

// Start HTTP server immediately to pass Railway health checks
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🌿 ─────────────────────────────────');
  console.log(`🌿  Verde API running on port ${PORT}`);
  console.log(`🌿  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌿  Swagger UI:   http://localhost:${PORT}/api-docs`);
  console.log(`🌿  OpenAPI JSON: http://localhost:${PORT}/api-docs.json`);
  console.log('🌿 ─────────────────────────────────');
  console.log('');

  // Connect to MongoDB asynchronously
  connectDB().then(() => {
    // Start Telegram Bot polling service
    startPolling().catch((err) => {
      console.error('❌ Failed to start Telegram polling:', err.message);
    });
  });
});
