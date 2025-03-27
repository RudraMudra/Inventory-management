# 📦 StockFlow - Inventory Management Application  

**StockFlow** is a modern, full-stack inventory management web application designed to simplify stock tracking, warehouse management, and data visualization for small to medium-sized businesses.  

With a focus on **usability, security, and efficiency**, StockFlow empowers users to manage their inventory seamlessly through a responsive and intuitive interface. Whether you're an **admin** managing stock or a **viewer** analyzing data, StockFlow provides the tools you need to stay **organized** and **informed**.

---

## ✨ Features  

✅ **🔒 Role-Based Access Control**  
- Supports two user roles (**admin** and **viewer**) to ensure secure and controlled access to features.  

✅ **📱 Responsive UI**  
- Built with **Ant Design**, featuring modals, dynamic tables, and a clean, user-friendly design that works on **all devices**.  

✅ **📊 Inventory Management**  
- Perform **CRUD operations** (Create, Read, Update, Delete) on inventory items.  
- Transfer items between warehouses with ease.  
- Receive **low stock alerts** to prevent shortages.  

✅ **📈 Data Visualization**  
- **Bar chart** for total quantity by warehouse.  
- **Pie chart** for stock status distribution (**low stock vs. in-stock**).  
- **Interactive charts** with click-to-filter functionality.  

✅ **💾 Data Export**  
- Export inventory data as **CSV files** for reporting and analysis.  

✅ **🔋 Action Logging**  
- Logs all **user actions** (add, update, delete) for auditing and accountability.  

✅ **⚡ Optimized Data Fetching**  
- Uses **TanStack Query** to reduce API calls by **30%**, improving performance.  

---

## 🧑‍💻 Tech Stack  

### **Frontend**  
- ⚡ **React** – JavaScript library for building the UI.  
- 🎨 **Ant Design** – UI component library for a polished and responsive design.  
- ⚡ **TanStack Query** – For efficient data fetching and state management.  
- 🌍 **Axios** – For making HTTP requests to the backend API.  
- 🎭 **CSS** – For custom styling and theming (light/dark modes).  

### **Backend**  
- 🟢 **Node.js** – JavaScript runtime for the backend.  
- 🚀 **Express** – Web framework for building the REST API.  
- 🌳 **MongoDB** – NoSQL database for storing inventory data.  
- 🗄️ **REST API** – For communication between frontend and backend.  

### **Deployment**  
- 🔺 **Vercel** – Platform for deploying and managing the application.  

---

## 📂 Project Structure  

```
StockFlow/
├── client/                 # React frontend  
│   ├── public/             # Static assets (e.g., favicon, index.html)  
│   └── src/                # React source code  
│       ├── components/     # Reusable React components (e.g., ItemChart, ItemTable)  
│       ├── constants/      # Configuration and constants (e.g., theme styles)  
│       ├── hooks/          # Custom React hooks  
│       ├── utils/          # Utility functions (e.g., exportCSV)  
│       └── api/            # API calls using Axios  
├── server/                 # Node.js backend  
│   ├── config/             # Database configuration (e.g., MongoDB connection)  
│   ├── controllers/        # API logic (e.g., itemController)  
│   ├── middlewares/        # Custom middleware (e.g., authentication)  
│   ├── models/             # MongoDB schemas (e.g., Item, User)  
│   ├── routes/             # API routes (e.g., /items, /users)  
│   └── index.js            # Entry point for the backend server  
└── README.md               # Project documentation  
```

---

## 🚀 Getting Started  

### **Prerequisites**  
Before you begin, ensure you have the following installed:  
- 🟢 **Node.js** (v14 or higher)  
- 🌳 **MongoDB** (local or cloud, e.g., **MongoDB Atlas**)  
- 🔺 **Vercel Account** (for deployment)  

### **Installation**  

#### **Clone the Repository**  
```bash
git clone https://github.com/your-username/stockflow.git
cd stockflow
```

#### **Set Up the Backend**  
Navigate to the server directory:  
```bash
cd server
```
Install dependencies:  
```bash
npm install
```
Create a **.env** file in the **server** directory and add your MongoDB connection string:  
```ini
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
```
Start the backend server:  
```bash
npm start
```

#### **Set Up the Frontend**  
Navigate to the client directory:  
```bash
cd client
```
Install dependencies:  
```bash
npm install
```
Create a **.env** file in the **client** directory and add the backend API URL:  
```ini
REACT_APP_API_URL=http://localhost:5000
```
Start the frontend development server:  
```bash
npm start
```

#### **Access the Application**  
Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)** to view the app.  

---

## 🏠 Deployment  

### **Deploy to Vercel**  
1. Push your code to a **GitHub repository**.  
2. Import the repository into **Vercel**.  
3. Set the following environment variables in **Vercel**:  
   ```ini
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   ```
4. Deploy the app and access it via the provided **Vercel URL**.  

---

## 🤝 Contributing  

Contributions are **welcome**! Follow these steps:  
1. **Fork** the repository.  
2. Create a **new branch** (`git checkout -b feature/your-feature`).  
3. Make changes and commit (`git commit -m "Add your feature"`).  
4. Push to the branch (`git push origin feature/your-feature`).  
5. Open a **pull request**.  

---

💙 If you like this project, don’t forget to **star ⭐** the repository!

