# ✅ Push Notifications Setup Checklist

Use this checklist to ensure everything is configured correctly.

## Pre-Setup Verification

- [ ] Node.js & npm installed
- [ ] MongoDB connection working
- [ ] Backend running: `npm run dev` in `community-connect-backend/`
- [ ] Frontend running: `npm run dev`

## Firebase Project Setup

### Create Firebase Project
- [ ] Go to https://console.firebase.google.com
- [ ] Click "Create Project"
- [ ] Enter project name
- [ ] Accept terms and create

### Enable Firebase Services
- [ ] Cloud Messaging enabled (default)
- [ ] Firebase Storage enabled
- [ ] Realtime Database or Firestore (optional)

## Backend Configuration

### Install Dependencies
- [ ] `firebase-admin` installed (`npm list firebase-admin`)
- [ ] All other dependencies installed

### Get Service Account Key
- [ ] Go to Project Settings → Service Accounts
- [ ] Click "Generate New Private Key"
- [ ] JSON file downloaded to computer
- [ ] Copy entire JSON content

### Update Backend .env
- [ ] `FIREBASE_SERVICE_ACCOUNT` set with service account JSON
  ```bash
  FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...full json...}
  ```
- [ ] `FIREBASE_DATABASE_URL` set (example: `https://your-project.firebaseio.com`)
- [ ] Other environment variables still intact

### Verify Backend Code
- [ ] `src/services/notificationService.js` exists
- [ ] `src/controllers/postController.js` has notification call
- [ ] `src/controllers/authController.js` has device token methods
- [ ] `src/routes/authRoutes.js` has device token routes
- [ ] `src/models/userModel.js` has deviceTokens field

### Test Backend (Optional)
- [ ] Run `npm run dev` in backend folder
- [ ] No errors in console
- [ ] MongoDB connection successful

## Frontend Configuration

### Install Dependencies
- [ ] `firebase` installed (`npm list firebase`)
- [ ] All other dependencies installed

### Get Firebase Web Config
- [ ] Go to Firebase Console → Project Settings → General
- [ ] Scroll to "Your apps"
- [ ] Add Web App if not exists
- [ ] Copy `firebaseConfig` object

### Get VAPID Key
- [ ] Go to Firebase Console → Cloud Messaging tab
- [ ] Under "Web Configuration", click "Generate Key Pair"
- [ ] Copy the public key (long string)

### Create .env.local File
In project root, create `.env.local` with:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

Checklist for .env.local:
- [ ] VITE_FIREBASE_API_KEY is set
- [ ] VITE_FIREBASE_AUTH_DOMAIN is set
- [ ] VITE_FIREBASE_PROJECT_ID is set
- [ ] VITE_FIREBASE_STORAGE_BUCKET is set
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID is set
- [ ] VITE_FIREBASE_APP_ID is set
- [ ] VITE_FIREBASE_VAPID_KEY is set (not empty)
- [ ] No extra quotes around values
- [ ] No comments after values

### Verify Frontend Files
- [ ] `public/firebase-messaging-sw.js` exists
- [ ] `src/services/firebaseMessaging.ts` exists
- [ ] `src/hooks/usePushNotifications.ts` exists
- [ ] `package.json` has `firebase` dependency

## Testing Setup

### Server Setup
- [ ] Terminal 1: `cd community-connect-backend && npm run dev`
- [ ] Terminal 2: `npm run dev` (from project root)
- [ ] Both servers running without errors

### Browser Setup
- [ ] Open http://localhost:5173 (or shown port)
- [ ] Browser supports notifications (Chrome, Firefox, Safari, Edge)
- [ ] No browser console errors
- [ ] No backend console errors

## Functionality Testing

### Test 1: User Signup & Login
- [ ] Can create new account
- [ ] Can login with email/password
- [ ] Logged-in status persists

### Test 2: Enable Notifications
- [ ] Click notification enable button (or auto-enabled)
- [ ] Browser shows "allow notifications?" prompt
- [ ] Click "Allow"
- [ ] See success message in UI
- [ ] Check browser DevTools → Application → Service Workers
  - [ ] See `firebase-messaging-sw.js` listed as "active"

### Test 3: Device Token Saved
- [ ] Check backend logs for "Device token saved"
- [ ] Or check MongoDB:
  ```bash
  db.users.findOne({email: "your@email.com"})
  # Should see: deviceTokens: ["token_string_here"]
  ```

### Test 4: Create Post in Another Account
- [ ] Logout from account A
- [ ] Login to account B in new browser/tab
- [ ] Create a new post in account B
- [ ] Check backend logs for "Notifications sent for new post"

### Test 5: Receive Notification
- [ ] Switch back to account A browser
- [ ] Should see notification pop-up within 10 seconds
- [ ] Notification shows post title
- [ ] Click notification → opens post details
- [ ] If no pop-up, check browser notification settings (allow for site)

## Debugging Checklist

### If Notifications Don't Show

**Check Browser:**
- [ ] DevTools → Application → Notifications → check site is "Allow"
- [ ] DevTools → Application → Service Workers → `firebase-messaging-sw.js` is "active"
- [ ] No red errors in Console tab
- [ ] Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

**Check Frontend .env.local:**
- [ ] All VITE_FIREBASE_* variables are set
- [ ] No typos in variable names (case-sensitive)
- [ ] VITE_FIREBASE_VAPID_KEY is not empty
- [ ] Restart dev server after changing .env.local

**Check Backend .env:**
- [ ] FIREBASE_SERVICE_ACCOUNT is valid JSON
- [ ] Starts with `{"type":"service_account"...`
- [ ] FIREBASE_DATABASE_URL is set
- [ ] Restart backend after changing .env

**Check Backend Logs:**
- [ ] Backend running: `npm run dev`
- [ ] No "Firebase initialization error" messages
- [ ] When post created, see "Notifications sent" message
- [ ] No "Error sending notification" messages

**Check MongoDB:**
- [ ] User document has `deviceTokens` array
- [ ] Device token is stored (not empty array)
- [ ] Run: `db.users.find({"deviceTokens": {$ne: []}})`

**Check Firebase Console:**
- [ ] Project ID matches in .env files
- [ ] Service Account has Messaging permissions
- [ ] Cloud Messaging is enabled
- [ ] Web App is registered

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Firebase not initialized" | Add FIREBASE_SERVICE_ACCOUNT to backend .env |
| "Service Worker won't register" | Must be HTTPS or localhost; clear site data |
| ".env.local not reading" | Restart dev server after creating file |
| "Notifications request denied" | User clicked "Block" - reset site permissions |
| "Device tokens empty in DB" | Ensure user is logged in before requesting permission |
| "Token mismatch error" | Verify service account JSON is complete and valid |

## Post-Setup

### Add UI Toggle (Optional)
- [ ] Copy code from `NOTIFICATION_UI_EXAMPLE.tsx`
- [ ] Create `NotificationSettings` component
- [ ] Add to Profile or Settings page
- [ ] Test enable/disable buttons

### Deploy to Production
- [ ] Get SSL certificate (HTTPS required)
- [ ] Update FRONTEND_URL in backend .env
- [ ] Update Firebase security rules if using Firestore/DB
- [ ] Test notifications in production

### Monitor Notifications
- [ ] Add analytics to track notification delivery
- [ ] Monitor Firebase billing (free tier: 10k/day)
- [ ] Set up error logging
- [ ] Test with more users

## Documentation Review

- [ ] Read `QUICK_START_NOTIFICATIONS.md` - Overview
- [ ] Read `PUSH_NOTIFICATIONS_SETUP.md` - Detailed guide
- [ ] Read `ARCHITECTURE_DIAGRAM.md` - How it works
- [ ] Review `IMPLEMENTATION_SUMMARY.md` - What was built
- [ ] Check `NOTIFICATION_UI_EXAMPLE.tsx` - Code examples

## Final Verification

### All Pieces in Place?
- [ ] Backend: `npm run dev` works
- [ ] Frontend: `npm run dev` works
- [ ] .env (backend) has Firebase config
- [ ] .env.local (frontend) has Firebase config
- [ ] MongoDB has users with deviceTokens
- [ ] Firebase project shows Web app registered
- [ ] Cloud Messaging enabled with VAPID key

### Ready to Deploy?
- [ ] No console errors in frontend
- [ ] No console errors in backend
- [ ] Can create post and receive notification
- [ ] Device tokens persist after logout/login
- [ ] Service Worker stays active
- [ ] Works on multiple browsers

## Quick Test Command

Run this in MongoDB shell to verify setup:
```javascript
// Count users with device tokens
db.users.countDocuments({"deviceTokens.0": {$exists: true}});
// Should return > 0 if working

// See a user's tokens
db.users.findOne({name: "YourName"}, {deviceTokens: 1});
// Should show deviceTokens array with Firebase tokens
```

## Support Resources

- Firebase Docs: https://firebase.google.com/docs/messaging
- Service Worker: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- Push API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- Project Setup: See `PUSH_NOTIFICATIONS_SETUP.md`

---

**When everything is checked ✅, you're ready to use push notifications!**

**Problems?** Check the "Debugging Checklist" section or review the troubleshooting guide in `PUSH_NOTIFICATIONS_SETUP.md`.
