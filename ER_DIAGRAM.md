
# Industrial ERP System — ER Diagram

The database is designed using PostgreSQL with normalized relational tables and foreign-key relationships.

## Entity Relationship Diagram

```mermaid
erDiagram

    USERS {
        int id PK
        varchar email UK
        varchar password_hash
        varchar role
        timestamp created_at
    }

    CUSTOMERS {
        int id PK
        varchar name
        varchar email
        varchar phone
        text address
        timestamp created_at
    }

    PRODUCTS {
        int id PK
        varchar product_code UK
        varchar name
        numeric unit_price
        timestamp created_at
    }

    INVENTORY {
        int product_id PK, FK
        int physical_qty
        int reserved_qty
        timestamp updated_at
    }

    ENQUIRIES {
        int id PK
        int customer_id FK
        varchar status
        timestamp created_at
    }

    ENQUIRY_ITEMS {
        int id PK
        int enquiry_id FK
        int product_id FK
        int quantity
    }

    QUOTATIONS {
        int id PK
        int enquiry_id FK
        varchar status
        numeric subtotal
        numeric tax
        numeric total
        timestamp created_at
    }

    QUOTATION_ITEMS {
        int id PK
        int quotation_id FK
        int product_id FK
        int quantity
        numeric unit_price
        numeric line_total
    }

    SALES_ORDERS {
        int id PK
        int quotation_id FK
        varchar status
        numeric total
        timestamp created_at
    }

    SALES_ORDER_ITEMS {
        int id PK
        int sales_order_id FK
        int product_id FK
        int quantity
        numeric unit_price
    }

    DISPATCHES {
        int id PK
        int sales_order_id FK
        varchar status
        timestamp dispatched_at
    }

    DISPATCH_ITEMS {
        int id PK
        int dispatch_id FK
        int product_id FK
        int quantity
    }

    CUSTOMERS ||--o{ ENQUIRIES : creates

    ENQUIRIES ||--|{ ENQUIRY_ITEMS : contains

    PRODUCTS ||--o{ ENQUIRY_ITEMS : requested_in

    PRODUCTS ||--|| INVENTORY : has

    ENQUIRIES ||--o{ QUOTATIONS : generates

    QUOTATIONS ||--|{ QUOTATION_ITEMS : contains

    PRODUCTS ||--o{ QUOTATION_ITEMS : quoted_as

    QUOTATIONS ||--o| SALES_ORDERS : converts_to

    SALES_ORDERS ||--|{ SALES_ORDER_ITEMS : contains

    PRODUCTS ||--o{ SALES_ORDER_ITEMS : ordered_as

    SALES_ORDERS ||--o{ DISPATCHES : has

    DISPATCHES ||--|{ DISPATCH_ITEMS : contains

    PRODUCTS ||--o{ DISPATCH_ITEMS : dispatched_as
````

## Relationship Overview

### Customer → Enquiry

A customer can create multiple enquiries.

```text
CUSTOMERS 1 ──── N ENQUIRIES
```

Each enquiry belongs to one customer.

### Enquiry → Enquiry Items

An enquiry can contain multiple products.

```text
ENQUIRIES 1 ──── N ENQUIRY_ITEMS
```

Each enquiry item represents a requested product and quantity.

### Product → Inventory

Each product has one inventory record.

```text
PRODUCTS 1 ──── 1 INVENTORY
```

Inventory tracks:

* Physical quantity
* Reserved quantity
* Available quantity

Available quantity is calculated as:

```text
Available = Physical Quantity - Reserved Quantity
```

### Enquiry → Quotation

An enquiry can generate quotations.

```text
ENQUIRIES 1 ──── N QUOTATIONS
```

A quotation contains one or more quotation items.

### Quotation → Sales Order

An accepted quotation can be converted into a sales order.

```text
QUOTATIONS 1 ──── 0..1 SALES_ORDERS
```

The database/business logic prevents duplicate sales orders from being created from the same quotation.

### Sales Order → Sales Order Items

A sales order contains one or more products.

```text
SALES_ORDERS 1 ──── N SALES_ORDER_ITEMS
```

### Sales Order → Dispatch

A sales order can have dispatch records.

```text
SALES_ORDERS 1 ──── N DISPATCHES
```

Each dispatch contains one or more dispatch items.

### Product Relationships

Products can appear in:

* Enquiry items
* Quotation items
* Sales order items
* Dispatch items
* Inventory

This provides a consistent product master across the complete ERP workflow.

---

## Complete Business Flow

```text
Customer
   │
   ▼
Enquiry
   │
   ▼
Enquiry Items
   │
   ▼
Quotation
   │
   ▼
Quotation Items
   │
   ▼
Accepted Quotation
   │
   ▼
Sales Order
   │
   ▼
Sales Order Items
   │
   ▼
Inventory Reservation
   │
   ▼
Dispatch
   │
   ▼
Dispatch Items
   │
   ▼
Inventory Updated
```

## Database Design Principles

The schema uses:

* Primary keys for unique entity identification
* Foreign keys for referential integrity
* Unique constraints for fields such as product codes and user emails
* CHECK constraints for valid quantities and statuses
* Normalized item tables for one-to-many product relationships
* Transactional operations for inventory reservation and dispatch
* PostgreSQL relational database design

The database structure supports the complete workflow:

**Customer Enquiry → Quotation → Sales Order → Inventory Reservation → Dispatch**

````

