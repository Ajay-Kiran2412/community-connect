# Quick Reference - Donation & Help Feature

## 🎯 What Happens When User Clicks "Help" or "Donate"

```
Click Button → Fill Form → Submit → See Success → Post Creator Notified
```

## 📄 Pages Created

| Page | Path | Purpose |
|------|------|---------|
| RequestHelp | `/request/:postId/:type` | Collect donation/help info |
| RequestSuccess | `/request-success` | Confirm submission |
| ManageRequests | `/manage-requests/:postId` | Post creator tracks requests |

## 🛠️ API Endpoints

```bash
# Create request
POST /api/requests
{
  "postId": "...",
  "requestType": "help|donate",
  "phoneNumber": "+91...",
  "bloodType": "O+",        // only for donate
  "quantity": "1",          // only for donate
  "message": "..."          // optional
}

# Get requests for a post
GET /api/requests/post/:postId

# Update status (as post creator)
PUT /api/requests/:requestId
{
  "status": "contacted|confirmed|completed|cancelled",
  "notes": "..."
}

# Get my requests
GET /api/requests/my-requests
```

## 💾 Database Collection

**requests** collection with fields:
- `postId` - Which post
- `userId` - Who's requesting
- `postCreatorId` - Post creator
- `requestType` - "help" or "donate"
- `phoneNumber` - Contact number
- `bloodType` - If donation
- `quantity` - If donation
- `status` - Current status
- `message` - Notes

## 🔔 Notifications Sent

**When request created:**
- To: Post creator
- Title: "🩸 Blood Donation: Name" or "🤝 Help Request: Name"
- Action: Opens manage page

**When status changes:**
- To: Requester
- Messages:
  - "contacted" → 📞 We've contacted...
  - "confirmed" → ✅ Your request is confirmed!
  - "completed" → 🎉 Your request is completed!
  - "cancelled" → ❌ Your request was cancelled

## 🎖️ Badges

- ⭐ **Helper Badge** - Earned after first help request
- 🩸 **Lifesaver Badge** - Earned after first blood donation

## 📊 Status Flow

```
pending
  ↓ (Contact button)
contacted
  ↓ (Confirm button)
confirmed
  ↓ (Complete button)
completed

(Cancel button available at any step)
```

## ✅ Form Validation

**Required Fields:**
- Phone number (all requests)
- Blood type (donations only)
- Terms checkbox (all requests)

**Auto Fields:**
- Request type (detected from post category)
- Post ID (from URL)

## 🔐 Permissions

**Requester can:**
- See their own requests
- Receive status updates
- Get notifications
- Earn badges

**Post Creator can:**
- See all requests on their post
- View requester details
- Update request status
- Contact requester (phone)
- Cancel requests

## 🧪 Quick Test

1. **Create post** as User A (blood need)
2. **Login as User B** in different browser/incognito
3. **Click Donate button** on post
4. **Fill form**: +91 9876543210, O+, 1 unit
5. **Submit** → See success page
6. **User A** receives notification 🔔
7. **Click notification** → Manage page
8. **Click "Contact"** → Status updates to "contacted"
9. **User B** receives notification 📞

## 📁 Files Changed

**Frontend:**
- ✅ `src/pages/RequestHelp.tsx` (NEW)
- ✅ `src/pages/RequestSuccess.tsx` (NEW)
- ✅ `src/pages/ManageRequests.tsx` (NEW)
- ✅ `src/components/PostCard.tsx` (MODIFIED)
- ✅ `src/App.tsx` (MODIFIED)

**Backend:**
- ✅ `src/routes/requestRoutes.js` (NEW)
- ✅ `src/models/requestModel.js` (NEW)
- ✅ `src/controllers/requestController.js` (NEW)
- ✅ `src/app.js` (MODIFIED)

## 🚀 How to Test

1. **Start servers**
   ```bash
   # Terminal 1: Backend
   cd community-connect-backend
   npm run dev
   
   # Terminal 2: Frontend
   npm run dev
   ```

2. **Open in browsers**
   - Browser 1: User A (post creator)
   - Browser 2: User B (helper/donor)

3. **Test flow**
   - User A: Create post
   - User B: Click Help/Donate
   - Fill and submit
   - See success
   - Check User A gets notification
   - User A: Click notification
   - User A: Update status
   - Check User B gets update

## 🎨 Form Fields

### Blood Donation Request
- Phone Number (required)
- Blood Type (required) - 8 options
- Quantity (optional) - 1, 2, 3, or multiple
- Notes (optional)
- Terms (required)

### General Help
- Phone Number (required)
- Notes (optional)
- Terms (required)

## 💬 Common Issues

**Issue: Can't click Help button**
- ✓ Ensure you're logged in
- ✓ Ensure you're not the post creator

**Issue: Form won't submit**
- ✓ Fill phone number
- ✓ For donations: select blood type
- ✓ Check terms checkbox

**Issue: No notification received**
- ✓ Post creator must have notifications enabled
- ✓ Check browser console for errors
- ✓ Ensure Firebase credentials are set

**Issue: Can't update status**
- ✓ Must be the post creator
- ✓ Must be logged in
- ✓ Check backend logs for errors

## 📞 Help Phone Number Format

Supported formats:
- `+91 9876543210` (with country code)
- `919876543210` (digits only)
- `9876543210` (local format)

All formats work with phone click-to-call links.

## 🌐 Integrations

**Firebase Cloud Messaging:**
- ✓ Sends notifications to requesters
- ✓ Sends notifications to post creators
- ✓ Non-blocking (won't fail request)

**MongoDB:**
- ✓ Stores all requests
- ✓ Indexed for fast queries
- ✓ Timestamps for tracking

**Express API:**
- ✓ REST endpoints
- ✓ JWT authentication
- ✓ Error handling

## 📈 Monitoring

**To check requests:**
```bash
# Backend logs show:
- Request created
- Notification sent
- Status updated
```

**Browser console shows:**
- Form validation
- API responses
- Navigation events

**MongoDB shows:**
- All requests
- Status updates
- Timestamps
