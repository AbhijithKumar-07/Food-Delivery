# Food Delivery App

A full-stack food delivery application with separate admin dashboard, Stripe payment gateway integration, and image upload handling using Multer. The project is organized into three main folders: `frontend`, `backend`, and `Admin`.

---

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Admin Dashboard](#admin-dashboard)
- [Stripe Payment Gateway Integration](#stripe-payment-gateway-integration)
- [Multer Middleware for Image Handling](#multer-middleware-for-image-handling)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [License](#license)

---

## Features
- User authentication and management
- Food item listing and ordering
- Cart functionality
- Order tracking
- Admin dashboard for managing food items, orders, and users
- Stripe payment gateway integration for secure payments
- Image upload and management using Multer

---

## Project Structure
```
Food-Delivery/
├── Admin/         # Admin dashboard (React + Vite)
├── backend/       # Node.js/Express backend API
├── frontend/      # User-facing frontend (React + Vite)
```

### Backend
- **server.js**: Main Express server
- **Config/db.js**: Database connection (MongoDB)
- **controllers/**: Business logic for cart, food, order, user
- **middleware/auth.js**: JWT authentication middleware
- **models/**: Mongoose models for food, order, user
- **routes/**: API routes for cart, food, order, user
- **uploads/**: Stores uploaded food images

### Frontend & Admin
- **src/**: React components, pages, assets
- **vite.config.js**: Vite configuration
- **public/**: Static assets

---

## Admin Dashboard
The `Admin` folder contains a separate React-based dashboard for administrators. Features include:
- Add, edit, and delete food items
- Manage orders and users
- Sidebar and navbar components for navigation
- Image upload functionality for food items

---

## Stripe Payment Gateway Integration
Stripe is integrated in the backend to handle secure payments. Key points:
- Stripe API is used to process payments for orders
- Payment routes and controllers handle transaction logic
- Frontend communicates with backend for payment processing
- Ensures PCI compliance and secure handling of card data

---

## Multer Middleware for Image Handling
Multer is used in the backend for handling image uploads:
- Food images are uploaded via API and stored in `uploads/`
- Multer middleware processes multipart/form-data requests
- Uploaded images are linked to food items in the database
- Admin dashboard provides UI for image upload

---

## Getting Started

### Prerequisites
- Node.js & npm
- MongoDB

### Installation
1. Clone the repository:
   ```powershell
   git clone https://github.com/AbhijithKumar-07/Food-Delivery.git
   ```
2. Install dependencies for each folder:
   ```powershell
   cd backend; npm install
   cd ../frontend; npm install
   cd ../Admin; npm install
   ```
3. Set up environment variables (see `.env.example` if available)
4. Start backend server:
   ```powershell
   cd backend; npm start
   ```
5. Start frontend and admin dashboards:
   ```powershell
   cd frontend; npm run dev
   cd ../Admin; npm run dev
   ```

---

## Scripts
- `npm start` (backend): Starts Express server
- `npm run dev` (frontend/Admin): Starts Vite development server

---

## License
This project is licensed under the MIT License.
