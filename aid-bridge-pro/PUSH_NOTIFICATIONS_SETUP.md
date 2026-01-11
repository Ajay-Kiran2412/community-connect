# Push Notifications Setup Guide

This guide will help you set up push notifications for the Community Connect app. When a new post is created, all subscribed users will receive a notification on their phones.

## System Architecture

```
User creates a post
    ↓
Backend receives POST request
    ↓
Post is saved to MongoDB
    ↓
Notification Service retrieves all user device tokens
    ↓
Firebase Cloud Messaging (FCM) sends push notifications
    ↓
User's phone receives notification
    ↓
User clicks notification → Opens app
```

## Prerequisites

1. **Firebase Project** - Create one at [Firebase Console](https://console.firebase.google.com)
2. **Node.js** - Already installed with `firebase-admin` package
3. **Modern Browser** - Chrome, Firefox, Safari, Edge (supports Web Push API)
4. **HTTPS** - Required for production (localhost works for development)

## Step 1: Create Firebase Project

### Option A: Using Existing Google Account
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project"
3. Enter project name (e.g., "community-connect")
4. Skip analytics for now
5. Click "Create Project"

### Option B: Quick Setup
If you don't have a Firebase account, sign up at https://firebase.google.com

## Step 2: Get Firebase Configuration

### For Backend (Node.js)

1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. A JSON file will download - this is your service account key
4. Copy the JSON content
5. Open `community-connect-backend/.env`
6. Set `FIREBASE_SERVICE_ACCOUNT` with the JSON (one-line format):
   ```bash
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}
   ```

### For Frontend (Web)

1. Go to **Project Settings** → **General**
2. Scroll down to "Your apps" section
3. Click the Web icon (</>) if you haven't added a web app
4. Register app with name "community-connect-web"
5. Copy the firebaseConfig object
6. Create `.env.local` in project root with:

```env
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id_here
VITE_FIREBASE_APP_ID=1:xxx:web:xxx
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

### Get VAPID Key

1. Go to **Cloud Messaging** tab in Firebase Console
2. Under "Web Configuration", click **Generate Key Pair** (if not already generated)
3. Copy the public key to `VITE_FIREBASE_VAPID_KEY`

## Step 3: Backend Configuration

The backend notification service is already set up in:
- `src/services/notificationService.js` - Handles sending notifications
- `src/controllers/authController.js` - Device token endpoints
- `src/controllers/postController.js` - Sends notifications on new posts

### Install Dependencies

Backend dependencies are already installed. If not, run:
```bash
cd community-connect-backend
npm install firebase-admin
```

### Update .env

Make sure your `community-connect-backend/.env` has:
```env
FIREBASE_SERVICE_ACCOUNT={...your service account JSON...}
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

## Step 4: Frontend Setup

Frontend setup is already configured. You just need to:

1. **Create `.env.local`** in the project root with Firebase config
2. **Service Worker** is already at `public/firebase-messaging-sw.js`
3. **Firebase Messaging Service** is at `src/services/firebaseMessaging.ts`
4. **Hook for Notifications** is at `src/hooks/usePushNotifications.ts`

### Install Dependencies

Frontend dependencies are already installed:
```bash
npm install
```

## Step 5: Enable Notifications in Your App

### Option A: Auto-enable on Login

Add to your `App.tsx` or main layout component:

```tsx
import { usePushNotifications } from '@/hooks/usePushNotifications';

function App() {
  const { isSupported, isEnabled, enableNotifications } = usePushNotifications();

  useEffect(() => {
    // Auto-enable notifications if supported and user is logged in
    if (isSupported && !isEnabled) {
      enableNotifications();
    }
  }, [isSupported, isEnabled]);

  return (
    // Your app content
  );
}
```

### Option B: Add a Settings Toggle

```tsx
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';

function NotificationSettings() {
  const { isSupported, isEnabled, loading, enableNotifications, disableNotifications } = usePushNotifications();

  if (!isSupported) {
    return <p>Notifications not supported in this browser</p>;
  }

  return (
    <div>
      <p>Notifications: {isEnabled ? 'Enabled ✓' : 'Disabled'}</p>
      {!isEnabled ? (
        <Button onClick={enableNotifications} disabled={loading}>
          Enable Notifications
        </Button>
      ) : (
        <Button onClick={disableNotifications} disabled={loading} variant="destructive">
          Disable Notifications
        </Button>
      )}
    </div>
  );
}
```

## Step 6: API Endpoints Reference

### Save Device Token
```
POST /api/auth/device-token
Headers: Authorization: Bearer {token}
Body: { "deviceToken": "FCM_TOKEN_HERE" }
```

### Remove Device Token
```
DELETE /api/auth/device-token
Headers: Authorization: Bearer {token}
Body: { "deviceToken": "FCM_TOKEN_HERE" }
```

## Step 7: Testing

### Test Backend Notifications

1. Create a post via your app
2. Check backend logs for "Notifications sent for new post"
3. Verify users received notifications on their devices

### Test Frontend

1. Start the dev server: `npm run dev`
2. Open the app in browser
3. Allow notification permission when prompted
4. Check browser console for "Service Worker registered"
5. Create a new post from another account
6. You should see a notification pop-up

### Manual Test with Firebase Admin SDK

```javascript
// Test in Node.js
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const message = {
  notification: {
    title: 'Test Notification',
    body: 'This is a test message',
  },
  token: 'DEVICE_TOKEN_HERE',
};

admin.messaging().send(message)
  .then((response) => console.log('Success:', response))
  .catch((error) => console.log('Error:', error));
```

## Troubleshooting

### "Firebase configuration is not complete"
- Make sure all environment variables are set in `.env.local`
- Restart the dev server after updating env vars

### "Service Worker registration failed"
- Check that you're on HTTPS (production) or localhost (development)
- Ensure `public/firebase-messaging-sw.js` exists
- Check browser console for specific error messages

### "Notifications not showing"
- User must grant notification permission
- Notifications are blocked in private/incognito mode in some browsers
- Check if service worker is active in DevTools → Application → Service Workers

### "Device tokens not being saved"
- Ensure user is authenticated (has valid JWT token)
- Check backend logs for errors in `saveDeviceToken` endpoint
- Verify MongoDB connection is working

### "Getting 403 Forbidden from Firebase"
- Check your service account JSON is valid
- Verify `FIREBASE_SERVICE_ACCOUNT` is properly formatted (single line)
- Ensure the Firebase project ID matches

## Environment Variables Checklist

### Backend (.env)
- [ ] `FIREBASE_SERVICE_ACCOUNT` - Full JSON from service account key
- [ ] `FIREBASE_DATABASE_URL` - From Firebase Console
- [ ] `PORT`, `MONGODB_URI`, other existing vars

### Frontend (.env.local)
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_FIREBASE_VAPID_KEY`

## File Structure Created

```
community-connect-backend/
  src/
    services/
      notificationService.js (NEW)
    controllers/
      authController.js (UPDATED - added device token methods)
      postController.js (UPDATED - sends notifications)
    models/
      userModel.js (UPDATED - added deviceTokens field)
    routes/
      authRoutes.js (UPDATED - added device token endpoints)
  .env (UPDATED - added Firebase config)

frontend/
  public/
    firebase-messaging-sw.js (NEW)
  src/
    services/
      firebaseMessaging.ts (NEW)
    hooks/
      usePushNotifications.ts (NEW)
  .env.local (NEW - add Firebase config here)
```

## Next Steps

1. **Set up Firebase Console** with your account
2. **Add environment variables** to backend and frontend
3. **Test notifications** with the manual test steps
4. **Integrate notification UI** in your Settings or Profile page
5. **Deploy** to production with HTTPS

## Support

For Firebase issues:
- [Firebase Documentation](https://firebase.google.com/docs/messaging)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

For this app:
- Check logs in `community-connect-backend/` for backend issues
- Check browser console for frontend issues
- Verify all environment variables are set correctly
