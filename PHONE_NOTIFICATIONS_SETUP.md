# Phone Notification System - Setup Guide

## Backend Implementation ✅ Complete

The following backend files have been created:

1. **Database Migration**: `src/migrations/create_notification_subscriptions.sql`
2. **Firebase Service**: `src/services/firebaseService.js`
3. **Alert Scheduler**: `src/services/alertScheduler.js`
4. **API Routes**: `src/routes/notificationRoutes.js`

---

## Required Setup Steps

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name it "AQM Notifications"
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Get Firebase Credentials

**For Backend (Admin SDK)**:
1. In Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `firebase-service-account.json`
4. Place it in `aqm-backend/` directory

**For Frontend (Web SDK)**:
1. In Firebase Console → Project Settings → General
2. Scroll to "Your apps" → Click Web icon (</>)
3. Register app name: "AQM Website"
4. Copy the `firebaseConfig` object

### Step 3: Enable Cloud Messaging

1. In Firebase Console → Build → Cloud Messaging
2. Click "Get Started"
3. No additional configuration needed

### Step 4: Install Dependencies

**Backend**:
```bash
cd aqm-backend
npm install firebase-admin node-cron
```

**Frontend**:
```bash
cd aqm-frontend
npm install firebase
```

### Step 5: Configure Environment Variables

Add to `aqm-backend/.env`:
```
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
FRONTEND_URL=http://localhost:3000
```

### Step 6: Run Database Migration

```bash
cd aqm-backend
psql -U your_username -d your_database -f src/migrations/create_notification_subscriptions.sql
```

### Step 7: Update Backend Server

Add to `aqm-backend/src/server.js` or `aqm-backend/index.js`:

```javascript
// Add notification routes
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// Start alert scheduler
const alertScheduler = require('./services/alertScheduler');
alertScheduler.start();
```

---

## Frontend Implementation (To Be Completed)

### Files to Create:

1. **`src/firebase-config.js`** - Firebase initialization
2. **`src/components/NotificationSettings.jsx`** - Settings UI
3. **`public/firebase-messaging-sw.js`** - Service worker

### Quick Implementation:

**1. Create `src/firebase-config.js`**:
```javascript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
```

**2. Request Permission in App.jsx**:
```javascript
import { messaging, getToken } from './firebase-config';

useEffect(() => {
  const requestNotificationPermission = async () => {
    try {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // Get from Firebase Console
      });
      
      if (token) {
        // Subscribe to notifications
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fcm_token: token,
            district: 'Alatau' // Default or from user selection
          })
        });
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
  };

  requestNotificationPermission();
}, []);
```

**3. Create Service Worker `public/firebase-messaging-sw.js`**:
```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/Images/Logo-v2.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

---

## Testing

### Test Backend Alert Sending:

```bash
curl -X POST http://localhost:5005/api/notifications/send-alert \
  -H "Content-Type: application/json" \
  -d '{"district":"Alatau","pm25":120,"pm10":200}'
```

### Test Subscription:

```bash
curl -X POST http://localhost:5005/api/notifications/subscribe \
  -H "Content-Type: application/json" \
  -d '{"fcm_token":"test_token_123","district":"Alatau"}'
```

---

## How It Works

1. **User visits website** → Frontend requests FCM token
2. **Token obtained** → Frontend sends to `/api/notifications/subscribe`
3. **Subscription saved** → Token stored in database with district preference
4. **Alert Scheduler runs** → Checks PM levels every 5 minutes
5. **High pollution detected** → Queries subscribers for affected district
6. **Push notifications sent** → Firebase delivers to all subscribed devices
7. **User receives alert** → Even if browser is closed (via service worker)

---

## Next Steps

1. ✅ Backend infrastructure complete
2. ⏳ Create Firebase project and get credentials
3. ⏳ Complete frontend Firebase integration
4. ⏳ Test on mobile device
5. ⏳ Deploy and monitor

---

## Important Notes

- **Firebase is FREE** for push notifications (unlimited)
- **Service worker required** for background notifications
- **HTTPS required** in production (localhost works for testing)
- **User permission required** - must click "Allow"
- **Tokens can expire** - handle invalid tokens gracefully (already implemented)

---

## Troubleshooting

**"Firebase not initialized"**:
- Check `firebase-service-account.json` path
- Verify file permissions

**"Permission denied"**:
- User must click "Allow" in browser prompt
- Check browser notification settings

**"Invalid registration token"**:
- Token expired or invalid
- Backend automatically cleans up invalid tokens

**Notifications not received**:
- Check service worker is registered
- Verify FCM token is correct
- Check browser console for errors
