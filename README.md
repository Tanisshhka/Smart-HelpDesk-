# Smart IT Helpdesk System

A full-stack MERN application for an intelligent IT Helpdesk. It features role-based access control (User, Technician, Admin), AI-powered ticket categorization, and automated ticket assignment.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Authentication**: JWT-based

## Features
- **Role-Based Access Control**: Different dashboards for End Users, Technicians, and System Admins.
- **Smart Categorization**: Uses a hybrid approach (OpenAI API + Keyword fallback) to automatically categorize incoming tickets (e.g., Network, Hardware, Software).
- **Auto Assignment**: Automatically assigns tickets to the least busy technician.
- **Modern UI**: Premium dark mode design with glassmorphism and smooth Framer Motion animations.

## Getting Started

### 1. Backend Setup

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update `.env` with your MongoDB Atlas URI, JWT secret, and OpenAI API Key.
5. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment
- The backend is structured to be deployed on Render or Heroku.
- The frontend Vite app can be deployed easily on Vercel or Netlify.

## API Endpoints (Brief)
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login user and get JWT
- `POST /api/tickets`: Create a new ticket (Auth required)
- `GET /api/tickets`: Get tickets based on user role (Auth required)
- `PUT /api/tickets/:id/status`: Update ticket status (Technician/Admin only)
