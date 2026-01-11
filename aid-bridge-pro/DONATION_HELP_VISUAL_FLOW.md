# Donation & Help Request - Visual Flow

## 🎯 User Journey

```
┌─────────────────────┐
│   Home Feed         │
│                     │
│  ┌─────────────────┐│
│  │  Post Card      ││
│  │                 ││
│  │ [Help] [Donate] ││ ← User clicks here
│  └─────────────────┘│
└──────────┬──────────┘
           │ useNavigate()
           ↓
┌──────────────────────────────────┐
│  /request/:postId/:type          │
│                                  │
│  REQUEST FORM PAGE               │
│  ┌────────────────────────────┐ │
│  │ Phone Number (required)    │ │
│  │ Blood Type (donation only) │ │
│  │ Quantity (donation only)   │ │
│  │ Message (optional)         │ │
│  │ Terms & Conditions         │ │
│  └────────────────────────────┘ │
│  [Submit] Button                 │ ← Form submission
└──────────┬───────────────────────┘
           │ POST /api/requests
           ↓
┌──────────────────────────────────┐
│  BACKEND                         │
│  ├─ Create Request Document      │
│  ├─ Validate Fields              │
│  ├─ Check Authorization          │
│  └─ Send Notification to Creator │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│  /request-success                │
│                                  │
│  SUCCESS PAGE                    │
│  ✓ Success Animation             │
│  ✓ Next Steps Guide              │
│  ✓ Badges Earned                 │
│  ✓ [Back Home] [Share] Buttons   │ ← Post-request actions
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│  Home Feed (Request Complete)    │
│                                  │
│  ⭐ Achievement Badge Displayed  │
└──────────────────────────────────┘
```

## 📱 Form Fields by Request Type

### Blood Donation Request
```
┌────────────────────────────────┐
│  🩸 Register Your Donation      │
├────────────────────────────────┤
│                                │
│  Phone Number *                │
│  [+91 9876543210           ]   │
│                                │
│  Your Blood Type *             │
│  [O+] [O-] [A+] [A-]          │
│  [B+] [B-] [AB+] [AB-]        │
│                                │
│  How many units?               │
│  [1 Unit] [2 Units] [3 Units] │
│  [Multiple donations        ]  │
│                                │
│  Additional Information        │
│  [textarea for notes       ]   │
│                                │
│  ☑ I agree to terms           │
│                                │
│  [🩸 Register Donation]        │
└────────────────────────────────┘
```

### General Help Request
```
┌────────────────────────────────┐
│  🤝 Offer Your Help             │
├────────────────────────────────┤
│                                │
│  Phone Number *                │
│  [+91 9876543210           ]   │
│                                │
│  Message                       │
│  [textarea for help details ]  │
│                                │
│  ☑ I agree to terms           │
│                                │
│  [✅ Submit Help Request]       │
└────────────────────────────────┘
```

## 🔔 Notification System

### When Request is Created
```
POST CREATOR receives:
┌─────────────────────────────┐
│ 🩸 Blood Donation: John     │
│ John (O+) has offered       │
│ to donate!                  │
│                             │
│ [View] [Dismiss]            │
└─────────────────────────────┘
```

### When Status is Updated
```
REQUESTER receives:
┌─────────────────────────────┐
│ 📞 Request Update           │
│ We've contacted you about   │
│ your request!               │
│                             │
│ [View] [Dismiss]            │
└─────────────────────────────┘
```

## 📊 Database Structure

```
Request Collection
├─ postId (reference to Post)
├─ userId (who made the request)
├─ postCreatorId (post creator)
├─ requestType: "help" | "donate"
├─ phoneNumber
├─ message
├─ bloodType (if donation)
├─ quantity (if donation)
├─ status: pending → contacted → confirmed → completed
└─ timestamps

Status Workflow:
pending
  ↓ (post creator reached out)
contacted
  ↓ (both parties confirmed)
confirmed
  ↓ (help/donation fulfilled)
completed
  
  or at any point: cancelled
```

## 🛣️ API Routes

```
POST   /api/requests
       Create donation/help request
       
GET    /api/requests/my-requests
       Get all requests (sent & received)
       
GET    /api/requests/:requestId
       Get specific request details
       
PUT    /api/requests/:requestId
       Update request status (post creator only)
       
GET    /api/requests/post/:postId
       Get all requests for a post
```

## 🎖️ Achievements/Badges

```
All Requests:
  ⭐ Helper Badge - Earned after first help request

Blood Donations Only:
  🩸 Lifesaver Badge - Earned after first donation

Display on:
  ✓ Success page
  ✓ User profile
  ✓ Notification messages
```

## 🔐 Authorization Rules

```
User A (Requester)
├─ Can create request on User B's post
├─ Cannot create request on own post
├─ Can view own request details
├─ Can receive notifications about status

User B (Post Creator)
├─ Cannot create request on own post
├─ Can view all requests on own post
├─ Can view requester details (name, phone, blood type)
├─ Can update request status
└─ Receives notifications when request created
```

## ✨ Key Features

```
✓ Form Validation
  - Phone number required
  - Blood type required for donations
  - Terms checkbox required

✓ Error Handling
  - Can't request own post
  - Invalid post detection
  - User authentication checks

✓ Notification Integration
  - Instant notification to post creator
  - Status update notifications to requester
  - Non-blocking (failures don't affect request)

✓ User Experience
  - Loading states during submission
  - Success confirmation page
  - Badge achievements
  - Share functionality
  - Back navigation

✓ Data Integrity
  - Indexed queries for performance
  - Transaction support ready
  - Audit trail (timestamps)
```

## 🚀 Next Steps After Implementation

1. **Database**: Ensure MongoDB is connected
2. **Backend**: Start server with: `npm run dev`
3. **Frontend**: Start React app with: `npm run dev`
4. **Test Flow**:
   - Create post as User A
   - Login as User B
   - Click Help/Donate button
   - Fill form and submit
   - See success page
   - Check User A's notifications

5. **Monitor**:
   - Check browser console for errors
   - Monitor backend logs
   - Test with real phone numbers (won't be called)
