const express = require('express');
const { handleWebhook } = require('../controllers/telegram.controller');

const router = express.Router();

/**
 * @openapi
 * /api/telegram/webhook:
 *   post:
 *     summary: استقبال إشعارات وتحديثات Telegram Webhook
 *     tags:
 *       - Telegram
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/webhook', handleWebhook);

module.exports = router;
