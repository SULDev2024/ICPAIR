// firebase-config.js - Firebase Configuration for Push Notifications
// IMPORTANT: Replace the values below with your actual Firebase config from Step 4

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// TODO: Replace these values with your actual Firebase configuration
// You got these values in Step 4 of the setup guide
const firebaseConfig = {
    apiKey: "AIzaSyC1XK43wQGorijOPhm_QRioFn27mfF-0fk",
    authDomain: "aqm-notifications.firebaseapp.com",
    projectId: "aqm-notifications",
    storageBucket: "aqm-notifications.firebasestorage.app",
    messagingSenderId: "550505067458",
    appId: "1:550505067458:web:7ca5d4f83765e2c4e9dc5b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging = null;
try {
    messaging = getMessaging(app);
    console.log('Firebase Messaging initialized successfully');
} catch (error) {
    console.error('Firebase Messaging initialization error:', error);
}

/**
 * Request permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if failed
 */
export const requestNotificationPermission = async () => {
    if (!messaging) {
        console.error('Firebase Messaging not initialized');
        return null;
    }

    try {
        // Request notification permission
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            console.log('Notification permission granted');

            // Get FCM token
            // TODO: Replace with your VAPID key from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
            const token = await getToken(messaging, {
                vapidKey: 'BB2EfRHcequ1Lvdq3DzMfea4SVdZXHWDXJgU7Inq07i53BRNJnUHPcKlmLgSgkblZmMUPUEigwp9XVS653AtVNA'
            });

            if (token) {
                console.log('FCM Token:', token);
                return token;
            } else {
                console.log('No registration token available');
                return null;
            }
        } else {
            console.log('Notification permission denied');
            return null;
        }
    } catch (error) {
        console.error('Error getting notification permission:', error);
        return null;
    }
};

/**
 * Listen for foreground messages
 */
export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) {
            resolve(null);
            return;
        }

        onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);
            resolve(payload);
        });
    });

export { messaging };
