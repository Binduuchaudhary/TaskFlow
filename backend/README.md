# Team Task Manager Backend

REST API backend for the assignment: authentication, projects, team members, task assignment, status tracking, dashboard stats, validations, relationships, and role-based access control.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Admin/member role-based access

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Update `.env` with your MongoDB connection string and JWT secret.

## Railway Deployment

1. Push this backend folder to GitHub.
2. Create a Railway project.
3. Add a MongoDB database or use MongoDB Atlas.
4. Add these environment variables in Railway:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `CLIENT_URL`
5. Railway will run `npm start`.

## Roles

- `admin`: create/update/delete projects, add members, create/assign/update/delete tasks, view all data.
- `member`: view assigned/member projects, view project tasks, update status of their own tasks.

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Public | Create user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Auth | Current user |

Signup body:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "secret123",
  "role": "admin"
}
```

Login body:

```json
{
  "email": "admin@example.com",
  "password": "secret123"
}
```

Use the returned token in protected requests:

```http
Authorization: Bearer YOUR_TOKEN
```

### Projects

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/projects` | Auth | List projects |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/:id` | Project member/admin | Project details and tasks |
| PATCH | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project and tasks |

Create project body:

```json
{
  "name": "Website Redesign",
  "description": "Build the new company website",
  "memberIds": ["USER_ID_1", "USER_ID_2"],
  "dueDate": "2026-06-01"
}
```

### Tasks

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/tasks` | Auth | List tasks |
| POST | `/api/tasks` | Admin | Create task |
| GET | `/api/tasks/:id` | Project member/admin | Task details |
| PATCH | `/api/tasks/:id` | Admin or assignee | Update task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

Create task body:

```json
{
  "title": "Create wireframes",
  "description": "Prepare homepage and dashboard wireframes",
  "project": "PROJECT_ID",
  "assignedTo": "USER_ID",
  "priority": "high",
  "dueDate": "2026-05-10"
}
```

Filter examples:

```http
GET /api/tasks?status=todo
GET /api/tasks?overdue=true
GET /api/tasks?project=PROJECT_ID
GET /api/tasks?assignedTo=USER_ID
```

### Dashboard

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/dashboard` | Auth | Project/task/overdue/status summary |

### Users

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/users` | Admin | List users for project member selection |

Example response:

```json
{
  "totalProjects": 2,
  "totalTasks": 10,
  "overdueTasks": 1,
  "myTasks": 4,
  "byStatus": {
    "todo": 3,
    "in-progress": 5,
    "done": 2
  }
}
```

## Folder Structure

```text
backend/
  server.js
  package.json
  .env.example
  src/
    app.js
    config/
      db.js
    controllers/
      authController.js
      dashboardController.js
      projectController.js
      taskController.js
    middleware/
      authMiddleware.js
      errorMiddleware.js
      validateRequest.js
    models/
      Project.js
      Task.js
      User.js
    routes/
      authRoutes.js
      dashboardRoutes.js
      projectRoutes.js
      taskRoutes.js
    utils/
      asyncHandler.js
      generateToken.js
```
