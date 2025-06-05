# eng-resource-management-backend (ERMPro)

# eng-resource-management-backend (ERMPro)

A simple Node.js + Express.js backend for the Engineering Resource Management System.  
This server handles authentication, project and engineer management, and assignment tracking.

---

## 🚀 Getting Started

### 📦 Installation

```bash
git clone https://github.com/yourusername/eng-resource-management-backend.git
cd eng-resource-management-backend
npm install
```

### ▶️ Running the Server

```bash
npm run dev
```

### 🧪 Load Sample Data (Optional)

```bash
npm run seed
```

## 🔄 API Endpoints

### 🔐 Auth

- `POST /api/auth/login` – Log in a user
- `GET /api/auth/profile` – Get the currently logged-in user's profile
- `POST /api/auth/profile` – Update the logged-in user's profile

### 👩‍💻 Engineers

- `GET /api/engineers` – Get a list of all engineers
- `GET /api/engineers/:id/capacity` – Get capacity details for a specific engineer

### 📁 Projects

- `GET /api/projects` – Get all projects
- `POST /api/projects` – Create a new project
- `POST /api/projects/:id` – Update an existing project
- `GET /api/projects/:id` – Get details of a specific project

### 🗂️ Assignments

- `GET /api/assignments` – Get all assignments
- `GET /api/assignments/me` – Get assignments for the logged-in engineer
- `POST /api/assignments` – Create a new assignment
- `POST /api/assignments/:id` – Update an assignment
- `DELETE /api/assignments/:id` – Delete an assignment

---

## 🔐 Environment Variables

Create a .env file in the root with the following values:

```
MONGO_URI=your-mogoUri-here

JWT_SECRET=your-jwt-secrete-here

FRONTEND_URL=your-frontend-url-here(http://localhost:5173)

PORT=5000

```

---
