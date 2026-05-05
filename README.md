# Project Management System

A robust, full-stack Project Management application built with the **MERN** stack (MongoDB, Express, React, Node.js). This application features a premium, modern user interface for managing projects, assigning tasks using a Kanban-style board, handling member assessments, and maintaining role-based access control.

## 🚀 Features

* **Secure Authentication:** JWT-based authentication strictly utilizing `HttpOnly` cookies for maximum security (zero local storage persistence).
* **Role-Based Access Control (RBAC):** Distinct roles for **Admins** and **Members** with protected routes and restricted actions.
* **Project Management:** Admins can create projects, assign team members, and track the overall project status.
* **Task Kanban Board:** Interactive task board (Todo, In Progress, Done). Tasks include priorities, due dates, assignees, and feedback attachments.
* **Assessments & Reviews:** Admins can create performance assessments for members. Members submit their work, and Admins can review it, assigning a score out of 100 along with detailed feedback.
* **Fully Responsive:** Sleek, dynamic, and fully responsive UI designed for all screen sizes.

## 💻 Tech Stack

* **Frontend:** React.js, Vite, Axios, React Router, Lucide Icons
* **Backend:** Node.js, Express.js, Mongoose (MongoDB)
* **Authentication:** JSON Web Tokens (JWT), Cookie-Parser
* **Deployment Ready:** Configured for seamless monolithic deployment on platforms like Railway.

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables. 

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development # Set to 'production' when deploying
CLIENT_URL=http://localhost:5173 # Optional: Used for CORS
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api # URL of the backend API
```

## 🛠️ Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Modassir22/project_management.git
   cd project_management
   ```

2. **Install dependencies for both folders:**
   *(The root `package.json` allows you to install both at once)*
   ```bash
   npm run install
   ```

3. **Start the Development Servers:**
   - **Start Backend** (from the `/backend` directory):
     ```bash
     cd backend
     npm run dev
     ```
   - **Start Frontend** (from the `/frontend` directory):
     ```bash
     cd frontend
     npm run dev
     ```

4. **Access the Application:**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🌐 Deployment (Railway)

This repository is optimized for a monolithic deployment on **Railway**. It builds the frontend and serves it directly from the Express backend.

1. Create a new project on [Railway](https://railway.app/).
2. Select **Deploy from GitHub repo** and choose this repository.
3. In the Railway project settings, add your Environment Variables (specifically `MONGO_URI`, `JWT_SECRET`, and `NODE_ENV=production`).
4. Railway will automatically use the root `package.json` to install dependencies, build the React frontend, and start the Node.js backend to serve the entire application on a single port.

## 📝 License

This project is licensed under the MIT License.
