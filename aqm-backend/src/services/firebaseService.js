// FirebaseService.js - Service for sending push notifications via Firebase Cloud Messaging

const admin = require('firebase-admin');

class FirebaseService {
    constructor() {
        // Check if Firebase is already initialized
        if (!admin.apps.length) {
            try {
                // Initialize Firebase Admin SDK
                // You'll need to add your Firebase service account JSON file
                const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '../firebase-service-account.json');

                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });

                console.log('Firebase Admin SDK initialized successfully');
            } catch (error) {
                console.error('Firebase initialization error:', error.message);
                console.warn('Push notifications will not work without Firebase credentials');
            }
        }

        this.messaging = admin.apps.length > 0 ? admin.messaging() : null;
    }

    /**
     * Send push notification to a single device
     * @param {string} token - FCM device token
     * @param {string} title - Notification title
     * @param {string} body - Notification body
     * @param {object} data - Additional data payload
     * @returns {Promise<object>} Result with success status
     */
    async sendPush(token, title, body, data = {}) {
        if (!this.messaging) {
            return { success: false, error: 'Firebase not initialized' };
        }

        try {
            const message = {
                notification: {
                    title,
                    body
                },
                data: {
                    ...data,
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                    timestamp: Date.now().toString()
                },
                token: token,
                webpush: {
                    fcmOptions: {
                        link: process.env.FRONTEND_URL || 'http://localhost:3000'
                    }
                }
            };

            const result = await this.messaging.send(message);
            console.log('Push notification sent successfully:', result);
            return { success: true, messageId: result };
        } catch (error) {
            console.error('Push notification error:', error);

            // Handle invalid tokens
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                return { success: false, error: 'invalid_token', shouldDelete: true };
            }

            return { success: false, error: error.message };
        }
    }

    /**
     * Send push notifications to multiple devices
     * @param {string[]} tokens - Array of FCM device tokens
     * @param {string} title - Notification title
     * @param {string} body - Notification body
     * @param {object} data - Additional data payload
     * @returns {Promise<object>} Result with success/failure counts
     */
    async sendBulkPush(tokens, title, body, data = {}) {
        if (!this.messaging) {
            return { success: false, error: 'Firebase not initialized' };
        }

        if (!tokens || tokens.length === 0) {
            return { success: true, successCount: 0, failureCount: 0 };
        }

        try {
            const message = {
                notification: {
                    title,
                    body
                },
                data: {
                    ...data,
                    timestamp: Date.now().toString()
                },
                tokens: tokens,
                webpush: {
                    fcmOptions: {
                        link: process.env.FRONTEND_URL || 'http://localhost:3000'
                    }
                }
            };

            const result = await this.messaging.sendMulticast(message);

            console.log(`Bulk push sent: ${result.successCount} successful, ${result.failureCount} failed`);

            // Collect invalid tokens for cleanup
            const invalidTokens = [];
            result.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const error = resp.error;
                    if (error.code === 'messaging/invalid-registration-token' ||
                        error.code === 'messaging/registration-token-not-registered') {
                        invalidTokens.push(tokens[idx]);
                    }
                }
            });

            return {
                success: true,
                successCount: result.successCount,
                failureCount: result.failureCount,
                invalidTokens: invalidTokens
            };
        } catch (error) {
            console.error('Bulk push notification error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send air quality alert to subscribers
     * @param {string[]} tokens - Array of FCM tokens
     * @param {string} district - District name
     * @param {number} pm25 - PM2.5 value
     * @param {number} pm10 - PM10 value
     * @returns {Promise<object>} Send result
     */
    async sendAirQualityAlert(tokens, district, pm25, pm10) {
        // Determine severity
        let emoji = '🟠';
        let level = 'Unhealthy for Sensitive Groups';

        if (pm25 > 150 || pm10 > 350) {
            emoji = '🟣';
            level = 'Very Unhealthy';
        } else if (pm25 > 115 || pm10 > 250) {
            emoji = '🔴';
            level = 'Unhealthy';
        }

        const title = `${emoji} Air Quality Alert - ${district}`;
        const body = `PM2.5: ${Math.round(pm25)} µg/m³ (${level}). Limit outdoor activities.`;

        const data = {
            type: 'air_quality_alert',
            district: district,
            pm25: pm25.toString(),
            pm10: pm10.toString(),
            level: level
        };

        return this.sendBulkPush(tokens, title, body, data);
    }
}

module.exports = new FirebaseService();
