# ConnectHub

A mini social media platform built with **Express.js**, **SQLite**, and vanilla **HTML/CSS/JavaScript**.

## Features

- **User profiles** — username, display name, bio, avatar URL
- **Posts & comments** — share updates and reply on posts
- **Likes** — toggle likes on any post
- **Follow system** — follow/unfollow users, filter feed to people you follow
- **Auth** — register, login, logout with JWT cookies

## Quick start

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Demo accounts

| Username | Email | Password |
|----------|-------|----------|
| alice | alice@example.com | password123 |
| bob | bob@example.com | password123 |
| carol | carol@example.com | password123 |

## API endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current user |
| GET | `/api/users/:username` | User profile + posts |
| PUT | `/api/users/me` | Update own profile |
| POST | `/api/users/:username/follow` | Follow user |
| DELETE | `/api/users/:username/follow` | Unfollow user |
| GET | `/api/posts` | Feed (`?following=true` for following only) |
| POST | `/api/posts` | Create post |
| GET | `/api/posts/:id` | Post with comments |
| POST | `/api/posts/:id/like` | Toggle like |
| GET | `/api/posts/:id/comments` | List comments |
| POST | `/api/posts/:id/comments` | Add comment |

## Database

SQLite file: `db/social.db`

Tables: `users`, `posts`, `comments`, `post_likes`, `followers`

Reset and reseed:

```bash
npm run seed
```

## Stack

- **Backend:** Express.js, bcryptjs, jsonwebtoken, cookie-parser
- **Database:** SQLite (Node.js built-in `node:sqlite`)
- **Frontend:** HTML, CSS, JavaScript (no framework)

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
