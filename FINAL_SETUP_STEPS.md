# 🎯 FINAL SETUP STEPS - Complete These to Enable Push Notifications

## ✅ What's Already Done:
- ✅ Backend code created (Firebase service, alert scheduler, API routes)
- ✅ Frontend code created (Firebase config, service worker, App.jsx integration)
- ✅ Packages installed (firebase-admin, node-cron, firebase)

---

## 📝 What YOU Need to Do (5 Minutes):

### Step 1: Add Your Firebase Credentials (3 minutes)

You need to copy your Firebase configuration into 2 files:

#### File 1: `aqm-frontend/src/firebase-config.js`

1. Open this file in VS Code
2. Find line 9-15 (the `firebaseConfig` object)
3. Replace the placeholder values with YOUR actual values from Firebase Console

**Where to get these values:**
- Go to Firebase Console → Project Settings → General tab
- Scroll to "Your apps" → Find your web app
- Copy the values from the `firebaseConfig` object

**Also add VAPID Key (line 48):**
- In Firebase Console → Project Settings → Cloud Messaging tab
- Under "Web Push certificates" → Click "Generate key pair"
- Copy the key and paste it in line 48

#### File 2: `aqm-frontend/public/firebase-messaging-sw.js`

1. Open this file
2. Find line 7-13 (the `firebase.initializeApp` object)
3. Paste the SAME values as File 1

---

### Step 2: Add Backend Firebase Credentials (1 minute)

1. Find the file you downloaded in Step 3 of the setup (named something like `aqm-notifications-firebase-adminsdk-xxxxx.json`)
2. Rename it to: **`firebase-service-account.json`**
3. Move it to: `C:\Users\Samiullah Laly\Desktop\AQM-Project\aqm\aqm-backend\`

---

### Step 3: Update Backend Server (1 minute)

Open `aqm-backend/src/server.js` (or `aqm-backend/index.js`) and add these lines:

**Find where other routes are defined** (look for lines like `app.use('/api/...`), then add:

```javascript
// Add notification routes
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// Start alert scheduler
const alertScheduler = require('./services/alertScheduler');
alertScheduler.start();
```

---

### Step 4: Run Database Migration (Optional - if you have PostgreSQL)

If you're using PostgreSQL database:

```powershell
cd C:\Users\Samiullah Laly\Desktop\AQM-Project\aqm\aqm-backend
psql -U your_username -d your_database -f src/migrations/create_notification_subscriptions.sql
```

If you don't have PostgreSQL set up, skip this step for now.

---

## 🚀 Test It!

### Step 5: Restart Your Servers

1. **Stop** the frontend and backend servers (Ctrl+C)
2. **Restart backend**:
   ```powershell
   cd aqm-backend
   npm run dev
   ```
3. **Restart frontend**:
   ```powershell
   cd aqm-frontend
   npm start
   ```

### Step 6: Test Push Notifications

1. Open `http://localhost:3000`
2. You should see TWO permission prompts:
   - First: Browser notifications (from NotificationService)
   - Second: Push notifications (from Firebase)
3. Click **"Allow"** on both
4. Check browser console (F12) - you should see:
   - "FCM Token obtained..."
   - "Successfully subscribed to push notifications"

### Step 7: Send a Test Alert

Open a new terminal and run:

```powershell
curl -X POST http://localhost:5005/api/notifications/send-alert `
  -H "Content-Type: application/json" `
  -d '{\"district\":\"Alatau\",\"pm25\":120,\"pm10\":200}'
```

You should receive a push notification on your device!

---

## 🎉 Success Indicators:

✅ No errors in browser console
✅ FCM token appears in console
✅ "Successfully subscribed" message
✅ Test alert notification received

---

## ❌ Troubleshooting:

**"Firebase not initialized"**:
- Check that you added credentials to both config files
- Verify `firebase-service-account.json` is in the backend folder

**"Permission denied"**:
- Make sure you clicked "Allow" on both prompts
- Check browser notification settings

**No notification received**:
- Check that backend server is running
- Verify FCM token was saved (check browser console)
- Make sure service worker is registered (check Application tab in DevTools)

---

## 📞 Need Help?

If you get stuck, tell me:
1. Which step you're on
2. What error message you see
3. Screenshot of the error (if possible)

I'll help you fix it! 🚀
