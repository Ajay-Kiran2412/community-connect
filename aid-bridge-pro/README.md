# Community Connect - Aid Bridge Pro

A community-driven platform connecting people for mutual aid, blood donations, and emergency support.

## ✨ Features

- **Post Creation**: Create and share posts about blood needs, supplies, or emergencies
- **Real-time Notifications**: Receive instant push notifications when new posts matching your interests are created
- **User Roles**: Support for individuals, NGOs, and organizations
- **User Verification & Badges**: Build trust with verified badges (verified, helper, life_saver, service)
- **Post Categories**: Blood donation, supplies, emergency aid, and more
- **Authentication**: Secure signup and login with JWT

## 🔔 Push Notifications

This app now includes a complete push notification system! When someone creates a post, all subscribed users automatically receive a notification on their phones.

### Quick Setup
See [QUICK_START_NOTIFICATIONS.md](./QUICK_START_NOTIFICATIONS.md) for a 5-minute setup guide.

### Full Documentation
See [PUSH_NOTIFICATIONS_SETUP.md](./PUSH_NOTIFICATIONS_SETUP.md) for complete setup instructions.

## Project Structure

```
aid-bridge-pro/
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API & Firebase services
│   │   ├── hooks/              # Custom React hooks
│   │   └── integrations/       # Supabase integration
│   └── public/                 # Static files & service worker
├── community-connect-backend/   # Node.js + Express
│   └── src/
│       ├── controllers/        # Request handlers
│       ├── models/             # MongoDB schemas
│       ├── routes/             # API routes
│       ├── middleware/         # Express middleware
│       └── services/           # Business logic & Firebase
└── Documentation
    ├── QUICK_START_NOTIFICATIONS.md
    └── PUSH_NOTIFICATIONS_SETUP.md
```

## Getting Started

### Prerequisites

- Node.js & npm
- MongoDB
- Firebase account (for notifications)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Step 2: Install dependencies
npm install

# Step 3: Install backend dependencies
cd community-connect-backend
npm install
cd ..

# Step 4: Set up environment variables
# Frontend: Create .env.local with Firebase config
# Backend: Update .env with MongoDB and Firebase credentials
```

### Running the App

```sh
# Terminal 1: Start backend
cd community-connect-backend
npm run dev

# Terminal 2: Start frontend
npm run dev
```

Visit http://localhost:8080 (or the port shown) to see the app.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **Shadcn/ui** for components
- **Firebase** for push notifications
- **Axios** for API calls
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Firebase Admin SDK** for push notifications
- **Multer** for file uploads

## API Documentation

See `community-connect-backend/README-auth.md` for authentication details.

### Key Endpoints
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/device-token` - Register for push notifications
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `DELETE /api/auth/device-token` - Remove from notifications

## Configuration

### Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Get service account key for backend
3. Get web config for frontend
4. Add credentials to `.env` and `.env.local`

See [QUICK_START_NOTIFICATIONS.md](./QUICK_START_NOTIFICATIONS.md) for detailed steps.

## Development

```sh
# Frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint

# Backend
npm run dev      # Start with nodemon
npm run start    # Start production server
```

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## License

MIT

---

**For push notification setup**, see [QUICK_START_NOTIFICATIONS.md](./QUICK_START_NOTIFICATIONS.md)

- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/36c1b619-1155-4320-9f58-9c1684686264) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
