
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

### Authentication & Authorization

- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control
- ADMIN and SALES_USER roles
- Protected backend routes

### Customer Enquiries

- Create and manage customer enquiries
- Support for multiple enquiry items
- Customer and product relationships

### Quotations

- Create quotations from enquiries
- Multiple quotation items
- Backend-side quotation total calculation
- Quotation status management
- Prevents client-side manipulation of quotation totals
- Accepted quotations can be converted into sales orders

### Sales Orders

- Create sales orders from accepted quotations
- Prevent duplicate sales orders for the same quotation
- Order status management
- Order cancellation support

### Inventory

- Track physical, reserved, and available stock
- Available stock is calculated as:

  `Available Quantity = Physical Quantity - Reserved Quantity`

- ADMIN users can update physical inventory
- Inventory reservation is transaction-safe
- Concurrent stock reservations are handled safely
- Prevents reservation when sufficient stock is unavailable

### Dispatch

- Dispatch reserved inventory
- Updates physical and reserved quantities transactionally
- Prevents dispatching more stock than reserved
- Supports inventory release when an order is cancelled

### Frontend

- React-based user interface
- JWT-authenticated API communication
- Role-aware navigation
- Inventory management interface
- Responsive SaaS-style UI

---

## 👥 User Roles

### ADMIN

- Access the sales workflow
- View inventory
- Update physical inventory quantities
- Perform administrative inventory operations

### SALES_USER

- Manage customer enquiries
- Create and manage quotations
- Work with sales orders according to assigned permissions
- View inventory availability

All authorization checks are enforced on the backend.

---

## 🗄️ Database Design

The PostgreSQL database uses a relational schema with foreign keys, unique constraints, and CHECK constraints for data integrity.

### Main Entities

- Users
- Customers
- Products
- Inventory
- Enquiries
- Enquiry Items
- Quotations
- Quotation Items
- Sales Orders
- Sales Order Items
- Dispatches
- Dispatch Items

The relationships between these entities represent the complete business workflow from enquiry through dispatch.

See [ER_DIAGRAM.md](ER_DIAGRAM.md) for the database relationship diagram.

---

## 📁 Project Structure

```text
industrial-erp-system/
│
├── client/                         # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── api/
│
├── server/                         # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── validation/
│   │   ├── db/
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   └── tests/
│   │
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── API_DOCUMENTATION.md
├── ER_DIAGRAM.md
└── README.md
````

> The actual `.env` file is not committed to GitHub. Use `.env.example` as a template.

---

## ⚙️ Prerequisites

Make sure the following are installed:

* Node.js
* npm
* PostgreSQL

Recommended PostgreSQL version: PostgreSQL 16+

---

## 🔧 Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd industrial-erp-system
```

### 1. Install backend dependencies

```bash
cd server
npm install
```

### 2. Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

---

## 🔐 Environment Variables

Inside the `server` directory, create a `.env` file.

Example:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/erp_case_study?schema=public"

JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="8h"

PORT=4000

TEST_DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/erp_case_study_test?schema=public"
```

Replace `YOUR_PASSWORD` with the PostgreSQL password configured on your system.

Do not commit `.env` to GitHub.

---

## 🗃️ Database Setup

Create two PostgreSQL databases:

```text
erp_case_study
erp_case_study_test
```

From the `server` directory, run:

### Run migrations

```bash
npm run migrate
```

### Seed the development database

```bash
npm run seed
```

### Prepare the test database

```bash
npx cross-env NODE_ENV=test knex migrate:latest
```

---

## ▶️ Running the Application

### Start the backend

From the `server` directory:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:4000
```

### Start the frontend

From the `client` directory:

```bash
npm run dev
```

The frontend is available through the Vite development server, usually at:

```text
http://localhost:5173
```

---

## 🔑 Seeded Test Users

The seed script creates the following users.

### ADMIN

```text
Email: admin@erp.test
Password: Admin@123
Role: ADMIN
```

### SALES_USER

```text
Email: sales@erp.test
Password: Sales@123
Role: SALES_USER
```

These credentials are intended for local testing and demonstration.

---

## 🔄 Business Workflow

### 1. Customer Enquiry

A sales user creates an enquiry for a customer with one or more products.

### 2. Quotation

A quotation is created based on the enquiry items.

The quotation total is calculated and validated on the backend rather than being trusted from the frontend.

### 3. Accept Quotation

Once the quotation is accepted, it can be converted into a sales order.

Duplicate sales orders for the same quotation are prevented.

### 4. Inventory Reservation

When the sales order is processed, required inventory is reserved.

The available quantity is calculated using:

```text
Available = Physical - Reserved
```

Inventory reservation is performed transactionally to prevent overselling when simultaneous requests attempt to reserve the same stock.

### 5. Dispatch

Reserved stock can be dispatched.

During dispatch:

```text
Physical Quantity -= Dispatched Quantity
Reserved Quantity -= Dispatched Quantity
```

### 6. Cancellation

When applicable, cancelling an order releases its reserved inventory.

---

## 🔌 API Overview

The backend exposes REST APIs for authentication, products, inventory, enquiries, quotations, and sales orders.

### Authentication

```text
POST /api/auth/login
```

### Products

```text
GET /api/products
```

### Inventory

```text
GET   /api/inventory
PATCH /api/inventory/:productId
```

The inventory update endpoint is restricted to ADMIN users.

### Enquiries

```text
GET  /api/enquiries
POST /api/enquiries
```

### Quotations

```text
GET  /api/quotations
POST /api/quotations
```

### Sales Orders

```text
GET  /api/sales-orders
POST /api/sales-orders
```

For request bodies, authentication requirements, status transitions, and additional endpoints, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

---

## 🔒 Security & Data Integrity

The application implements several security and data integrity measures:

* JWT authentication
* Password hashing using bcrypt
* Backend role-based authorization
* Request validation using Zod
* Parameterized database queries through Knex.js
* PostgreSQL foreign keys
* Unique constraints
* CHECK constraints
* Transaction-based business operations
* Protected inventory reservation logic
* Backend calculation of quotation totals

---

## 🧪 Testing

The backend includes automated tests using Jest and Supertest.

Run the complete test suite:

```bash
npm test
```

The test suite covers important business functionality including:

* Authentication
* Role-based authorization
* Enquiry workflow
* Quotation calculation and validation
* Sales order creation
* Inventory reservation
* Dispatch
* Inventory-related business rules
* Concurrent inventory reservation

The final test suite currently contains **11 passing tests**.

---

## 🏗️ Technical Decisions

### Backend-calculated quotation totals

Quotation totals are calculated on the backend to prevent clients from manipulating the final amount.

### Transaction-safe inventory reservation

Inventory reservation uses conditional database updates inside transactions.

The reservation succeeds only when sufficient available stock exists:

```text
Physical Quantity - Reserved Quantity >= Requested Quantity
```

This prevents stock from being oversold when multiple requests attempt to reserve the same product simultaneously.

### Relational database design

The system uses normalized relational tables with foreign keys and constraints to maintain consistency between customers, products, enquiries, quotations, sales orders, and inventory.

### Backend RBAC

Role checks are implemented on the backend rather than relying only on frontend visibility. This prevents unauthorized users from directly calling protected APIs.

---

## 📊 Testing & Validation

The application was tested against a PostgreSQL test database using the automated Jest/Supertest test suite.

The final test run verifies the main ERP workflow and inventory business rules.

```text
Test Suites: 2 passed
Tests:       11 passed
```

---

## 🚀 Future Improvements

Possible future improvements include:

* Product master management UI
* Customer management UI
* Advanced search and filtering
* Pagination for large datasets
* Reporting and analytics dashboard
* PDF quotation generation
* Email notifications
* Production deployment
* More extensive frontend tests

---

## 🎥 Demo

The demonstration covers:

1. User login
2. Customer enquiry creation
3. Quotation creation
4. Quotation acceptance
5. Sales order creation
6. Inventory reservation
7. Inventory availability
8. Dispatch
9. Inventory update
10. ADMIN vs SALES_USER access control

---

## 👩‍💻 Author

**Mouli Jain**

Full-Stack / AI Software Development Enthusiast

```
