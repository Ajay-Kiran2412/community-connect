# Donation & Help Request Feature Guide

## Overview

When users click the **"Help"** or **"Donate"** buttons on a post, they are taken through a complete request flow that allows them to register their intention to help or donate blood.

## User Flow

```
Post Card (Help/Donate Button)
    ↓
Request Form Page (/request/:postId/:type)
    ↓
Form Submission to Backend
    ↓
Success Page (/request-success)
    ↓
Back to Home Feed
```

## Frontend Pages Created

### 1. **RequestHelp Component** (`src/pages/RequestHelp.tsx`)

**Purpose**: Collects user information for donation or help requests

**Features**:
- Dynamic form based on request type (blood donation vs general help)
- Phone number validation
- Blood type selection (for donations)
- Quantity selector (for donations)
- Optional message/notes field
- Terms & conditions checkbox
- Loading state during submission
- Toast notifications for feedback

**Request Types**:
- **Help**: General assistance with a community need
- **Donate**: Specifically for blood donation requests

**Form Fields**:

For Both Types:
- Phone Number (required)
- Message/Notes (optional)
- Terms & Conditions checkbox (required)

For Donations Only:
- Blood Type Selection (required) - 8 blood types (O+, O-, A+, A-, B+, B-, AB+, AB-)
- Quantity Selector (optional) - 1, 2, 3 units or "Multiple donations"

**API Endpoint**: `POST /api/requests`
```json
{
  "postId": "64f8a9c1b2d3e4f5g6h7i8j9",
  "requestType": "donate|help",
  "phoneNumber": "+91 9876543210",
  "message": "Optional notes",
  "bloodType": "O+" (only for donations),
  "quantity": "1" (only for donations)
}
```

### 2. **RequestSuccess Component** (`src/pages/RequestSuccess.tsx`)

**Purpose**: Confirms successful submission and sets user expectations

**Features**:
- Success animation
- Next steps guide (4-step process)
- "Keep Your Phone Handy" reminder
- Action buttons (Back to Home, Share)
- Badge/achievement unlocked display
- Share functionality

**User Journey After Success**:
1. Team reviews the request
2. Contact within 2 hours
3. Coordinate meeting details
4. Make a difference! 🌟

**Badges Earned**:
- ⭐ Helper Badge (for all requests)
- 🩸 Lifesaver Badge (for blood donations only)

## Backend Implementation

### New Routes

**File**: `src/routes/requestRoutes.js`

```
POST   /api/requests                 - Create new request
GET    /api/requests/my-requests     - Get user's requests (created or received)
GET    /api/requests/:requestId      - Get specific request
PUT    /api/requests/:requestId      - Update request status
GET    /api/requests/post/:postId    - Get all requests for a post
```

### New Model

**File**: `src/models/requestModel.js`

**Schema**:
```javascript
{
  postId: ObjectId (ref: Post),
  userId: ObjectId (ref: User),              // Person making the request
  postCreatorId: ObjectId (ref: User),       // Person who created the post
  requestType: 'help' | 'donate',
  phoneNumber: String,
  message: String,
  bloodType: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-',
  quantity: String,
  status: 'pending' | 'contacted' | 'confirmed' | 'completed' | 'cancelled',
  notes: String,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Status Workflow**:
- `pending` → Initial state after request submission
- `contacted` → Post creator has reached out
- `confirmed` → Meeting/donation is confirmed
- `completed` → Help/donation was fulfilled
- `cancelled` → Request was cancelled

### New Controller

**File**: `src/controllers/requestController.js`

**Functions**:

1. **createRequest**: 
   - Validates post and user existence
   - Prevents users from requesting their own posts
   - Sends notification to post creator
   - Returns created request

2. **getUserRequests**:
   - Returns both sent and received requests
   - Supports filtering by status and type
   - Populated with post and user info

3. **getRequest**:
   - Retrieves single request with full details
   - Authorization check (only sender or receiver can view)

4. **updateRequest**:
   - Only post creator can update status
   - Sends notification to requester about status changes
   - Supports adding notes

5. **getPostRequests**:
   - Gets all requests for a specific post
   - Used by post creator to see all help/donations

## Integration with PostCard Component

**File**: `src/components/PostCard.tsx`

**Changes**:
- Added `useNavigate` import from react-router-dom
- Updated `handleHelp` function to navigate to request form
- Navigates to `/request/:postId/:type` based on category

```typescript
const handleHelp = async () => {
  navigate(`/request/${post._id}/${post.category === 'blood' ? 'donate' : 'help'}`, {
    state: { post }
  });
  if (onRequestSent) onRequestSent();
};
```

## App.tsx Routes

**New Routes Added**:
```typescript
<Route path="/request/:postId/:type" element={<RequestHelp />} />
<Route path="/request-success" element={<RequestSuccess />} />
```

## Notification System Integration

When a request is created, the post creator receives a notification:

**For Blood Donations**:
- Title: "🩸 Blood Donation: {Requester Name}"
- Body: "{Requester Name} ({Blood Type}) has offered to donate!"

**For Help Requests**:
- Title: "🤝 Help Request: {Requester Name}"
- Body: "{Requester Name} has offered to help with your post!"

## Status Update Notifications

When post creator updates request status, requester receives notification:

| Status | Message |
|--------|---------|
| contacted | 📞 We've contacted the helper about your request! |
| confirmed | ✅ Your request is confirmed! |
| completed | 🎉 Your request is completed! |
| cancelled | ❌ Your request was cancelled |

## Database Indexes

Request model includes indexes for fast queries:
- `postId`
- `userId`
- `postCreatorId`
- `status`
- `createdAt` (descending for sorting)

## Error Handling

**Validation Errors** (400):
- Missing required fields
- Blood type required for donations
- Invalid post or user

**Authorization Errors** (403):
- Cannot request on own post
- Cannot update request unless post creator

**Not Found Errors** (404):
- Post not found
- Request not found

## Testing Flow

1. **Create a Post** (as User A)
   - Post a blood need or general help request

2. **Navigate to Home** (as User B)
   - See the post created by User A

3. **Click Help/Donate Button**
   - Fill out the form with phone number and other details
   - Submit the form

4. **See Success Page**
   - Confirm successful submission
   - See badges earned

5. **Check Notifications**
   - User A receives notification about the request
   - User B can view the success page

6. **Backend: Update Status** (as User A)
   - Call `PUT /api/requests/:requestId`
   - Update status to 'contacted', 'confirmed', etc.
   - User B receives notification about status change

## UI Components Used

- **Card**: Main form container
- **Button**: Submit and navigation buttons
- **Input**: Phone number input
- **Textarea**: Message field
- **Badge**: Blood type selection and achievements
- **Loader2**: Loading spinner during submission
- **ArrowLeft**: Back navigation
- **Heart**: Icons for visual feedback
- **Share2**: Share functionality

## Future Enhancements

1. **Request Analytics**
   - Track donation success rate
   - Measure help request fulfillment

2. **Rating System**
   - Rate helpers and donors
   - Build trust and credibility

3. **Payment Integration**
   - Allow donors to get reimbursed
   - Support for premium donation options

4. **Scheduling**
   - Calendar integration for donations
   - Appointment booking system

5. **Document Upload**
   - Medical certificates for donors
   - Proof of fulfillment

## Files Modified/Created

✅ **Frontend**:
- `src/pages/RequestHelp.tsx` (NEW)
- `src/pages/RequestSuccess.tsx` (NEW)
- `src/components/PostCard.tsx` (MODIFIED)
- `src/App.tsx` (MODIFIED)

✅ **Backend**:
- `src/routes/requestRoutes.js` (NEW)
- `src/models/requestModel.js` (NEW)
- `src/controllers/requestController.js` (NEW)
- `src/app.js` (MODIFIED)

## Quick Start

1. Users click "Help" or "Donate" on any post
2. They fill out the simple form
3. Submit and see success confirmation
4. Post creator receives instant notification
5. Post creator can update status to track fulfillment

That's it! The entire flow is automated with notifications at each step.
