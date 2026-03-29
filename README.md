# 📝 Task Management System (Full Stack)

A full-stack Task Management System built with **Node.js, Express, MySQL, and React**.
This project allows users to efficiently organize and track their work. Admins can create users and assign tasks to them, while regular users can log in, view their assigned and personal tasks, create new tasks, update their status, and delete them. The system ensures secure access using JWT-based authentication and role-based authorization, providing a structured workflow for managing tasks similar to real-world project management tools.

---

## 🚀 Features

### 🔐 Authentication

* User login with JWT
* Role-based access (Admin / User)

### 👨‍💼 Admin Features

* Create users
* View all users
* Assign tasks to users
* View assigned tasks
* Delete assigned tasks

### 👤 User Features

* Login securely
* Create personal tasks
* View all assigned + personal tasks
* Update task status (pending, in_progress, completed)
* Delete personal tasks

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* MySQL
* JWT Authentication
* bcrypt (password hashing)

### Frontend

* React (Vite)
* CSS (custom styling)

---

## 📂 Project Structure

```bash
task-manager/
│
├── backend/
│   ├── config/
│   │   └── dbConnection.js
│   │
│   ├── middleware/
│   │   ├── authToken.js
│   │   └── admin.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   └── tasks.js
│   │
│   ├── .env
│   ├── hash.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── src/
│   ├── assets/
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Login.css
│   │   ├── Dashboard.jsx
│   │   ├── Dashboard.css
│   │   ├── AdminDashboard.jsx
│   │   └── AdminDashboard.css
│   │
│   ├── api.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── public/
├── package.json
├── package-lock.json
├── index.html
└── README.md
```
---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```
git clone https://github.com/your-username/task-manager.git
cd task-manager
```

---

## 🗄️ Database Setup (MySQL)

### Create Database

```sql
CREATE DATABASE task;
USE task;
```

---

### Create Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(50) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin','user') DEFAULT 'user'
);
```

---

### Create Tasks Table

```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  status ENUM('pending','in_progress','completed') DEFAULT 'pending',
  assigned_to INT,
  created_by INT,
  deadline DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

---

## 🔐 Create Admin User

1. Generate hashed password:

```
node
```

```javascript
require("bcrypt").hash("admin123", 10).then(console.log)
```

2. Insert into DB:

```sql
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@test.com', 'HASHED_PASSWORD', 'admin');
```

---

## ⚙️ Backend Setup

```
cd backend
npm install
```

### Create `.env` file

```
PORT=3000
JWT_SECRET=your_secret_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=task_manager
```

### Run Backend

```
node server.js
```

---

## 🎨 Frontend Setup

```
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 🔗 API Endpoints

### 🔐 Auth

| Method | Endpoint       | Description              |
| ------ | -------------- | ------------------------ |
| POST   | /auth/login    | Login                    |
| POST   | /auth/register | Create user (admin only) |
| GET    | /auth/allusers | Get users                |

---

### 📋 Tasks

| Method | Endpoint          | Description          |
| ------ | ----------------- | -------------------- |
| POST   | /tasks/assign     | Assign task (admin)  |
| POST   | /tasks            | Create personal task |
| GET    | /tasks/userTasks  | Get user tasks       |
| PATCH  | /tasks/:id/status | Update status        |
| DELETE | /tasks/:id        | Delete task          |
| GET    | /tasks/assigned   | Admin view tasks     |
| DELETE | /tasks/admin/:id  | Admin delete task    |

---

## 🧪 Testing

You can test APIs using:

* Postman

---


