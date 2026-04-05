# Zorvyn – Records Management System

A full-stack records management application with a RESTful backend API and a built-in frontend dashboard. Built with Node.js, Express, MongoDB, and vanilla JavaScript.

---

## Tech Stack

- **Runtime:** Node.js (≥ 20.19.0)
- **Framework:** Express.js v5
- **Database:** MongoDB via Mongoose v9
- **Auth:** JSON Web Tokens (JWT) + bcryptjs
- **Validation:** Joi
- **Frontend:** Single-page HTML/CSS/JS (Tailwind CSS via CDN)

---

## Features

- JWT-based authentication (login / register)
- Role-based access control — `admin`, `analyst`, `viewer`
- Full CRUD for financial records (income & expense)
- Dedicated tax entry workflow with auto-calculated amounts
- Dashboard stats: total income, expense, net balance, and tax paid
- Category-level breakdown and recent records feed
- Monthly and weekly trend analysis
- Paginated record listing with filtering by status, type, category, and date range
- Joi validation on create and update (partial schema on PATCH-style updates)
- Global error handler and meaningful HTTP status codes
- Frontend served as a static SPA from the `/public` directory

---

## Roles & Permissions

| Permission              | Admin | Analyst | Viewer |
|-------------------------|:-----:|:-------:|:------:|
| Login / Register        | ✅    | ✅      | ✅     |
| Dashboard stats         | ✅    | ✅      | ✅     |
| Category summary        | ✅    | ✅      | ❌     |
| Recent records feed     | ✅    | ✅      | ❌     |
| Monthly/weekly trends   | ✅    | ✅      | ❌     |
| View all records        | ✅    | ✅      | ❌     |
| View record by ID       | ✅    | ✅      | ❌     |
| Record summary stats    | ✅    | ✅      | ❌     |
| Create record           | ✅    | ❌      | ❌     |
| Update record           | ✅    | ❌      | ❌     |
| Delete record           | ✅    | ❌      | ❌     |

---

## Project Structure

```
├── app.js                  # Express app setup, middleware, route mounting
├── server.js               # MongoDB connection + server bootstrap
├── routes/
│   ├── authRoutes.js       # POST /api/auth/register, /login
│   ├── recordRoutes.js     # CRUD + summary for /api/records
│   └── dashboardRoutes.js  # Stats, categories, recent, trends
├── controllers/
│   ├── authController.js       # register, login
│   ├── recordController.js     # createRecord, getRecords, getRecordById,
│   │                           # updateRecord, deleteRecord, getSummary
│   └── dashboardController.js  # getDashboardStats, getCategorySummary,
│                               # getRecent, getMonthlyTrends, getWeeklyTrends
├── middleware/
│   └── authMiddleware.js   # protect (JWT verify), authorizeRoles
├── models/
│   ├── User.js             # email, password, role (admin|analyst|viewer)
│   └── Record.js           # amount, type, category, date, note, status, createdBy
├── utils/
│   └── validation.js       # Joi schemas: recordSchema, updateRecordSchema
└── public/
    └── index.html          # SPA frontend (login + dashboard + modals)
```

---

## Setup

**1. Clone and install dependencies**

```bash
npm install
```

**2. Create a `.env` file in the project root**

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

**3. Start the server**

```bash
# Development (with auto-reload via nodemon)
npm run dev

# Production
npm start
```

The server starts at `http://localhost:5000`. The frontend SPA is served at the root (`/`).

---

## API Reference

All protected routes require:

```
Authorization: Bearer <jwt_token>
```

### Auth

| Method | Endpoint              | Access | Description           |
|--------|-----------------------|--------|-----------------------|
| POST   | `/api/auth/register`  | Public | Register a new user   |
| POST   | `/api/auth/login`     | Public | Login and get a token |

**Register / Login body:**
```json
{
  "email": "admin@example.com",
  "password": "yourpassword",
  "role": "admin"
}
```

**Login response:**
```json
{
  "token": "eyJ...",
  "role": "admin",
  "email": "admin@example.com"
}
```

---

### Records — `/api/records`

| Method | Endpoint             | Roles           | Description               |
|--------|----------------------|-----------------|---------------------------|
| POST   | `/api/records`       | Admin           | Create a record            |
| GET    | `/api/records`       | Admin, Analyst  | List records (paginated)   |
| GET    | `/api/records/summary` | Admin, Analyst | Counts by status          |
| GET    | `/api/records/:id`   | Admin, Analyst  | Get a single record        |
| PUT    | `/api/records/:id`   | Admin           | Update a record            |
| DELETE | `/api/records/:id`   | Admin           | Delete a record            |

**Record body (POST / PUT):**
```json
{
  "amount": 5000,
  "type": "income",
  "category": "Salary",
  "date": "2025-04-01",
  "note": "April salary",
  "status": "completed"
}
```

**GET `/api/records` query parameters:**

| Param       | Type   | Description                          |
|-------------|--------|--------------------------------------|
| `page`      | number | Page number (default: 1)             |
| `limit`     | number | Records per page (default: 10)       |
| `status`    | string | `pending` or `completed`             |
| `type`      | string | `income` or `expense`                |
| `category`  | string | Partial match (case-insensitive)     |
| `startDate` | date   | ISO date — records on or after       |
| `endDate`   | date   | ISO date — records on or before      |

**GET `/api/records/summary` response:**
```json
{
  "total": 42,
  "completed": 30,
  "pending": 12
}
```

---

### Dashboard — `/api/dashboard`

| Method | Endpoint                        | Roles                        | Description                        |
|--------|---------------------------------|------------------------------|------------------------------------|
| GET    | `/api/dashboard/stats`          | Admin, Analyst, Viewer       | Total income, expense, net balance |
| GET    | `/api/dashboard/categories`     | Admin, Analyst               | Totals grouped by category         |
| GET    | `/api/dashboard/recent`         | Admin, Analyst               | Most recent records (default: 5, max: 20) |
| GET    | `/api/dashboard/trends/monthly` | Admin, Analyst               | Income/expense per month           |
| GET    | `/api/dashboard/trends/weekly`  | Admin, Analyst               | Income/expense per ISO week        |

**`/api/dashboard/stats` response:**
```json
{
  "totalIncome": 120000,
  "totalExpense": 45000,
  "netBalance": 75000
}
```

**`/api/dashboard/recent` query parameter:** `?limit=10` (capped at 20)

**`/api/dashboard/trends/monthly` query parameter:** `?months=6` (default: 6)

**`/api/dashboard/trends/weekly` query parameter:** `?weeks=8` (default: 8)

**Monthly trend response:**
```json
[
  { "year": 2025, "month": 3, "income": 80000, "expense": 30000, "net": 50000, "label": "Mar 2025" }
]
```

---

## Data Models

### User

| Field    | Type   | Notes                                  |
|----------|--------|----------------------------------------|
| email    | String | Required, unique, lowercase            |
| password | String | Bcrypt-hashed                          |
| role     | String | `admin` \| `analyst` \| `viewer` (default: `analyst`) |

### Record

| Field     | Type     | Notes                                            |
|-----------|----------|--------------------------------------------------|
| amount    | Number   | Required, positive                               |
| type      | String   | `income` \| `expense` — required                 |
| category  | String   | Required. Tax entries use prefix `Tax – <name>` |
| date      | Date     | Required                                         |
| note      | String   | Optional                                         |
| status    | String   | `pending` \| `completed` (default: `pending`)   |
| createdBy | ObjectId | Ref: User                                        |

---

## Tax Entries

Tax records are standard expense records with a special category naming convention: `Tax – <Tax Type>` (e.g., `Tax – GST`, `Tax – Income Tax`).

The frontend Tax Modal supports:

- Preset tax types: GST, Income Tax, TDS, Professional Tax, Advance Tax, Customs Duty, or Custom
- Auto-calculation from a base amount and percentage rate
- Manual amount override
- Status tracking (pending / completed)
- Auto-generated descriptive notes

The dashboard Overview tab shows total tax paid (sum of all `Tax –` category expenses) and a pending tax count.

---

## Frontend Dashboard

The SPA at `/` provides:

- **Overview tab** — stat cards (income, expense, balance, tax), record summary, category breakdown, and recent records table
- **Records tab** — filterable, paginated table with inline Edit/Delete actions for admins; Tax and Add Record buttons visible to admins only
- **Trends tab** — monthly or weekly income/expense table with inline bar chart visualization and period totals

Role-specific UI: write actions (Add Record, Add Tax, Edit, Delete) are hidden for non-admin users.

---

## Validation

Validation is handled by Joi in `utils/validation.js`.

- **Create** (`recordSchema`): all fields required, strict types enforced
- **Update** (`updateRecordSchema`): all fields optional, at least one required, same type rules apply
- Errors return `400` with an array of messages

---

## Error Handling

- Invalid MongoDB ObjectId → `400 Bad Request`
- Missing resource → `404 Not Found`
- No/invalid JWT → `401 Unauthorized`
- Insufficient role → `403 Forbidden`
- Validation failure → `400 Bad Request` with message array
- Server errors → `500 Internal Server Error`
- Global error handler in `app.js` catches unhandled exceptions

---

## Future Improvements

- Rate limiting (e.g., `express-rate-limit`)
- Request logging (e.g., Morgan)
- Unit and integration tests (Jest + Supertest)
- Refresh token support
- CSV / Excel export for records
- Docker + docker-compose deployment
- Chart.js or similar for graphical trend visualization
