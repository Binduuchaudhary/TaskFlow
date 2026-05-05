# Team Task Manager Full Stack

Full-stack assignment project with:

- Authentication: signup/login
- Role-based access: admin/member
- Project and team management
- Task creation, assignment, status tracking
- Dashboard with total, assigned, status, and overdue task counts
- REST API with MongoDB
- React frontend

## Project Structure

```text
TaskFlow/
  backend/
    server.js
    package.json
    .env.example
    src/
      app.js
      config/db.js
      controllers/
      middleware/
      models/
      routes/
      utils/
  frontend/
    index.html
    package.json
    .env.example
    vite.config.js
    src/
      main.jsx
      App.jsx
      styles.css
      api/
      components/
      context/
      hooks/
      pages/
      utils/
```

## Run Locally

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Set `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Set `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Open:

```text
http://localhost:5173
```

## Deployment On Railway

Create two Railway services from the same GitHub repo.

### Backend Service

Root directory:

```text
backend
```

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Environment variables:

```env
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-url.up.railway.app
```

After deploy, your API base URL will look like:

```text
https://your-backend-url.up.railway.app/api
```

### Frontend Service

Root directory:

```text
frontend
```

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm start
```

Environment variable:

```env
VITE_API_URL=https://your-backend-url.up.railway.app/api
```

After changing env variables, redeploy the frontend.

## Demo Flow

1. Signup as admin.
2. Signup one or more members.
3. Login as admin.
4. Create a project and select members.
5. Open the project details page.
6. Create tasks and assign them to members.
7. Login as a member and update assigned task status.
8. Show dashboard progress and overdue task counts.

## API Summary

```text
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me
GET    /api/users
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
GET    /api/dashboard
```
