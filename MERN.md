# Chennai AgroSmart AI — MERN mode

The frontend remains the existing React/Vite experience. The new REST API is served by Express under `/api`, uses MongoDB through Mongoose, and authenticates with bcrypt-hashed passwords plus JWT sessions in an HTTP-only cookie.

## Local setup

1. Install MongoDB locally or create a MongoDB Atlas database.
2. Copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET`, `PORT`, and `CLIENT_URL`.
3. Install dependencies with `pnpm install` (or `npm install`).
4. Start the app with `pnpm dev` (or `npm run dev`).
5. Open `http://localhost:3000`.

## REST endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PATCH /api/profile`
- `POST /api/analysis`
- `GET /api/analysis/history`
- `GET /api/analysis/:id`
- `GET /api/recommendations`
- `GET /api/gallery`
- `POST /api/gallery`
- `DELETE /api/gallery/:id`
- `GET /api/alerts`
- `POST /api/contact`

## Vercel deployment

For a production deployment, use MongoDB Atlas and configure the same variables in the Vercel project. The current Express entrypoint is suitable for a long-lived Node server; if deploying with Vercel Functions, add a Vercel Node entrypoint that exports the Express app and set the project build configuration accordingly. Keep `CLIENT_URL` equal to the deployed frontend URL and configure the storage/provider secrets in Vercel Environment Variables.
