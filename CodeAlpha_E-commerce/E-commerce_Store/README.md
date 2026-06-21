# E-Commerce_Store

A basic e-commerce site built with **Express.js**, **SQLite**, and vanilla **HTML/CSS/JavaScript**.

## Features

- Product listings with search and category filters
- Product detail pages
- Shopping cart (guest localStorage + server sync when logged in)
- User registration and login
- Order checkout and order history
- SQLite database for users, products, cart, and orders

## Quick Start

```bash
cd shop-app
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The database is created automatically on first run and seeded with sample products.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Current user |
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Product details |
| GET | `/api/cart` | Get cart (auth required) |
| POST | `/api/cart` | Add to cart |
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | Order history |

## Project Structure

```
E-commerce_Store/
├── server.js           # Express server
├── db/                 # SQLite database & seed data
├── routes/             # API routes
├── middleware/         # Auth middleware
└── public/             # Frontend (HTML, CSS, JS)
```
## 🛠️ Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* SQLite

### Authentication

* JWT (JSON Web Tokens)
* bcryptjs

---

## 🎯 CodeAlpha Project

This project was developed and submitted as part of the **CodeAlpha Web Development Program**. The objective of this project was to gain practical experience in full-stack web development, database integration, authentication systems, and building real-world web applications.

---

## 👨‍💻 Author

**Pranay Unde**

Computer Science Student and Web Development Enthusiast

---

## 🙏 Acknowledgement

I would like to thank CodeAlpha for providing project-based learning opportunities that helped me strengthen my web development and problem-solving skills.
