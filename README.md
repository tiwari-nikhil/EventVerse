# 🎯 EventVerse — Student Growth Ecosystem

> Transforming Event Participation into Student Growth

A full-stack platform for educational institutions to manage events end-to-end — from discovery to QR attendance to certificate generation and portfolio building.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (Atlas)

### 1. Start the Backend

```bash
cd server
npm run dev
```

### 2. Seed Demo Data

```bash
cd server
npm run seed
```

### 3. Start the Frontend

```bash
cd client
npm run dev
```

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| 🎓 Student | student@demo.com | demo123 |
| 🎪 Organizer | organizer@demo.com | demo123 |
| ⚡ Admin | admin@demo.com | demo123 |

---

## 🏗️ Architecture

```
EventVerse/
├── client/          ← React + Vite + Tailwind CSS
│   └── src/
│       ├── pages/   ← All page components
│       ├── components/
│       ├── store/   ← Zustand state
│       ├── api/     ← Axios client
│       └── layouts/
├── server/          ← Node.js + Express
│   ├── models/      ← 8 Mongoose schemas
│   ├── routes/      ← REST API
│   ├── controllers/
│   └── middleware/  ← Auth + RBAC
├── docs/
│   ├── PRD.md       ← Product Requirements Document
│   └── contibutor.md← Contribution guidelines
└── README.md
```

---

## ✨ Features

### For Students
- 🔍 **Event Discovery** — Browse, search, filter events by category, mode, tags
- 🤖 **Smart Recommendations** — Events matched to your interests
- 📱 **QR Event Pass** — Unique QR code generated on registration
- 🎓 **Auto Certificates** — Generated instantly when attendance is marked
- 🏆 **Digital Portfolio** — All achievements in one place

### For Organizers
- 📅 **Event Management** — Create, edit, publish events with rich details
- 📊 **QR Scanner** — Camera-based attendance scanning
- 📈 **Analytics** — Dept/year/hourly attendance breakdowns
- ✅ **Participant Tracking** — Real-time registration and attendance list

### For Admins
- 👥 **User Management** — View/toggle all users
- ✅ **Organizer Verification** — Approve/reject organization requests
- 📊 **Platform Analytics** — Platform-wide stats dashboard

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4 |
| State | Zustand (persisted) |
| HTTP | Axios |
| Charts | Recharts |
| Animations | Framer Motion |
| QR Generate | qrcode |
| QR Scan | html5-qrcode |
| PDF | jsPDF + html2canvas |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/events | List events (filtered) |
| POST | /api/events | Create event (organizer) |
| POST | /api/registrations | Register for event |
| POST | /api/attendance/scan | Scan QR code |
| GET | /api/certificates/my | Student certificates |
| GET | /api/analytics/:id | Event analytics |
| GET | /api/admin/stats | Platform stats |

---


## 📈 Future Roadmap (V2+)

- AI Team Matchmaking
- Campus Leaderboards
- Recruiter Portal
- Blockchain certificate verification
- AI Resume Builder
- Sponsor Marketplace
