# Team Task Manager Frontend

React frontend for the Team Task Manager backend.

## Features

- Login and signup
- Admin/member role-aware UI
- Dashboard metrics
- Project list and project details
- Admin project creation
- Admin task creation and deletion
- Task filtering by status and overdue
- Assignee/admin task status updates

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Set the backend API URL in `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

For deployment, change `VITE_API_URL` to your live backend API URL.

## Default Flow

1. Start the backend.
2. Create an admin account from signup.
3. Create member accounts from signup.
4. As admin, create a project and choose members.
5. As admin, create tasks from a project detail page.
6. Members can view their project tasks and update their assigned task status.

## Folder Structure

```text
frontend/
  index.html
  package.json
  .env.example
  src/
    App.jsx
    main.jsx
    styles.css
    api/
      client.js
    components/
      AppLayout.jsx
      EmptyState.jsx
      ErrorMessage.jsx
      PageHeader.jsx
      ProtectedRoute.jsx
      StatusBadge.jsx
    context/
      AuthContext.jsx
    hooks/
      useAsync.js
    pages/
      AuthPage.jsx
      DashboardPage.jsx
      ProjectDetailsPage.jsx
      ProjectsPage.jsx
      TaskForm.jsx
      TasksPage.jsx
    utils/
      date.js
```
