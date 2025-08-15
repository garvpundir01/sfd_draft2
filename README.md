# Smart Finance Dashboard (SFD)

A full-stack **spending tracker and budgeting app** built with **React (Vite)** on the frontend and **Django + Django REST Framework** on the backend.  
Easily track transactions, manage budgets, and visualize your spending patterns with beautiful charts.

---

## 🚀 Features

- **JWT Authentication** (login, token refresh, protected routes)
- **Transactions Management**
  - Add, edit, and delete transactions
  - Categorize income & expenses
  - Associate with accounts
- **Budgets**
  - Set per-category monthly budgets
  - Track progress with remaining budget calculation
- **Summaries & Charts**
  - Spending by category
  - Spending by month
- **Responsive UI** with reusable components
- **CORS Configured** for local development
- **PostgreSQL Database** ready

---

## 🛠️ Tech Stack

### Frontend
- React + Vite
- Axios (API requests)
- React Router DOM
- Recharts (charts/graphs)
- Custom CSS styling

### Backend
- Django 5
- Django REST Framework
- django-filter
- SimpleJWT (JWT auth)
- PostgreSQL (`psycopg` driver)

---

## 📦 Installation & Setup

### 1️⃣ Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
