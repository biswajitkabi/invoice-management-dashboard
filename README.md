# Invoice Management Dashboard

A full-stack invoice management application built for Powerplay's SDE Internship Assignment.

## Tech Stack

- **Frontend**: React.js + TypeScript
- **Backend**: NestJS (Node.js)
- **Database**: MongoDB with Mongoose

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- MongoDB running locally on port 27017
- npm

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd invoice-dashboard
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
MONGODB_URI=mongodb://localhost:27017/invoice-dashboard
PORT=3001
```

### 3. Run the Seed Script

Make sure MongoDB is running, then:

```bash
npm run seed
```

- Expected output:
- Connecting to MongoDB...
- Dropping existing collections...
- Reading seed data...
- Seeding 61 customers...
- Seeding 2000 invoices...
- Seed complete!

### 4. Start the Backend

```bash
npm run start:dev
```

Backend runs at: `http://localhost:3001/api`

### 5. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## Run with Docker Compose

```bash
# From the root invoice-dashboard/ directory
docker-compose up --build
```

Seed the database after containers are up:

```bash
docker exec -it invoice_backend npm run seed
```

App available at `http://localhost:3000`

---

## API Reference

### Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices (paginated, filtered, sorted) |
| POST | `/api/invoices` | Create a new invoice |
| GET | `/api/invoices/:id` | Get a single invoice |
| PUT | `/api/invoices/:id` | Update an invoice |
| DELETE | `/api/invoices/:id` | Delete an invoice |

#### Query Parameters for `GET /api/invoices`

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20) |
| `search` | string | Search by invoice ID or customer name |
| `status` | string | Filter by status (Sent, Unpaid, Overdue, Paid, Void, Draft) |
| `customer` | string | Filter by customer name |
| `issueDateFrom` | string | Issue date range start (YYYY-MM-DD) |
| `issueDateTo` | string | Issue date range end (YYYY-MM-DD) |
| `dueDateFrom` | string | Due date range start (YYYY-MM-DD) |
| `dueDateTo` | string | Due date range end (YYYY-MM-DD) |
| `sortBy` | string | Field to sort by (amount, dueDate, issueDate, total) |
| `sortOrder` | string | `asc` or `desc` |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers |
| GET | `/api/customers/summary` | Global analytics + top 5 customers by value |
| GET | `/api/customers/:name/profile` | Customer profile with metrics and invoice history |

---

## Data Modeling Rationale

### Two Collections: `customers` and `invoices`

#### Customer Collection
```js
{
  name: String,     // unique identifier
  company: String   // 1:1 with customer
}
```

Customer is extracted into its own collection because:
- The **customer profile view** needs to aggregate metrics independently without scanning all invoices to find customer metadata
- The **create invoice form** needs to list all 61 customers and auto-fill their company — a dedicated collection makes this a simple `find()` query
- The **1:1 customer→company** relationship is a stable, first-class entity worth normalizing

#### Invoice Collection
```js
{
  invoiceId: String,       // unique, e.g. INV-6598015
  customerId: ObjectId,    // reference to Customer
  customer: String,        // denormalized for fast list queries
  company: String,         // denormalized for fast list queries
  amount: Number,
  taxRate: Number,         // enum: 0 | 3 | 5 | 18 | 28
  tax: Number,             // stored, not computed on read
  total: Number,           // stored, not computed on read
  status: String,          // enum: Sent | Unpaid | Overdue | Paid | Void | Draft
  issueDate: String,       // YYYY-MM-DD
  dueDate: String          // YYYY-MM-DD
}
```

**Why denormalize `customer` and `company` on Invoice?**
The invoice list view displays 2,000 records with customer names. Running a `$lookup` (JOIN) on every paginated query adds unnecessary latency. Storing the name directly on each invoice makes the most common operation (list + filter + sort) a single collection scan with no joins — a deliberate performance trade-off at the cost of slightly more storage.

**Why store `tax` and `total`?**
They are stored (not recomputed on read) to match the seed data contract and keep aggregation queries simple and accurate.

#### Indexes
Indexes are placed on all filterable and sortable fields:
- `status`, `dueDate`, `amount`, `issueDate`, `customer` — individual indexes
- Compound index on `{ status, dueDate }` for the most common combined filter pattern

---

## Features

- **Invoice List** — paginated (20/page), sortable by amount/due date/issue date, filterable by status/customer/date ranges, full-text search by invoice ID or customer name
- **Summary View** — global KPIs (total billed, total tax, invoice count, customer count) + top 5 customers with bar chart
- **Customer Profile** — company info, full invoice history, metrics (total billed, tax, outstanding, status breakdown)
- **Create Invoice** — modal form with customer dropdown, auto-filled company, computed tax and total
- **Edit Invoice** — pre-filled modal with all existing values
- **Delete Invoice** — with confirmation prompt

---

## Assumptions

- Customer names in the seed data are unique identifiers (61 unique customers confirmed)
- `tax` and `total` are always recomputed server-side on create/update to prevent client-side tampering
- Invoice IDs follow the `INV-XXXXXXX` format and are generated server-side on creation
- Currency is INR (₹) based on company names in the seed data.
- Outstanding amount is calculated as the sum of all invoices with status `Unpaid`, `Overdue`, or `Sent`