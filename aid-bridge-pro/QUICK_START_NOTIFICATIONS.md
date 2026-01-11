# Push Notifications - Quick Start

## What Was Added?

Your app now has a complete push notification system. When someone creates a new post, all other users automatically receive a notification on their phones.

## Quick Setup (5 minutes)

### 1. Create Firebase Project
- Go to https://console.firebase.google.com
- Click "Create Project" → Name it "community-connect"
- Wait for setup to complete

### 2. Get Backend Credentials
- In Firebase Console → Project Settings → Service Accounts
- Click "Generate New Private Key"
- Copy the JSON content
- In `community-connect-backend/.env`, set:
  ```
  FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
  ```

### 3. Get Frontend Credentials
- In Firebase Console → Project Settings → General
- Add a Web App if not exists
- Copy the config
- Create `.env.local` in project root:
  ```
  VITE_FIREBASE_API_KEY=xxx
  VITE_FIREBASE_PROJECT_ID=xxx
  ... (copy all from config)
  ```
- In Cloud Messaging tab, generate VAPID key and add to `.env.local`

### 4. Restart Servers
```bash
# Backend
cd community-connect-backend
npm install  # if needed
npm run dev

# Frontend (in another terminal)
npm run dev
```

### 5. Test It
1. Open app in browser, allow notifications
2. Create a post from one account
3. Switch to another account
4. Should see notification pop-up

## What Gets Sent?

When a new post is created:
- **Title**: "New [category] Post" (e.g., "New Blood Post")
- **Body**: The post title
- **Click Action**: Opens the post

## How It Works

```
You create post
         ↓
Backend saves to MongoDB
         ↓
Backend gets all user device tokens
         ↓
Firebase sends notification to all tokens
         ↓
Users see notification on their phones
         ↓
Click → App opens with the post
```

## File Changes Summary

**Backend:**
- `src/services/notificationService.js` - NEW (handles Firebase)
- `src/controllers/authController.js` - UPDATED (device token endpoints)
- `src/controllers/postController.js` - UPDATED (sends notifications)
- `src/models/userModel.js` - UPDATED (stores device tokens)
- `src/routes/authRoutes.js` - UPDATED (device token routes)
- `.env` - UPDATED (Firebase config)

**Frontend:**
- `public/firebase-messaging-sw.js` - NEW (service worker)
- `src/services/firebaseMessaging.ts` - NEW (Firebase setup)
- `src/hooks/usePushNotifications.ts` - NEW (React hook)
- `.env.local` - NEW (Firebase config, you create this)

## Common Issues

### Notifications not working?
1. Check `.env.local` has all Firebase values
2. Check browser console (F12) for errors
3. Allow notifications when browser asks
4. Make sure user is logged in

### Backend not sending?
1. Check `community-connect-backend/.env` has FIREBASE_SERVICE_ACCOUNT
2. Check `npm install firebase-admin` was run
3. Check backend logs for errors

### Service Worker issues?
1. Check DevTools → Application → Service Workers
2. Should show `firebase-messaging-sw.js` as "active"
3. Might need to hard refresh (Ctrl+Shift+R)

## API Endpoints

Save device token (done automatically):
```
POST /api/auth/device-token
{ "deviceToken": "..." }
```

Remove device token:
```
DELETE /api/auth/device-token
{ "deviceToken": "..." }
```

## Full Documentation

See `PUSH_NOTIFICATIONS_SETUP.md` for complete setup guide.

## Testing Without Real Firebase

For testing UI without Firebase:
```javascript
// In browser console
const notification = new Notification("Test", { body: "Test message" });
```

## Next: Add UI Toggle

Add this to your Profile or Settings page:

```tsx
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';

export function NotificationToggle() {
  const { isEnabled, enableNotifications, disableNotifications } = usePushNotifications();
  
  return (
    <Button onClick={isEnabled ? disableNotifications : enableNotifications}>
      {isEnabled ? 'Disable' : 'Enable'} Notifications
    </Button>
  );
}
```

## Need Help?

1. Check the browser console (F12) for errors
2. Check backend terminal for error logs
3. Verify all `.env` variables are set
4. See `PUSH_NOTIFICATIONS_SETUP.md` for troubleshooting
