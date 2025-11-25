// alertScheduler.js - Monitors PM levels and sends push notifications

const cron = require('node-cron');
const firebaseService = require('./firebaseService');
const db = require('../config/database');

class AlertScheduler {
    constructor() {
        this.lastAlerts = {}; // Track last alert time per district
        this.COOLDOWN_PERIOD = 60 * 60 * 1000; // 1 hour in milliseconds
    }

    /**
     * Start the alert scheduler
     * Checks PM levels every 5 minutes
     */
    start() {
        console.log('Alert Scheduler started - checking PM levels every 5 minutes');

        // Run every 5 minutes
        cron.schedule('*/5 * * * *', () => {
            this.checkAndAlert();
        });

        // Also run immediately on start
        setTimeout(() => this.checkAndAlert(), 5000);
    }

    /**
     * Check PM levels and send alerts if needed
     */
    async checkAndAlert() {
        try {
            console.log('[Alert Scheduler] Checking PM levels...');

            const districts = [
                'Alatau', 'Almaly', 'Auezov', 'Bostandyk',
                'Medeu', 'Nauryzbay', 'Turksib', 'Zhetysu'
            ];

            for (const district of districts) {
                await this.checkDistrictAndAlert(district);
            }
        } catch (error) {
            console.error('[Alert Scheduler] Error:', error);
        }
    }

    /**
     * Check a specific district and send alerts
     * @param {string} district - District name
     */
    async checkDistrictAndAlert(district) {
        try {
            // Get latest PM data for this district
            // This would query your sensor data table
            const sensorData = await this.getLatestSensorData(district);

            if (!sensorData) {
                return; // No data available
            }

            const { pm25, pm10 } = sensorData;

            // Check if levels are unhealthy (PM2.5 >75 or PM10 >150)
            if (pm25 <= 75 && pm10 <= 150) {
                return; // Air quality is acceptable
            }

            // Check cooldown
            const lastAlert = this.lastAlerts[district];
            if (lastAlert && Date.now() - lastAlert < this.COOLDOWN_PERIOD) {
                console.log(`[Alert Scheduler] Cooldown active for ${district}, skipping`);
                return;
            }

            // Get subscribers for this district
            const subscribers = await this.getSubscribers(district);

            if (subscribers.length === 0) {
                console.log(`[Alert Scheduler] No subscribers for ${district}`);
                return;
            }

            // Send alerts
            console.log(`[Alert Scheduler] Sending alerts to ${subscribers.length} subscribers in ${district}`);
            console.log(`[Alert Scheduler] PM2.5: ${pm25}, PM10: ${pm10}`);

            const result = await firebaseService.sendAirQualityAlert(
                subscribers,
                district,
                pm25,
                pm10
            );

            // Clean up invalid tokens
            if (result.invalidTokens && result.invalidTokens.length > 0) {
                await this.cleanupInvalidTokens(result.invalidTokens);
            }

            // Update last alert time
            this.lastAlerts[district] = Date.now();

            console.log(`[Alert Scheduler] Sent ${result.successCount} alerts, ${result.failureCount} failed`);
        } catch (error) {
            console.error(`[Alert Scheduler] Error checking ${district}:`, error);
        }
    }

    /**
     * Get latest sensor data for a district
     * @param {string} district - District name
     * @returns {Promise<object>} Sensor data with pm25 and pm10
     */
    async getLatestSensorData(district) {
        try {
            // This is a placeholder - adjust based on your actual database schema
            // For now, generate random test data

            // In production, you would query your sensor data table:
            // const result = await db.query(
            //   'SELECT pm25, pm10 FROM sensor_data WHERE district = $1 ORDER BY timestamp DESC LIMIT 1',
            //   [district]
            // );

            // For testing, generate random PM values
            const pm25 = Math.floor(Math.random() * 150) + 10;
            const pm10 = Math.floor(Math.random() * 200) + 20;

            return { pm25, pm10 };
        } catch (error) {
            console.error('Error getting sensor data:', error);
            return null;
        }
    }

    /**
     * Get FCM tokens for subscribers in a district
     * @param {string} district - District name
     * @returns {Promise<string[]>} Array of FCM tokens
     */
    async getSubscribers(district) {
        try {
            const result = await db.query(
                'SELECT fcm_token FROM notification_subscriptions WHERE district = $1 AND enabled = true',
                [district]
            );

            return result.rows.map(row => row.fcm_token);
        } catch (error) {
            console.error('Error getting subscribers:', error);
            return [];
        }
    }

    /**
     * Remove invalid FCM tokens from database
     * @param {string[]} tokens - Array of invalid tokens
     */
    async cleanupInvalidTokens(tokens) {
        try {
            await db.query(
                'DELETE FROM notification_subscriptions WHERE fcm_token = ANY($1)',
                [tokens]
            );
            console.log(`[Alert Scheduler] Cleaned up ${tokens.length} invalid tokens`);
        } catch (error) {
            console.error('Error cleaning up tokens:', error);
        }
    }

    /**
     * Stop the scheduler
     */
    stop() {
        console.log('Alert Scheduler stopped');
        // Cron jobs are automatically stopped when the process exits
    }
}

module.exports = new AlertScheduler();
