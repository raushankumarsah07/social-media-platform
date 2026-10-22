# Loop – Mini Social Media App (MERN)

A small social network built with **MongoDB, Express.js, React (Vite) and Node.js**.

## Features

- **User profiles** – register/login (JWT + bcrypt), view any profile, edit your name & bio, post/follower/following counts
- **Posts & comments** – create posts (text + optional image link), delete your own, comment on posts, delete comments
- **Like / follow system** – like/unlike posts, follow/unfollow users, feed of people you follow, "Everyone" feed, people search

## Database (MongoDB collections)

| Collection            | Fields                                          |
| --------------------- | ----------------------------------------------- |
| `users`               | username, email, password (hashed), name, bio   |
| `posts`               | author → User, text, image, likes [User ids]    |
| `comments`            | post → Post, author → User, text                |
| `follows` (followers) | follower → User, following → User (unique pair) |

## Run locally

Requirements: Node 18+ and MongoDB (local or Atlas).

```bash
# 1) Backend
cd server
npm install
cp .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm run dev               # http://localhost:5001

# 2) Frontend (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

Vite proxies `/api` to the Express server, so no extra CORS setup is needed in development.

## REST API

| Method   | Endpoint                                        | Description                    |
| -------- | ----------------------------------------------- | ------------------------------ |
| POST     | `/api/auth/register`                            | Create account                 |
| POST     | `/api/auth/login`                               | Log in with username or email  |
| GET      | `/api/auth/me`                                  | Current user                   |
| GET      | `/api/users?q=`                                 | Search people                  |
| GET      | `/api/users/:username`                          | Profile + counts + isFollowing |
| PUT      | `/api/users/me`                                 | Update name/bio                |
| POST     | `/api/users/:id/follow`                         | Toggle follow                  |
| GET      | `/api/posts?scope=following\|all&author=&page=` | Feed / user posts              |
| POST     | `/api/posts`                                    | Create post                    |
| DELETE   | `/api/posts/:id`                                | Delete own post                |
| POST     | `/api/posts/:id/like`                           | Toggle like                    |
| GET/POST | `/api/posts/:id/comments`                       | List / add comments            |
| DELETE   | `/api/posts/:postId/comments/:commentId`        | Delete comment                 |

All routes except register/login require `Authorization: Bearer <token>`.

## Folder structure

```
server/  config/  models/  middleware/  routes/  server.js
client/  src/{components,pages,context}  api.js  App.jsx
```
