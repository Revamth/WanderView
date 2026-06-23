# WanderView

WanderView is a full-stack MERN travel/places sharing app. Users register, upload a profile photo, add geo-tagged places with images, and browse other users' places on an interactive Leaflet map.

## Tech Stack

| Layer     | Technologies                                                       |
| --------- | ------------------------------------------------------------------ |
| Frontend  | React 16.11, React Router 5, Leaflet, react-transition-group (CRA) |
| Backend   | Node.js, Express 5, Mongoose 7                                     |
| Database  | MongoDB                                                            |
| Auth      | JWT (`jsonwebtoken`), `bcryptjs` password hashing                  |
| Images    | Cloudinary                                                         |
| Geocoding | LocationIQ                                                         |

## Project Structure

```
WanderView/
├── backend/     # Standalone Express API (port 5000)
│   ├── app.js           # Server entry: CORS, routes, error handler, Mongoose connect
│   ├── controllers/     # places.js, users.js
│   ├── middleware/      # check-auth.js (JWT), file-upload.js (multer)
│   ├── models/          # Mongoose schemas + HttpError
│   ├── routes/          # places.js, users.js
│   └── util/            # cloudinary.js, location.js
└── frontend/    # Create React App
    └── src/
        ├── App.js       # Router + lazy-loaded routes + auth provider
        ├── places/      # Place pages & components
        ├── user/        # Auth, Users pages & components
        └── shared/      # Reusable components, hooks, context, validators
```

The frontend and backend are run **separately**.

## Prerequisites

- Node.js (18+ recommended)
- A MongoDB database (local or Atlas)
- A [Cloudinary](https://cloudinary.com/) account (image hosting)
- A [LocationIQ](https://locationiq.com/) API key (geocoding)

## Getting Started

### 1. Backend

```bash
cd backend
npm install
npm start          # runs on http://localhost:5000 via nodemon
```

Create a `backend/.env` file:

```ini
MONGO_DB_URI=<your MongoDB connection string>
JWT_KEY=<a long random secret>
CLOUDINARY_CLOUD_NAME=<cloudinary cloud name>
CLOUDINARY_API_KEY=<cloudinary api key>
CLOUDINARY_API_SECRET=<cloudinary api secret>
LOCATION_IQ_API_KEY=<locationiq api key>
FRONT_END_URL=http://localhost:3000
PORT=5000          # optional, defaults to 5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm start          # runs on http://localhost:3000
```

Create a `frontend/.env` file:

```ini
REACT_APP_BACKEND_URL=http://localhost:5000/api
```

## Environment Variables

### Backend

| Variable                | Purpose                                 |
| ----------------------- | --------------------------------------- |
| `MONGO_DB_URI`          | Mongoose connection string              |
| `JWT_KEY`               | Secret for signing/verifying JWTs       |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name                 |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                      |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                   |
| `LOCATION_IQ_API_KEY`   | LocationIQ geocoding key                |
| `FRONT_END_URL`         | Allowed CORS origin (the frontend URL)  |
| `PORT`                  | API port (optional, defaults to `5000`) |

### Frontend

| Variable                | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `REACT_APP_BACKEND_URL` | Base URL of the backend API used by all requests |

## API Reference

Base path: `/api`

### Users — `/api/users`

| Method | Endpoint  | Auth | Description                                       |
| ------ | --------- | ---- | ------------------------------------------------- |
| GET    | `/`       | No   | List all users (password excluded)                |
| POST   | `/signup` | No   | Register (multipart, optional image); returns JWT |
| POST   | `/login`  | No   | Authenticate; returns JWT                         |

### Places — `/api/places`

| Method | Endpoint     | Auth | Description                                 |
| ------ | ------------ | ---- | ------------------------------------------- |
| GET    | `/:pid`      | No   | Get a single place by id                    |
| GET    | `/user/:uid` | No   | Get all places for a user                   |
| POST   | `/`          | Yes  | Create a place (geocode + image upload)     |
| PUT    | `/:pid`      | Yes  | Update title/description (+ optional image) |
| DELETE | `/:pid`      | Yes  | Delete a place and its Cloudinary image     |

Protected routes require an `Authorization: Bearer <token>` header.

## Scripts

### Backend

| Command     | Description                           |
| ----------- | ------------------------------------- |
| `npm start` | Run the API with nodemon (watch mode) |

### Frontend

| Command         | Description               |
| --------------- | ------------------------- |
| `npm start`     | Start the CRA dev server  |
| `npm run build` | Production build          |
| `npm test`      | Run tests (react-scripts) |
