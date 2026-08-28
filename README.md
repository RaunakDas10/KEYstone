# KEYstone Protocol

KEYstone is an escrow and milestone-based project governance platform for clients and freelancers with immutable ledger tracking, 90/10 fair resolution, 7-day auto-unlock protection, and admin arbitration.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Zustand, Lucide React, Recharts
- **Backend & API**: Node.js, Express, TypeScript (`tsx`), CORS, Dotenv
- **Database**: **MongoDB** with Mongoose ODM

---

## 🗄️ Database Architecture (MongoDB)

The project uses MongoDB as the primary persistent database with the following collections and Mongoose models:

1. **`User`** (`server/models/User.ts`): User accounts (clients, freelancers, admins), trust scores, completed projects, hourly rates.
2. **`Project`** (`server/models/Project.ts`): Projects with milestone structures, fund custody states (`IN_CUSTODY`, `FROZEN`, `WITHDRAWABLE`, `PAID`, `REFUNDED`, `DISPUTED`), checkpoint submissions, and ratings.
3. **`LedgerEntry`** (`server/models/LedgerEntry.ts`): Immutable escrow audit ledger with event types, state transitions, cryptographic hashes, and timestamps.
4. **`Dispute`** (`server/models/Dispute.ts`): Arbitration records, evidence, and custom financial settlement splits.
5. **`Message`** (`server/models/Message.ts`): Project communication and automated platform protocol events.
6. **`Notification`** (`server/models/Notification.ts`): Real-time notifications for milestone reviews, fund movements, and system alerts.
7. **`Report`** (`server/models/Report.ts`): Platform moderation reports.

---

## 🚀 Quick Start

### 1. Configure Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/keystone
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/keystone?retryWrites=true&w=majority
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Frontend & Backend Together
```bash
npm run dev:all
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

### 4. Other Available Commands
| Command | Description |
|---|---|
| `npm run dev` | Start the Vite frontend dev server |
| `npm run server` | Start the Express backend server with MongoDB connection |
| `npm run db:seed` | Seed MongoDB with initial users, demo projects, ledger entries, and messages |
| `npm run build` | Compile TypeScript and build production frontend assets |

---

## 📡 REST API Endpoints

- `GET /api/health` - MongoDB connection status & server health
- `POST /api/seed` - Trigger database seeding
- `GET/PUT /api/auth/users` - User profiles and role switching
- `GET/POST /api/projects` - Project CRUD, milestones, checkpoint submissions, approvals, 90/10 resolution
- `GET/POST /api/ledger` - Immutable escrow transaction ledger
- `GET/POST /api/disputes` - Dispute management and admin arbitration
- `GET/POST /api/messages` - Project chat & system audit events
- `GET/POST/PUT /api/notifications` - Notifications management
- `POST /api/payouts/withdraw` - Freelancer earnings withdrawal
