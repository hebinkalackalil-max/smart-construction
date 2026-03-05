# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Smart Construction Management System - a MERN stack application for managing construction sites, workers, attendance, payments, and equipment across multiple sites.

## Development Commands

### Server (Express/Node.js)
```powershell
cd server
npm install          # Install dependencies
npm run dev          # Start with nodemon (hot reload)
npm start            # Production start
```

### Client (React/Vite)
```powershell
cd client
npm install          # Install dependencies
npm run dev          # Start Vite dev server (HMR)
npm run build        # Production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Environment Setup
Server requires `.env` file with:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token signing
- `PORT` - Server port (defaults to 5000)

Client can use `.env` with:
- `VITE_API_URL` - Backend API URL (defaults to `http://localhost:5000/api`)

## Architecture

### Backend (`server/`)
- **Entry point**: `server.js` - Express app setup with middleware and route mounting
- **Database**: `config/db.js` - Mongoose connection using `MONGO_URI`
- **Authentication**: JWT-based auth with Bearer tokens
  - `middleware/auth.js` exports `auth` (token verification) and `authorize(...roles)` (role-based access)
  - Tokens stored in `Authorization` header, decoded user attached to `req.user`

**API Routes** (all prefixed with `/api`):
- `/auth` - Login, register, token verification
- `/sites` - Construction site CRUD
- `/attendance` - Worker attendance records
- `/payments` - Salary calculations and payment records
- `/tasks` - Task assignment and tracking
- `/equipment` - Equipment management
- `/users` - User management
- `/reports` - System reports (admin)

**Models** (Mongoose schemas in `models/`):
- `User` - Roles: `admin`, `supervisor`, `worker`, `accountant`, `user`
- `Site` - Linked to supervisor via `supervisorID`, contains `workerIDs` array
- `Attendance` - Links worker + site + date (unique compound index)
- `Payment` - Salary records with `Pending`/`Paid` status
- `Task`, `Equipment`

### Frontend (`client/`)
- **Framework**: React 19 with Vite
- **Routing**: React Router DOM with role-based protected routes
- **State**: `AuthContext` manages user session (JWT in localStorage)
- **API Layer**: `utils/api.js` - Axios instance with token interceptor and 401 handling

**Page Structure** (`pages/`):
- `/admin/*` - Dashboard, sites, users, equipment, reports
- `/supervisor/*` - Dashboard, sites, site-workers, attendance, tasks, equipment
- `/worker/*` - Dashboard, attendance, tasks, payments, payslip
- `/accountant/*` - Dashboard, calculate, payments, reports, payslip

**Route Protection**: `ProtectedRoute` component checks `allowedRoles` prop against `user.role` from `AuthContext`

### User Role Permissions
- **Admin**: Full system access - manage sites, all users, equipment, view all reports
- **Supervisor**: Assigned sites only - mark attendance, assign tasks, update progress, track equipment
- **Worker**: Own data - view tasks, mark attendance, view salary/payments
- **Accountant**: Financial operations - calculate salaries, process payments, generate payslips

## Code Patterns

### Adding a New API Route
1. Create route file in `server/routes/`
2. Use `auth` middleware for protected routes
3. Use `authorize('role1', 'role2')` for role-specific access
4. Mount in `server.js`: `app.use('/api/newroute', require('./routes/newroute'))`

### Adding a New Page
1. Create component in `client/src/pages/{role}/`
2. Add route in `App.jsx` wrapped with `ProtectedRoute` and `Layout`
3. Update `Sidebar.jsx` if adding navigation link
