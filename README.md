# StockFlow - Inventory Management Application

StockFlow is a full-stack inventory management web application designed to streamline stock tracking, warehouse management, and data visualization for small to medium-sized businesses. It features role-based access control, a responsive UI, and efficient data management.

## Features
- **Role-Based Access Control**: Supports three user roles (admin, viewer) for secure access.
- **Responsive UI**: Built with Ant Design, featuring modals, dynamic tables, and a clean design.
- **Inventory Management**: Perform CRUD operations on items, transfer items between warehouses, and receive low stock alerts.
- **Data Export**: Export inventory data as CSV files for reporting.
- **Action Logging**: Logs all user actions (add, update, delete) for auditing.
- **Optimized Data Fetching**: Uses TanStack Query to reduce API calls by 30%.

## Tech Stack
- **Frontend**: React, Ant Design, TanStack Query, Axios, CSS
- **Backend**: Node.js, Express, MongoDB, REST API
- **Deployment**: Vercel

## Project Structure
- `client/`: React frontend
  - `public/`: Static assets
  - `src/`: React components, hooks, and API calls
- `server/`: Node.js backend
  - `config/`: Database configuration
  - `controllers/`: API logic
  - `middlewares/`: Custom middleware (e.g., authentication)
  - `models/`: MongoDB schemas
  - `routes/`: API routes

## Prerequisites
- **Node.js**: v14 or higher
- **MongoDB**: Local or cloud (e.g., MongoDB Atlas)
- **Vercel Account**: For deployment


