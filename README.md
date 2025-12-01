# Gantt Chart Application

A React-based Gantt chart application with backend API integration.

## Features
- Visual Gantt chart with drag-and-drop date editing
- Add, Edit, Delete tasks
- Progress tracking
- Task dependencies
- Start and end date display (no month grouping)
- REST API backend

## Setup

### Backend
```bash
cd backend
npm install
npm start
```
Backend runs on http://localhost:3001

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

## Usage
- Click "Add Task" to create new tasks
- Double-click tasks in the Gantt chart to edit
- Drag task bars to change dates
- Use the task list below to edit or delete tasks

## API Endpoints
- GET /api/tasks - Get all tasks
- POST /api/tasks - Create task
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task
