# Library Management System — Frontend

A modern, responsive React frontend for a full-stack Library Management System. Features role-based dashboards, real-time search, dark mode, and a clean professional UI inspired by digital library platforms.

**Backend repo:** [library-management-backend](https://github.com/aakash2005-code-it/library-management-backend)

---

## Features

- **Login & Signup** — JWT-based authentication flow
- **Role-based dashboards** — Admin sees management tools, Members see borrowing tools only
- **Live stats dashboard** — total books, members, active loans, unpaid fines
- **Real-time search** — filter books by title, author, or genre
- **Book detail modal** — click any book for full stats (borrows, availability)
- **Member profile modal** — view any member's borrowing history and fines
- **Overdue alerts** — prominent banner for books past due date
- **Pagination** — clean browsing for large book collections
- **Dark mode** — full theme toggle across the entire app
- **Mobile responsive** — adapts cleanly to phone and tablet screens
- **Smooth-scroll navbar** — quick navigation to Books, Members, Transactions, Admin sections

---

## Tech Stack

| Layer | Technology |
|---|---|
| Library | React (Vite) |
| Routing | React Router DOM |
| HTTP Client | Axios |
| Styling | Custom CSS (no framework) |

---

## Pages & Components

- `Login.jsx` — authentication entry point
- `Signup.jsx` — new member registration
- `Dashboard.jsx` — main application (books, forms, stats, modals)
- `App.jsx` — routing and auth state management

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- The [backend API](https://github.com/aakash2005-code-it/library-management-backend) running on `localhost:5000`

### Installation

```bash
git clone https://github.com/aakash2005-code-it/library-management-frontend.git
cd library-management-frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`

---

## Screenshots

*(Add a screenshot or two of the dashboard, login page, and dark mode here)*

---

## Author

**Aakash Wadhwani**
B.Tech IT, Vellore Institute of Technology
[LinkedIn](https://www.linkedin.com/in/aakash-wadhwani-273351320) · [LeetCode](https://leetcode.com/u/aakashwadhwani2005/)
