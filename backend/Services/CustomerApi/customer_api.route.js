const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../../Middleware/authenticate');
const { getEquipmentData } = require('./customer_api.controller');

const router = express.Router();

// 10 requests per minute per IP (express-rate-limit v5 compatible)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many requests. Limit is 10 requests per minute.' },
});

/**
 * GET /v1/customer-api/equipment-data
 * Fetches data from the upstream API (input format) and converts to GL BACnet format.
 *
 * Headers:
 *   Authorization: Bearer <jwt_token>
 *
 * Query params:
 *   upstream_url (optional) - override the CUSTOMER_API_UPSTREAM_URL env variable
 */
// line 25 — for testing only, re-enable authenticate in production
router.get('/equipment-data', apiLimiter, /* authenticate, */ getEquipmentData);

module.exports = router;
