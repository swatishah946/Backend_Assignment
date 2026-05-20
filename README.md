# Primetrade.ai Backend Assignment - Scalable REST API with RBAC & React Portal

This repository contains a production-grade implementation of the Backend Developer Intern assignment for **Primetrade.ai**. It features a secure, type-safe REST API built with Node.js, TypeScript, and Express, utilizing Prisma ORM, and paired with a premium glassmorphic React dashboard frontend.

---

## 🚀 Key Features

### 🔒 Core Backend (Primary Focus)
* **Clean Layered Architecture:** Decouples the transport layer (Controllers), input validators (Zod Schemas), database layers (Repositories), and core business logic (Services).
* **Stateless Authentication:** Implements JWT access token authentication with secure password hashing (`bcryptjs` with 12 salt rounds).
* **Role-Based Access Control (RBAC):** Restricts endpoints using a variadic middleware pipeline (`USER` vs `ADMIN`).
* **IDOR (Insecure Direct Object Reference) Mitigation:** Ensures users can only mutate/view tasks they own by deriving query scopes directly from cryptographically verified JWT claims.
* **OpenAPI Explorer:** Integrates Swagger UI hosted directly by the server at `/api/v1/docs`.
* **Database Portability:** Uses Prisma ORM, configured for **PostgreSQL** in containerized environments and easily fallback-able to **SQLite** for zero-setup local dev.

### 💻 Responsive Frontend (Supportive)
* **Vite + React + TypeScript:** Built with typescript for complete type safety.
* **Premium UI/UX:** Styled using pure Vanilla CSS with custom properties (CSS variables). Features glassmorphic cards, neon glows, responsive grid structures, dark-mode styling, and micro-animations.
* **Secure Session Context:** Centralized `AuthContext` managing tokens and user states with request/response interceptors to attach tokens automatically and clear sessions on expiry (401).
* **Admin dashboard panel:** Accessible only to admins, showing system-wide statistics (aggregates) and a user roles configuration controller.

---

## 🛠️ Tech Stack

* **Backend:** Node.js, TypeScript, Express.js, Prisma ORM, PostgreSQL (Docker) / SQLite (Local)
* **Frontend:** React.js (Vite), TypeScript, Axios, Lucide Icons, Vanilla CSS
* **Orchestration:** Docker, Docker Compose, Nginx

---

## 📁 Directory Structure

```
primetrade-assignment/
├── package.json (concurrency scripts)
├── README.md (project docs)
├── docker-compose.yml (orchestration config)
├── backend/
│   ├── src/
│   │   ├── config/ (Prisma config & OpenAPI spec file)
│   │   ├── constants/ (HTTP Status Codes)
│   │   ├── controllers/ (HTTP handlers)
│   │   ├── middlewares/ (JWT validation, RBAC, error handler)
│   │   ├── repositories/ (queries via Prisma)
│   │   ├── services/ (core business logic)
│   │   ├── utils/ (cryptography helpers & exceptions)
│   │   ├── validators/ (Zod schemas)
│   │   ├── routes/ (API routes mounting)
│   │   └── server.ts (App listener)
│   ├── prisma/ (db schemas)
│   ├── Dockerfile
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/ (ProtectedRoute, TaskCard)
    │   ├── context/ (AuthContext)
    │   ├── layouts/ (Navbar/Layout shell)
    │   ├── pages/ (Login, Register, Dashboard, AdminPanel)
    │   ├── services/ (Axios client setup)
    │   ├── App.tsx
    │   └── index.css (Premium UI CSS System)
    ├── Dockerfile
    ├── nginx.conf
    └── package.json
```

---

## ⚡ Quick Start: Running the Project

### Method 1: Using Docker (Recommended, Postgres-backed)
Ensure you have Docker and Docker Compose installed. Execute the following command from the root directory:

```bash
docker-compose up --build
```

* **Frontend Dashboard:** Load `http://localhost` in your browser (Port 80).
* **Backend API:** Access endpoints at `http://localhost:5000/api/v1`.
* **API Documentation (Swagger):** Browse the interactive explorer at `http://localhost:5000/api/v1/docs`.

> [!TIP]
> The very first user to register on the platform is automatically promoted to an **ADMIN** role to allow immediate access to the Admin Dashboard statistics panel!

---

### Method 2: Running Locally (SQLite-backed, Zero-Database installation)
If you prefer running without Docker, follow these steps to use SQLite:

#### 1. Setup Backend
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file by copying the template:
   ```bash
   copy .env.example .env
   ```
4. In your new `.env` file, swap the Postgres provider for SQLite by replacing the datasource block in `prisma/schema.prisma`:
   ```prisma
   // prisma/schema.prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```
   And set your `.env` database URL:
   ```env
   DATABASE_URL="file:./dev.db"
   ```
5. Deploy migrations to create the local SQLite database file:
   ```bash
   npx prisma migrate dev --name init
   ```
6. Start the Express server in development mode:
   ```bash
   npm run dev
   ```

#### 2. Setup Frontend
1. Open a second terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Load the URL shown in your terminal (usually `http://localhost:5173`).

---

## 🔒 Security Architectures
1. **Password Cryptography:** Password inputs are hashed using **bcrypt** with a cost factor of 12 before database insertion, protecting credentials against database-leak precomputation tables.
2. **Defensive Headers:** Incorporates **Helmet** to block scripting injections, clickjacking, and mime-sniffing.
3. **Brute Force Protection:** Limits API request velocity onauth endpoints to 100 requests per 15 minutes.
4. **Data Sanitization & Zod Schema Validation:** Requests are structured, validated, and sanitized at the Express routing boundary.
5. **IDOR Mitigation:** The backend does *not* trust `userId` fields passed in payload bodies. User context is verified cryptographically via the authorization header, preventing malicious users from accessing or mutating other users' data.

---

## 📈 Scalability Write-up

To scale this monolithic application from thousands to millions of concurrent users, the following systems design practices are recommended:

### 1. Database Clustering & Write-Read Segregation (PostgreSQL)
* **Problem:** Large volumes of task listings compete with database write operations, causing CPU bottlenecks.
* **Solution:** Establish a primary-replica Postgres cluster. Write queries route to the primary instance (handling ACID transactions), while read operations (listing/filtering tasks) are load-balanced across multiple read replicas.
* **Tooling:** Deploy PgBouncer for connection pooling to reuse database connection threads and optimize memory allocation.

### 2. High-Performance In-Memory Caching (Redis)
* **Problem:** Repeatedly querying static resource indexes hits database disk cycles.
* **Solution:** Implement a *Cache-Aside* design pattern. When a user requests their tasks or stats, query Redis first. In the event of a cache miss, query Postgres, and serialize/cache the response in Redis with an appropriate TTL (e.g., 5 minutes) or invalidate it whenever the user creates, updates, or deletes a task.

### 3. Horizontal Scale Out & Load Balancer (Nginx / HAProxy)
* **Problem:** Node.js runs on a single-threaded event loop, which can lock up under heavy CPU validation/cryptography cycles.
* **Solution:** Spin up multiple stateless backend Node containers in an ECS/Kubernetes cluster. Mount an Nginx reverse proxy at the edge of the network acting as a load balancer, distributing traffic across the healthy containers using a Round-Robin or Least-Connections algorithm.

### 4. Asynchronous Task Deferral via Message Queues (RabbitMQ / Apache Kafka)
* **Problem:** Heavy analytical tasks, report exports, or email notifications block the request thread, slowing response times.
* **Solution:** Decouple these slow actions. The Express router converts the task request into a lightweight message payload and inserts it into a queue (RabbitMQ/Kafka). The API returns a `202 Accepted` response immediately. Independent background worker processes consume tasks off the queue asynchronously.
