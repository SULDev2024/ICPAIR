// notificationRoutes.js - API routes for managing push notification subscriptions

const express = require('express');
const router = express.Router();
const firebaseService = require('../services/firebaseService');
const db = require('../config/database'); // Assuming you have a database config

/**
 * POST /api/notifications/subscribe
 * Subscribe to push notifications
 */
router.post('/subscribe', async (req, res) => {
    try {
        const { fcm_token, district, user_id } = req.body;

        if (!fcm_token || !district) {
            return res.status(400).json({
                error: 'Missing required fields: fcm_token and district'
            });
        }

        // Check if subscription already exists
        const existing = await db.query(
            'SELECT * FROM notification_subscriptions WHERE fcm_token = $1',
            [fcm_token]
        );

        if (existing.rows.length > 0) {
            // Update existing subscription
            await db.query(
                'UPDATE notification_subscriptions SET district = $1, enabled = true, updated_at = CURRENT_TIMESTAMP WHERE fcm_token = $2',
                [district, fcm_token]
            );

            return res.json({
                success: true,
                message: 'Subscription updated',
                subscription_id: existing.rows[0].id
            });
        }

        // Create new subscription
        const result = await db.query(
            'INSERT INTO notification_subscriptions (user_id, fcm_token, district, enabled) VALUES ($1, $2, $3, true) RETURNING id',
            [user_id || null, fcm_token, district]
        );

        res.json({
            success: true,
            message: 'Subscribed successfully',
            subscription_id: result.rows[0].id
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

/**
 * POST /api/notifications/unsubscribe
 * Unsubscribe from push notifications
 */
router.post('/unsubscribe', async (req, res) => {
    try {
        const { fcm_token } = req.body;

        if (!fcm_token) {
            return res.status(400).json({ error: 'Missing fcm_token' });
        }

        await db.query(
            'UPDATE notification_subscriptions SET enabled = false WHERE fcm_token = $1',
            [fcm_token]
        );

        res.json({ success: true, message: 'Unsubscribed successfully' });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ error: 'Failed to unsubscribe' });
    }
});

/**
 * GET /api/notifications/preferences
 * Get notification preferences for a token
 */
router.get('/preferences', async (req, res) => {
    try {
        const { fcm_token } = req.query;

        if (!fcm_token) {
            return res.status(400).json({ error: 'Missing fcm_token' });
        }

        const result = await db.query(
            'SELECT id, district, enabled, created_at FROM notification_subscriptions WHERE fcm_token = $1',
            [fcm_token]
        );

        if (result.rows.length === 0) {
            return res.json({ subscribed: false });
        }

        res.json({
            subscribed: true,
            ...result.rows[0]
        });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ error: 'Failed to get preferences' });
    }
});

/**
 * POST /api/notifications/send-alert
 * Send alert to all subscribers in a district (admin only)
 */
router.post('/send-alert', async (req, res) => {
    try {
        const { district, pm25, pm10 } = req.body;

        if (!district || !pm25 || !pm10) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get all enabled subscriptions for this district
        const result = await db.query(
            'SELECT fcm_token FROM notification_subscriptions WHERE district = $1 AND enabled = true',
            [district]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: true,
                message: 'No subscribers for this district',
                sent: 0
            });
        }

        const tokens = result.rows.map(row => row.fcm_token);

        // Send push notifications
        const sendResult = await firebaseService.sendAirQualityAlert(
            tokens,
            district,
            pm25,
            pm10
        );

        // Clean up invalid tokens
        if (sendResult.invalidTokens && sendResult.invalidTokens.length > 0) {
            await db.query(
                'DELETE FROM notification_subscriptions WHERE fcm_token = ANY($1)',
                [sendResult.invalidTokens]
            );
        }

        res.json({
            success: true,
            sent: sendResult.successCount,
            failed: sendResult.failureCount,
            cleaned: sendResult.invalidTokens?.length || 0
        });
    } catch (error) {
        console.error('Send alert error:', error);
        res.status(500).json({ error: 'Failed to send alert' });
    }
});

/**
 * DELETE /api/notifications/cleanup
 * Remove invalid/expired tokens (admin only)
 */
router.delete('/cleanup', async (req, res) => {
    try {
        // Delete subscriptions older than 6 months that are disabled
        const result = await db.query(
            `DELETE FROM notification_subscriptions 
       WHERE enabled = false 
       AND updated_at < NOW() - INTERVAL '6 months'
       RETURNING id`
        );

        res.json({
            success: true,
            deleted: result.rowCount
        });
    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({ error: 'Failed to cleanup' });
    }
});

module.exports = router;
