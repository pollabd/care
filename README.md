# Note-Taking Application

### 1. Roles & Permissions (RBAC)
- **User Role:** Can create, update, delete, and view their own Notes. Can view public Posts.
- **Admin Role:** Inherits all User capabilities. Can additionally manage users (add, delete, update role) and view all Notes across the entire platform.

### 2. Technical Stack
- **Frontend:** Built with Next.js and styled using shadcn/ui.
- **Backend:** Powered by Node.js and Express.
- **Database:** MongoDB with Mongoose.
- **Authentication:** JWT (JSON Web Tokens) implemented in `/middleware/auth.js`.
- **Security:** Passwords are securely hashed using `bcrypt` before saving to the database.

### 3. Database Indexing & Optimization
- **`schema.index` Used:** Indexes are explicitly defined in the Mongoose schemas.
- **No Unnecessary Indexes:** Only strictly required indexes were created (`User.email`, `User.interests`, `Note.owner + createdAt`, `Post.author + createdAt`). All unnecessary compound indexes were removed to optimize write speeds.

### 4. Advanced Aggregation & Pagination
- **Scenario 1 (Group by Interests):** Uses `$unwind` and `$group` to aggregate users by their interests array. Output is paginated using `$facet` (`$skip` and `$limit`).
- **Scenario 2 (User Posts Lookup):** Uses `$lookup` to join the Posts collection. The pipeline is heavily optimized by applying `$sort`, `$skip`, and `$limit` **before** the `$lookup` stage to minimize memory usage.
- **Pagination:** Every single list operation across the API supports `page` and `limit` query parameters.

---

## Deployment

Backend is deployed on **Render**; frontend is deployed on **Vercel**; both use the same MongoDB Atlas database.

### Render (backend)

The backend Dockerfile uses **repo-root build paths** (`COPY backend/...`), so in the Render dashboard set:

- **Root Directory:** leave empty (repo root)
- **Dockerfile Path:** `backend/Dockerfile`
- **Env vars:** `PORT=4000`, `MONGO_URI` (MongoDB Atlas URL), `JWT_SECRET`
- Atlas free tier requires the source IP to be allowed under **Network Access** (use `0.0.0.0/0` to allow anywhere, since Render's IPs are dynamic).

### Vercel (frontend)

Vercel builds the frontend from `frontend/` (its own `next build`, not the Dockerfile). `NEXT_PUBLIC_*` values are baked at build time, so set the backend URL as a **runtime** env var:

- **Env var:** `API_URL=https://<your-render-backend>.onrender.com/api`
- The app resolves the API base at runtime via `GET /api/config` (see `src/app/api/config/route.js`), preferring `API_URL`.
- Redeploy after setting the env var. If it's missing, the app falls back to `http://localhost:4000/api` and breaks.

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/pollabd/care.git
   cd care
   ```
2. Start the services using Docker Compose:
   ```bash
   docker compose up -d --build
   ```
   *Frontend will run on `http://localhost:3002` and Backend on `http://localhost:4000`.*

   By default the backend uses the local `mongo` container. To use MongoDB Atlas instead, copy `.env.example` to `.env`, fill in the real Atlas password, then rebuild the backend (`docker compose up -d --build backend`).

---

## Default Test Accounts

The database automatically seeds these accounts on the first boot:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `admin123` |
| **User** | `pollab@gmail.com` | `user123` |
| **User** | `jk@gmail.com` | `user123` |


