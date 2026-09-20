# 04 Architecture and CI/CD Baseline

Deliverable D4: Architecture, CI/CD Baseline & Mid-Sem Architecture Defense
Course: DCIT 208 – Software Engineering
Deliverable ID: D4
Team Name: Group 14
Project Title: Restaurant Management System (Sarah's Tasty Foods)
Client: Local Traditional Ghanaian Restaurant Owner
Repository URL: https://github.com/Basquansah/DCIT208_Group14_Restaurant_Management_System
[cite: ]
Target Release Tag: v0.0-baseline
[cite: ]
Primary Contact: Abraham Tetteh (atetteh343@st.ug.edu.gh)
1. System Architecture Overview
The Restaurant Management System for Sarah's Tasty Foods is designed as a modern, decoupled web application. The frontend user interface, API backend endpoints, and relational database layer are architected to support high-throughput, concurrent ordering during peak breakfast and lunch rush hours.
1.1 C4 Architecture Model
Level 1: System Context
•	External Actors:
o	Customers: Access the application via mobile/desktop web browsers to view menus, assemble orders, calculate delivery fees, and track order fulfillment states.
o	Kitchen / Front-Desk Staff: Interact with touch POS screens to log walk-in orders and update cooking lifecycle queues (PENDING -> PREPARING -> READY -> COMPLETED).
o	Restaurant Owner: Accesses administrative dashboards to manage menu pricing, view stock thresholds, inspect revenue logs, and track staff attendance.
•	System Boundary: Sarah's Tasty Foods Application Platform (handles auth, menu cataloging, dynamic pricing, kitchen queue state, stock management, and sales reporting).
Level 2: Container Architecture
1.	Frontend Web Container (Next.js 14 / React 18 / Tailwind CSS): Renders responsive views for customers, staff, and management.
2.	Backend API Container (Next.js App Router API Routes / Node.js): Executes business logic, handles RBAC authentication, processes order creation, calculates dynamic delivery fees, and updates ingredient stock.
3.	Database Container (PostgreSQL via Supabase / Render): Stores relational entities enforcing strict foreign key constraints and atomic SQL isolation levels.
2. Relational Database Schema Specification
The underlying database structure is built on PostgreSQL, enforcing data integrity across user accounts, menu items, orders, payment transactions, ingredients, and staff clock-in logs.
SQL
-- Core System Roles and Enums
CREATE TYPE user_role AS ENUM ('OWNER', 'STAFF', 'CUSTOMER');
CREATE TYPE order_status AS ENUM ('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED');
CREATE TYPE fulfillment_type AS ENUM ('PICKUP', 'DELIVERY');
CREATE TYPE payment_mode AS ENUM ('CASH', 'MOMO');

-- User Accounts Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Menu Items Table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Raw Ingredient Stock Table
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    unit VARCHAR(50) NOT NULL,
    current_stock DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (current_stock >= 0),
    minimum_threshold DECIMAL(10, 2) NOT NULL DEFAULT 10.00
);

-- Customer & Walk-In Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number SERIAL UNIQUE,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    fulfillment fulfillment_type NOT NULL,
    status order_status NOT NULL DEFAULT 'PENDING',
    distance_km DECIMAL(6, 2) DEFAULT 0.00,
    food_subtotal DECIMAL(10, 2) NOT NULL CHECK (food_subtotal >= 0),
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Junction Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0)
);

-- Payment Transactions Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    method payment_mode NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
3. Architectural Decision Records (ADRs)
ADR-01: Adoption of Responsive Web Application over Native Mobile App
•	Status: Approved
•	Context: The system must serve remote customers placing food orders, kitchen staff tracking cooking queues, and the restaurant owner monitoring analytics.
•	Decision: Build a single, unified Responsive Multi-Tenant Web Application using Next.js and Tailwind CSS instead of separate native mobile apps (Android/iOS).
•	Consequences:
o	Eliminates app store download friction for remote customers.
o	Ensures uniform responsiveness across desktop POS touch screens, tablets, and mobile phones.
o	Dramatically simplifies automated CI build and test execution within GitHub Actions runners.
ADR-02: Utilization of PostgreSQL Relational Database
•	Status: Approved
•	Context: The system handles financial transactions, inventory decrements, and order updates that require strict consistency and race condition protection.
•	Decision: Utilize PostgreSQL with ACID-compliant relational schema constraints instead of NoSQL document stores.
•	Consequences: Guarantees atomic updates when multiple orders decrement ingredient inventory concurrently during peak rush hours.
ADR-03: Dynamic Distance Delivery Calculation Architecture
•	Status: Approved
•	Context: The client requires distance-based delivery fee calculations for remote orders without maintaining an expensive third-party driver dispatch fleet.
•	Decision: Implement a modular calculation utility engine (calculateOrderPricing) on the API backend utilizing standard distance parameters.
•	Consequences: Allows the restaurant to remain courier-agnostic while presenting customers with transparent, automated receipts prior to order confirmation.
4. API Specification Contracts
Endpoint Route	HTTP Method	Access Role	Description
/api/menu	GET	Public	Fetches active menu categories and item offerings.
/api/menu	POST	OWNER	Creates a new menu item with pricing.
/api/delivery/calculate	POST	Public	Computes delivery fee based on fulfillment type and distance.
/api/orders	POST	Public / Staff	Submits new customer or walk-in POS order.
/api/orders/queue	GET	STAFF / OWNER	Fetches active kitchen order queue grouped by status.
/api/orders/[id]/status	PATCH	STAFF / OWNER	Transitions order status (PENDING -> PREPARING -> READY).
/api/inventory	GET	OWNER	Returns ingredient stock balances and low-stock alert flags.
5. CI/CD Baseline & Makefile Verification
The repository enforces standardized build automation through the root Makefile contract, which is validated on every pull request via GitHub Actions (.github/workflows/ci.yml):
•	make setup: Installs all required framework dependencies (npm install).
•	make lint: Executes static code analysis and formatting checks (eslint).
•	make test: Runs automated unit test suites covering business rules.
•	make run: Boots the local development environment (npm run dev).
•	make build: Compiles production web binaries (npm run build).

