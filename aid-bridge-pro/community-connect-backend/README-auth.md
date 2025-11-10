Development / Production auth notes

This backend now uses cookie-based authentication (httpOnly cookies) with accessToken and refreshToken.

Required env variables in `.env`:
- MONGODB_URI
- JWT_SECRET
- REFRESH_TOKEN_SECRET (optional, defaults to JWT_SECRET)
- JWT_EXPIRES_IN (e.g. 15m)
- REFRESH_EXPIRES_IN (e.g. 7d)
- FRONTEND_URL (e.g. http://localhost:8080)
- AUTO_VERIFY (true/false) - use false for production, true for development convenience
- ADMIN_TOKEN - for verify endpoint

Important:
- Cookies are set with `httpOnly` and `secure` when NODE_ENV=production.
- The frontend must send credentials in fetch requests: `credentials: 'include'`.
- To inspect current user on frontend, call `/api/auth/me` after login/signup.

Suggested production improvements:
- Use short-lived access tokens and rotate refresh tokens stored in DB.
- Use CSRF protections when using cookies (double submit cookie or CSRF token).
- Use secure email verification for account verification.
