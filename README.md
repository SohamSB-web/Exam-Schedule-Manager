# Exam Schedule Manager 🎓

A minimal, responsive full-stack examination timetable manager built for a 45-minute workshop. Features passwordless student login & registration powered by **Minimoth OTP API**, live countdowns, course badge tracking, and exam hall/seat management.

---

## ⚡ Strictly Minimal Architecture

This project strictly adheres to the workshop constraints:

* **Maximum 3 Frontend Pages:**
  1. **Auth Page (`/`)**: Student login/registration using phone number and Minimoth OTP verification.
  2. **Schedule Page**: Live countdown to the next exam, timetable cards, subject badges, venue/seat details, filter tabs, and quick status toggles.
  3. **Exam Form Page**: Add new or edit existing exam entries with course selector, date/time presets, venue hall, seat number, and syllabus notes.

* **Maximum 5 Backend API Endpoints:**
  1. `POST /api/auth/send-otp` - Normalizes phone number and requests OTP delivery via Minimoth API.
  2. `POST /api/auth/verify-otp` - Verifies OTP via Minimoth API, provisions student record, and issues JWT token.
  3. `GET /api/exams` - Retrieves student's scheduled exams, summary metrics, and subjects catalog.
  4. `POST /api/exams` - Creates a new exam entry or updates an existing exam.
  5. `DELETE /api/exams/:id` - Deletes an exam schedule entry.

* **Maximum 3 Database Entities / Models (SQLite via built-in `node:sqlite`):**
  1. `users` (id, phone, name, student_id, created_at)
  2. `subjects` (id, code, name, department, color)
  3. `exams` (id, user_id, subject_id, exam_title, exam_date, start_time, end_time, venue_hall, seat_number, status, notes, created_at)

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite, Vanilla CSS design system with Outfit & Plus Jakarta Sans typography.
* **Backend**: Node.js, Express, `node:sqlite` (Node.js built-in zero-dependency SQLite), JSON Web Tokens (`jsonwebtoken`), CORS, `dotenv`.
* **Authentication**: Minimoth OTP API (`https://api.minimoth.dev/v1/otp`).

---

## 🚀 Quickstart Guide

### 1. Prerequisites
* **Node.js** v18+ (Node 22+ recommended for built-in SQLite).

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` inside `backend/` (or copy from `.env.example`):
```env
PORT=5000
JWT_SECRET=super_secret_exam_schedule_jwt_key_2026
MINIMOTH_API_KEY=mm_live_9506dde11ef14945141f94091663ddb96995889fe6e1df5dcf5b80004446a9e856f35208f776e0eac06a9c6eae66cb95
```

Start the backend:
```bash
npm start
# or for auto-reloading:
npm run dev
```
Backend will run at `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env` inside `frontend/` (or copy from `.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 Authentication Flow & Testing

1. Enter your phone number with country code (e.g. `+919876543210`), optional Full Name, and optional Student ID.
2. Click **Send Verification OTP**. The backend calls `https://api.minimoth.dev/v1/otp/send` using the configured `MINIMOTH_API_KEY`.
3. Enter the 6-digit OTP code received via SMS.
   > **Workshop Testing Note**: In local sandbox/testing environments, `123456` can also be used as a valid fallback code.
4. Once verified, a JWT token is issued, and the dashboard opens with your schedule.
