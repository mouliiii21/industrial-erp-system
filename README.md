# Industrial ERP System

A full-stack Enterprise Resource Planning (ERP) system built using PostgreSQL, Express.js, React.js, and Node.js.

The system manages the complete sales workflow from customer enquiry to quotation, sales order, inventory reservation, and dispatch.

---

## 🚀 Project Workflow

Customer Enquiry  
↓  
Quotation  
↓  
Accepted Quotation  
↓  
Sales Order  
↓  
Inventory Reservation  
↓  
Dispatch

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Axios

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt
- Zod
- Knex.js

### Database
- PostgreSQL

### Testing
- Jest
- Supertest

---

## ✨ Features

- User authentication with JWT
- Password hashing using bcrypt
- Role-based access control
- Admin and Sales User roles
- Customer enquiry management
- Multi-item enquiries
- Quotation management
- Backend quotation total calculation
- Sales order creation from accepted quotations
- Inventory availability tracking
- Transaction-safe inventory reservation
- Dispatch management
- Automated backend tests
- React-based frontend

---

## 👥 User Roles

### ADMIN
- Access administrative operations
- Manage inventory-related operations
- Manage sales workflow

### SALES_USER
- Manage customer enquiries
- Create and manage quotations
- Work with sales orders according to permissions

---

## 🗄️ Database

The PostgreSQL database contains relational tables for:

- Users
- Customers
- Products
- Inventory
- Enquiries
- Quotations
- Sales Orders
- Dispatches

Foreign keys, unique constraints, and CHECK constraints are used to maintain data integrity.

---

## 📁 Project Structure

```text
industrial-erp-system/
│
├── client/                  # React frontend
│
├── server/                  # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── validation/
│   │   ├── db/
│   │   └── tests/
│   │
│   └── .env
│
├── .gitignore
└── README.md