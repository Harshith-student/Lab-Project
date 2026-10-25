# 🛒 Lab-Project — Full-Stack E-Commerce Application

A full-stack e-commerce web application built with **React + Vite** on the frontend and **Node.js + Express + MongoDB** on the backend, featuring product browsing, cart management, wishlist, checkout with **Razorpay** payment integration, and JWT-based authentication.

---

## 📦 Tech Stack

| Layer | Technology |
|------------|------------------------------------------|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 |
| **Routing** | React Router DOM v7 |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT (JSON Web Tokens) + HTTP-only cookies |
| **Payments** | Razorpay |
| **HTTP Client** | Axios |

---

## 📁 Project Structure

```
Lab-Project/
├── client/
│   └── Lab-Project/         # React + Vite frontend
│       ├── src/
│       │   ├── Pages/       # Route-level page components
│       │   ├── components/  # Reusable UI components
│       │   ├── context/     # React context (Auth, Cart)
│       │   └── axiosCalls/  # Axios instance & API helpers
│       ├── public/
│       ├── index.html
│       └── package.json
│
└── server/                  # Express backend
    ├── controllers/         # Business logic
    ├── models/              # Mongoose schemas
    ├── routes/              # Express route definitions
    ├── middlewares/         # Auth & other middleware
    ├── utils/               # Helper utilities
    ├── config/              # DB config
    ├── .env.example         # Environment variable template
    └── index.js             # App entry point
```

---

## ✨ Features

- 🔐 **User Authentication** — Register, login, logout with JWT (HTTP-only cookies)
- 🏠 **Home Page** — Featured products and categories
- 🛍️ **Product Catalogue** — Browse and filter products with search
- 📄 **Product Details** — Detailed product view
- ❤️ **Wishlist** — Save products for later
- 🛒 **Cart** — Add/remove items, update quantities
- 💳 **Checkout** — Razorpay payment integration
- ✅ **Order Management** — View order history and order details
- 🔒 **Protected Routes** — Auth-guarded pages

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)
- A [Razorpay](https://razorpay.com/) test account (for payment features)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/Lab-Project.git
cd Lab-Project
```

### 2. Set Up the Backend (Server)

```bash
cd server
npm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Edit `server/.env`:

```env
# MongoDB Atlas connection string
dbUrl=mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/<dbname>

username=your_mongodb_username
password=your_mongodb_password

# JWT Secret (any long random string)
JWT_SECRET=your_super_secret_jwt_key

# Razorpay keys (from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

PORT=8090
```

Start the server:

```bash
node index.js
# or with hot-reload:
npx nodemon index.js
```

The backend will run at: `http://localhost:8090`

---

### 3. Set Up the Frontend (Client)

```bash
cd client/Lab-Project
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will run at: `http://localhost:5173`

---

## 🌐 API Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `POST` | `/customers/register` | Register a new user | ❌ |
| `POST` | `/customers/login` | Login & receive JWT cookie | ❌ |
| `POST` | `/customers/logout` | Logout & clear cookie | ✅ |
| `GET` | `/products` | Get all products | ✅ |
| `GET` | `/products/:id` | Get product by ID | ✅ |
| `GET` | `/wishlist` | Get user wishlist | ✅ |
| `POST` | `/wishlist/:productId` | Add to wishlist | ✅ |
| `DELETE` | `/wishlist/:productId` | Remove from wishlist | ✅ |
| `GET` | `/cart` | Get user cart | ✅ |
| `POST` | `/cart/:productId` | Add item to cart | ✅ |
| `PATCH` | `/cart/:productId` | Update cart item quantity | ✅ |
| `DELETE` | `/cart/:productId` | Remove item from cart | ✅ |
| `GET` | `/orders` | Get all user orders | ✅ |
| `GET` | `/orders/:id` | Get order details | ✅ |
| `POST` | `/orders` | Create new order | ✅ |

> ✅ = Requires JWT authentication via HTTP-only cookie

---

## 🔑 Environment Variables Reference

All secrets live in `server/.env` (never committed to git).

| Variable | Description |
|---|---|
| `dbUrl` | MongoDB Atlas connection URI |
| `username` | MongoDB username |
| `password` | MongoDB password |
| `JWT_SECRET` | Secret key for signing JWTs |
| `RAZORPAY_KEY_ID` | Razorpay API key ID (test/live) |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret |
| `PORT` | Backend server port (default: 8090) |

See `server/.env.example` for a full template.

---

## 🗄️ Database Models

| Model | Description |
|---|---|
| `Customer` | User accounts with hashed passwords |
| `Product` | Product catalog with price, image, description |
| `Order` | Order records with items, amounts, and payment status |

---

## 🧪 Running in Development

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd server
node index.js
```

**Terminal 2 — Frontend:**
```bash
cd client/Lab-Project
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security Notes

- `.env` files are listed in `.gitignore` and are **never** pushed to GitHub
- Passwords are hashed using `bcrypt` before storage
- Authentication uses JWT tokens stored in HTTP-only cookies (not localStorage)
- CORS is configured to only allow local development origins

---

## 📜 License

This project is for educational/lab purposes. All rights reserved.
