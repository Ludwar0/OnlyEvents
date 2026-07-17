# Only Events Backend

Complete production-ready backend for the Only Events platform.

## Architecture Overview
- **Framework:** Node.js, Express, TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Authentication:** JWT (Access & Refresh tokens) stored securely. Role-Based Access Control (RBAC).
- **Caching/Queues:** Redis & BullMQ
- **Real-time:** Socket.io
- **Storage:** AWS S3 via Multer
- **Emails:** Nodemailer (SMTP)
- **Payments:** Stripe API integration

## Folder Structure

```
backend/
├── prisma/             # Database schema and migrations
├── src/
│   ├── config/         # Environment, DB, Logger configurations
│   ├── controllers/    # Request handlers (Auth, Events, Vendors, etc)
│   ├── middleware/     # Auth, Error handling, Validation, Rate Limiting
│   ├── routes/         # Express router definitions
│   ├── services/       # Core business logic (Email, Uploads, DB access)
│   ├── sockets/        # WebSocket implementation
│   ├── validators/     # Zod schemas for input validation
│   ├── server.ts       # Main entry point (HTTP + WS)
│   └── index.ts        # Express App setup
├── Dockerfile          # Production Docker image build
├── docker-compose.yml  # Local development orchestration
└── package.json        # Dependencies and scripts
```

## Getting Started

### 1. Installation

```bash
git clone <repo-url>
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```
Fill in your Postgres URL, Stripe keys, AWS keys, and JWT secrets.

### 3. Database Setup

```bash
# Start Postgres and Redis via Docker
docker-compose up -d db redis

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### 4. Running the App

```bash
# Development (with nodemon)
npm run dev

# Production
npm run build
npm start
```

### 5. Running with Docker Compose (Full Stack)

```bash
docker-compose up --build
```

## API Documentation

### Authentication (`/api/v1/auth`)
- `POST /register`: Create new user. Body: `{email, password, firstName, lastName}`
- `POST /login`: Authenticate. Body: `{email, password}`
- `POST /refresh-token`: Refresh JWT. Body: `{token}`
- `POST /logout`: Clear tokens.

### Events (`/api/v1/events`)
- `POST /`: Create event. (Requires Auth). Body: `{eventType, eventDate, venue, package, guests}`
- `GET /my-events`: Get client events. (Requires Auth).
- `GET /`: Get all events. (Requires ADMIN).
- `GET /:id`: Get specific event details.
- `PATCH /:id/status`: Update event status. (Requires ADMIN).

### Vendors (`/api/v1/vendors`)
- `POST /register`: Register business. (Requires Auth).
- `GET /`: List approved vendors. Query params: `?category=x&search=y&featured=true`
- `GET /:id`: Get vendor profile.
- `PATCH /:id/approve`: Approve vendor. (Requires ADMIN).

### Equipment (`/api/v1/equipment`)
- `GET /`: List inventory. (Requires ADMIN).
- `POST /`: Add equipment. (Requires ADMIN).
- `POST /allocate`: Allocate to event. (Requires ADMIN). Body: `{eventId, equipmentId, quantity}`

### Trucks (`/api/v1/trucks`)
- `GET /`: List fleet. (Requires ADMIN).
- `POST /`: Add truck. (Requires ADMIN).
- `PATCH /:id/status`: Update status. (Requires ADMIN).
- `POST /:id/assign`: Assign to event. (Requires ADMIN).

### Payments (`/api/v1/payments`)
- `GET /`: List all payments. (Requires ADMIN).
- `POST /record`: Manual payment entry. (Requires ADMIN). Body: `{eventId, amount, method}`
- `POST /create-checkout-session`: Stripe integration. Body: `{eventId}`

## Security Measures implemented
- **Helmet:** Sets secure HTTP headers.
- **CORS:** Restricts cross-origin resource sharing to the frontend.
- **Rate Limiting:** Protects against DDoS and brute force (`express-rate-limit`).
- **Validation:** Strict runtime type checking and sanitization using `zod`.
- **JWT:** Short-lived access tokens + HTTP-only cookies (implementation specific).
- **Bcrypt:** Password hashing with 12 rounds.
