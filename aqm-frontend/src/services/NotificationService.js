// NotificationService.js - Centralized service for browser notifications

class NotificationService {
    static NOTIFICATION_COOLDOWN = 60 * 60 * 1000; // 1 hour in milliseconds
    static lastNotifications = {};

    /**
     * Request notification permission from the user
     * @returns {Promise<boolean>} True if permission granted
     */
    static async requestPermission() {
        if (!("Notification" in window)) {
            console.warn("This browser doesn't support notifications");
            return false;
        }

        if (Notification.permission === "granted") {
            return true;
        }

        if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                localStorage.setItem("airQualityNotifications", "true");
                return true;
            }
        }

        return false;
    }

    /**
     * Check if notifications are enabled
     * @returns {boolean} True if notifications can be sent
     */
    static isEnabled() {
        return (
            "Notification" in window &&
            Notification.permission === "granted" &&
            localStorage.getItem("airQualityNotifications") !== "false"
        );
    }

    /**
     * Enable or disable notifications
     * @param {boolean} enabled
     */
    static setEnabled(enabled) {
        localStorage.setItem("airQualityNotifications", enabled ? "true" : "false");
    }

    /**
     * Send a browser notification
     * @param {string} title - Notification title
     * @param {string} body - Notification body text
     * @param {object} options - Additional notification options
     */
    static sendNotification(title, body, options = {}) {
        if (!this.isEnabled()) {
            return;
        }

        // Check cooldown to prevent spam
        const key = `${title}-${body}`;
        const lastSent = this.lastNotifications[key];
        if (lastSent && Date.now() - lastSent < this.NOTIFICATION_COOLDOWN) {
            console.log("Notification cooldown active, skipping:", title);
            return;
        }

        try {
            const notification = new Notification(title, {
                body,
                icon: "/Images/Logo-v2.svg",
                badge: "/Images/Logo-v2.svg",
                tag: options.tag || "air-quality",
                requireInteraction: false,
                silent: false,
                ...options
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            this.lastNotifications[key] = Date.now();
            console.log("Notification sent:", title);
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    }

    /**
     * Check PM levels and send notification if unhealthy
     * @param {number} pm25 - PM2.5 value in µg/m³
     * @param {number} pm10 - PM10 value in µg/m³
     * @param {string} district - District name
     */
    static checkPMLevel(pm25, pm10, district = "Current Location") {
        if (!this.isEnabled()) {
            return;
        }

        let level = null;
        let emoji = "";
        let message = "";
        let pollutant = "";

        // Check PM2.5 levels
        if (pm25 > 150) {
            level = "Very Unhealthy";
            emoji = "🟣";
            pollutant = "PM2.5";
            message = `PM2.5: ${Math.round(pm25)} µg/m³ - Avoid all outdoor activities. Everyone should stay indoors.`;
        } else if (pm25 > 115) {
            level = "Unhealthy";
            emoji = "🔴";
            pollutant = "PM2.5";
            message = `PM2.5: ${Math.round(pm25)} µg/m³ - Limit outdoor activities. Wear a mask if you must go outside.`;
        } else if (pm25 > 75) {
            level = "Unhealthy for Sensitive Groups";
            emoji = "🟠";
            pollutant = "PM2.5";
            message = `PM2.5: ${Math.round(pm25)} µg/m³ - Sensitive groups (children, elderly, respiratory issues) should reduce outdoor activities.`;
        }

        // Check PM10 levels (if worse than PM2.5 assessment)
        if (pm10 > 350 && level !== "Very Unhealthy") {
            level = "Very Unhealthy";
            emoji = "🟣";
            pollutant = "PM10";
            message = `PM10: ${Math.round(pm10)} µg/m³ - Avoid all outdoor activities. Everyone should stay indoors.`;
        } else if (pm10 > 250 && !message.includes("Very Unhealthy") && !message.includes("Unhealthy")) {
            level = "Unhealthy";
            emoji = "🔴";
            pollutant = "PM10";
            message = `PM10: ${Math.round(pm10)} µg/m³ - Limit outdoor activities. Wear a mask if you must go outside.`;
        } else if (pm10 > 150 && !message) {
            level = "Unhealthy for Sensitive Groups";
            emoji = "🟠";
            pollutant = "PM10";
            message = `PM10: ${Math.round(pm10)} µg/m³ - Sensitive groups should reduce outdoor activities.`;
        }

        // Send notification if pollution is unhealthy
        if (message && level) {
            this.sendNotification(
                `${emoji} Air Quality Alert - ${district}`,
                message,
                {
                    tag: `pm-alert-${district.toLowerCase()}`,
                    data: { level, pollutant, pm25, pm10 }
                }
            );
        }
    }

    /**
     * Check forecast and send warning for upcoming high pollution
     * @param {object} forecast - Forecast data with pm25, pm10, day, date
     * @param {string} district - District name
     */
    static checkForecast(forecast, district) {
        if (!this.isEnabled() || !forecast) {
            return;
        }

        const { pm25, pm10, day, date } = forecast;

        // Only warn if pollution will be unhealthy (>75 for PM2.5 or >150 for PM10)
        if (pm25 > 75 || pm10 > 150) {
            let emoji = "⚠️";
            let level = "Moderate";

            if (pm25 > 115 || pm10 > 250) {
                emoji = "🔴";
                level = "Unhealthy";
            } else if (pm25 > 75 || pm10 > 150) {
                emoji = "🟠";
                level = "Unhealthy for Sensitive Groups";
            }

            const message = `High pollution expected ${day}, ${date}. PM2.5: ${Math.round(pm25)} µg/m³. Plan indoor activities.`;

            this.sendNotification(
                `${emoji} Air Quality Warning - ${district}`,
                message,
                {
                    tag: `forecast-${district.toLowerCase()}-${date}`,
                    data: { level, pm25, pm10, day, date }
                }
            );
        }
    }

    /**
     * Clear notification history (for testing)
     */
    static clearHistory() {
        this.lastNotifications = {};
        console.log("Notification history cleared");
    }
}

export default NotificationService;
