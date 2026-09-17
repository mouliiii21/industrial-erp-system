Perfect. ✅ We now have all 6 route files.

One important correction before we write the docs: your actual role middleware uses `SALES`, not `SALES_USER`, based on the route files. So the API documentation should reflect the **actual implementation**.

Create this file at the project root:

```text
C:\ERP-Case-Study\API_DOCUMENTATION.md
```

Paste this entire content:

````markdown
# Industrial ERP System — API Documentation

## Base URL

```text
http://localhost:4000/api
````

All protected endpoints require a valid JWT access token.

### Authentication Header

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# 1. Authentication

## POST /auth/login

Authenticates a user and returns a JWT token.

### Authentication

Not required.

### Request Body

```json
{
  "email": "admin@erp.test",
  "password": "Admin@123"
}
```

### Example Response

```json
{
  "token": "<JWT_TOKEN>",
  "user": {
    "id": 1,
    "email": "admin@erp.test",
    "role": "ADMIN"
  }
}
```

### Seeded Users

| Role  | Email                                   | Password  |
| ----- | --------------------------------------- | --------- |
| ADMIN | [admin@erp.test](mailto:admin@erp.test) | Admin@123 |
| SALES | [sales@erp.test](mailto:sales@erp.test) | Sales@123 |

---

# 2. Products

## GET /products

Returns the available product master data.

### Authentication

Required.

### Authorization

Any authenticated user.

### Example Request

```http
GET /api/products
Authorization: Bearer <JWT_TOKEN>
```

### Example Response

```json
[
  {
    "id": 1,
    "productCode": "IND-A-001",
    "name": "Industrial Product A"
  }
]
```

---

# 3. Customer Enquiries

## GET /enquiries

Returns the list of customer enquiries.

### Authentication

Required.

### Authorization

Any authenticated user.

### Example Request

```http
GET /api/enquiries
Authorization: Bearer <JWT_TOKEN>
```

---

## GET /enquiries/:id

Returns a specific customer enquiry by ID.

### Authentication

Required.

### Authorization

Any authenticated user.

### Example Request

```http
GET /api/enquiries/1
Authorization: Bearer <JWT_TOKEN>
```

---

## POST /enquiries

Creates a new customer enquiry.

### Authentication

Required.

### Authorization

SALES role required.

### Request Body

The request must follow the `createEnquirySchema` validation rules defined in:

```text
server/src/validation/enquiry.schema.js
```

Example:

```json
{
  "customerId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 10
    }
  ]
}
```

### Example Request

```http
POST /api/enquiries
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

# 4. Quotations

## GET /quotations

Returns all quotations.

### Authentication

Required.

### Authorization

Any authenticated user.

---

## GET /quotations/:id

Returns a specific quotation.

### Authentication

Required.

### Authorization

Any authenticated user.

### Example Request

```http
GET /api/quotations/1
Authorization: Bearer <JWT_TOKEN>
```

---

## POST /quotations

Creates a quotation for an enquiry.

### Authentication

Required.

### Authorization

SALES role required.

### Validation

The request is validated using:

```text
server/src/validation/quotation.schema.js
```

The backend calculates and validates quotation totals rather than trusting a client-provided total.

### Example Request

```http
POST /api/quotations
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

Example body:

```json
{
  "enquiryId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 10,
      "unitPrice": 500
    }
  ]
}
```

---

## PATCH /quotations/:id/status

Updates the status of a quotation.

### Authentication

Required.

### Authorization

SALES role required.

### Validation

The request is validated using:

```text
server/src/validation/quotation.schema.js
```

### Example Request

```http
PATCH /api/quotations/1/status
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

Example body:

```json
{
  "status": "ACCEPTED"
}
```

Quotation status changes are used to control the quotation-to-sales-order workflow.

---

## POST /quotations/:id/convert

Converts an accepted quotation into a sales order.

### Authentication

Required.

### Authorization

SALES role required.

### Example Request

```http
POST /api/quotations/1/convert
Authorization: Bearer <JWT_TOKEN>
```

### Workflow

```text
Customer Enquiry
       ↓
Quotation
       ↓
Quotation ACCEPTED
       ↓
Convert
       ↓
Sales Order
```

The backend prevents duplicate sales orders from being created from the same quotation.

---

# 5. Sales Orders

## GET /sales-orders

Returns all sales orders.

### Authentication

Required.

### Authorization

Any authenticated user.

---

## GET /sales-orders/:id

Returns a specific sales order.

### Authentication

Required.

### Authorization

Any authenticated user.

---

## POST /sales-orders/:id/confirm

Confirms a sales order.

### Authentication

Required.

### Authorization

ADMIN role required.

### Example Request

```http
POST /api/sales-orders/1/confirm
Authorization: Bearer <JWT_TOKEN>
```

---

## POST /sales-orders/:id/dispatch

Dispatches items from a sales order.

### Authentication

Required.

### Authorization

ADMIN role required.

### Validation

The request is validated using:

```text
server/src/validation/salesOrder.schema.js
```

### Example Request

```http
POST /api/sales-orders/1/dispatch
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

Example body:

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 10
    }
  ]
}
```

### Inventory Effect

During dispatch:

```text
physical_qty  ↓
reserved_qty  ↓
```

The backend prevents dispatching more units than are currently reserved.

---

## POST /sales-orders/:id/cancel

Cancels a sales order.

### Authentication

Required.

### Authorization

ADMIN role required.

### Example Request

```http
POST /api/sales-orders/1/cancel
Authorization: Bearer <JWT_TOKEN>
```

When applicable, cancellation releases the inventory reservation.

---

# 6. Inventory

## GET /inventory

Returns current inventory availability.

### Authentication

Required.

### Authorization

Any authenticated user.

### Example Request

```http
GET /api/inventory
Authorization: Bearer <JWT_TOKEN>
```

### Example Response

```json
[
  {
    "productId": 1,
    "productCode": "IND-A-001",
    "productName": "Industrial Product A",
    "physicalQty": 500,
    "reservedQty": 60,
    "availableQty": 440
  }
]
```

### Availability Calculation

```text
Available Quantity = Physical Quantity - Reserved Quantity
```

---

## PATCH /inventory/:productId

Updates the physical inventory quantity for a product.

### Authentication

Required.

### Authorization

ADMIN role required.

### Request Body

```json
{
  "physicalQty": 550
}
```

### Example Request

```http
PATCH /api/inventory/1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Validation

* `physicalQty` must be a non-negative integer.
* Physical quantity cannot be reduced below the currently reserved quantity.
* The product must have an inventory record.

### Example Response

```json
{
  "productId": 1,
  "physicalQty": 550,
  "reservedQty": 60,
  "availableQty": 490
}
```

---

# 7. Authentication & Authorization Summary

| Endpoint                        | Auth | Role                   |
| ------------------------------- | ---- | ---------------------- |
| POST /auth/login                | No   | Public                 |
| GET /products                   | Yes  | Any authenticated user |
| GET /enquiries                  | Yes  | Any authenticated user |
| GET /enquiries/:id              | Yes  | Any authenticated user |
| POST /enquiries                 | Yes  | SALES                  |
| GET /quotations                 | Yes  | Any authenticated user |
| GET /quotations/:id             | Yes  | Any authenticated user |
| POST /quotations                | Yes  | SALES                  |
| PATCH /quotations/:id/status    | Yes  | SALES                  |
| POST /quotations/:id/convert    | Yes  | SALES                  |
| GET /sales-orders               | Yes  | Any authenticated user |
| GET /sales-orders/:id           | Yes  | Any authenticated user |
| POST /sales-orders/:id/confirm  | Yes  | ADMIN                  |
| POST /sales-orders/:id/dispatch | Yes  | ADMIN                  |
| POST /sales-orders/:id/cancel   | Yes  | ADMIN                  |
| GET /inventory                  | Yes  | Any authenticated user |
| PATCH /inventory/:productId     | Yes  | ADMIN                  |

---

# 8. HTTP Status Codes

The API uses standard HTTP status codes.

| Status | Meaning                                                   |
| ------ | --------------------------------------------------------- |
| 200    | Successful request                                        |
| 201    | Resource successfully created                             |
| 400    | Invalid request or validation failure                     |
| 401    | Authentication required or invalid token                  |
| 403    | Authenticated user does not have permission               |
| 404    | Requested resource not found                              |
| 409    | Business rule or conflict, such as insufficient inventory |
| 500    | Unexpected server error                                   |

---

# 9. Inventory Reservation & Concurrency

Inventory reservation is handled transactionally.

When stock is reserved, the backend performs a conditional database update that checks:

```text
physical_qty - reserved_qty >= requested_quantity
```

before increasing the reserved quantity.

This protects inventory from being over-reserved when multiple requests attempt to reserve the same stock simultaneously.

If one item in a multi-item transaction cannot be reserved, the transaction rolls back the earlier reservations from that operation.

---

# 10. Business Workflow

The complete ERP workflow is:

```text
Customer Enquiry
       ↓
Quotation
       ↓
Quotation Accepted
       ↓
Sales Order Created
       ↓
Sales Order Confirmed
       ↓
Inventory Reserved
       ↓
Dispatch
       ↓
Physical Stock Updated
```

Cancellation releases reserved inventory where applicable.

---

# 11. API Security

The backend implements:

* JWT-based authentication
* Password hashing using bcrypt
* Role-based authorization
* Request validation using Zod
* Protected API routes
* Database foreign-key constraints
* Database CHECK and UNIQUE constraints
* Transactional inventory operations
* Business-rule validation on the backend

---

# 12. Testing

The backend includes automated Jest tests covering:

* Authentication
* Role-based access control
* Enquiry and quotation workflows
* Sales order workflow
* Inventory reservation
* Dispatch
* Pricing/quotation calculations
* Inventory concurrency behavior

Run the test suite with:

```bash
npm test
```

Expected result:

```text
Test Suites: 2 passed, 2 total
Tests:       11 passed, 11 total
```

---

# 13. API Route Summary

```text
AUTH
POST   /api/auth/login

PRODUCTS
GET    /api/products

ENQUIRIES
GET    /api/enquiries
GET    /api/enquiries/:id
POST   /api/enquiries

QUOTATIONS
GET    /api/quotations
GET    /api/quotations/:id
POST   /api/quotations
PATCH  /api/quotations/:id/status
POST   /api/quotations/:id/convert

SALES ORDERS
GET    /api/sales-orders
GET    /api/sales-orders/:id
POST   /api/sales-orders/:id/confirm
POST   /api/sales-orders/:id/dispatch
POST   /api/sales-orders/:id/cancel

INVENTORY
GET    /api/inventory
PATCH  /api/inventory/:productId
```

---

## Notes

This document describes the implemented REST API for the Industrial ERP System.

The backend is built with Node.js, Express.js, Knex.js and PostgreSQL.

````

### After saving it

Run these commands from:

```text
C:\ERP-Case-Study
````
