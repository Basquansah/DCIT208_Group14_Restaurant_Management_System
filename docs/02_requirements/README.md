# 02 Software Requirements Specification

Deliverable D2: Software Requirements Specification (SRS)
Course: DCIT 208 – Software Engineering
Deliverable ID: D2
Team Name: Group 14
Project Title: Restaurant Management System
Client: Local Traditional Ghanaian Restaurant Owner
Repository URL: https://github.com/Basquansah/DCIT208_Group14_Restaurant_Management_System
Primary Contact: Abraham Tetteh (atetteh343@st.ug.edu.gh)
1. Introduction
1.1 Purpose
This Software Requirements Specification (SRS) document details the complete functional and non-functional requirements for the Restaurant Management System. It establishes the technical baseline for architecture design, database schema implementation, unit testing, and acceptance verification.
1.2 System Scope
The Restaurant Management System is a responsive web application designed to digitize manual operations for a traditional Ghanaian restaurant. The system automates menu management, remote customer ordering with dynamic delivery fee calculations, point-of-sale (POS) order processing, kitchen display state transitions, ingredient inventory tracking, payment logging (Cash and Mobile Money), and staff attendance tracking.
2. Overall Description
2.1 System Actors
1.	Owner / Administrator:
o	High-privilege actor responsible for managing menu items, setting prices, monitoring stock balances, configuring delivery fee parameters, viewing sales reports, and overseeing employee attendance.
2.	Kitchen / POS Staff:
o	Operations actor responsible for taking walk-in orders, viewing incoming remote orders, updating meal preparation statuses, logging stock consumption, and clocking in/out for shifts.
3.	Customer (Dine-in, Takeaway, Remote):
o	End-user actor who browses menu offerings, customizes meal selections, chooses fulfillment mode (Pickup vs. Delivery), views distance-based fee calculations, and tracks order progress.
2.2 Product Perspective
The platform operates as a standalone multi-tenant web application accessible across mobile, tablet, and desktop devices via modern web browsers.
3. Functional Requirements (FRs)
FR1: Menu & Catalog Management
•	FR1.1: The system shall display menu items categorized into Staples (e.g., Banku, Jollof, Waakye, Fufu), Proteins (e.g., Fish, Chicken, Goat, Gizzard), and Stews/Soups.
•	FR1.2: The system shall allow the Owner to create, update, disable, or delete menu items, prices, and descriptions.
•	FR1.3: The system shall dynamically reflect item availability based on active stock levels or manual toggles set by staff.
FR2: Order Placement & Fulfillment Selection
•	FR2.1: The system shall allow customers to assemble custom orders with selectable proteins and soups.
•	FR2.2: The system shall allow customers to choose between two fulfillment methods: PICKUP (Self-Pickup) or DELIVERY (Home/Office Delivery).
•	FR2.3: The system shall require customers selecting DELIVERY to provide a valid delivery address and estimated distance in kilometers.
FR3: Dynamic Delivery Fee Calculation Engine
•	FR3.1: If fulfillment is set to PICKUP, the delivery fee shall be set to exactly GHc0.00.
•	FR3.2: If fulfillment is set to DELIVERY, the system shall automatically calculate the delivery fee using the formula:
DeliveryFee = BaseFee + (DistanceInKm \times PerKmRate)
•	FR3.3: The system shall display an itemized breakdown before checkout showing Food Subtotal, Calculated Delivery Fee, and Total Amount Payable.
FR4: Point of Sale (POS) & Kitchen Display Queue
•	FR4.1: The system shall provide staff with an intuitive POS interface to input in-person walk-in orders.
•	FR4.2: The system shall display a real-time kitchen queue organizing orders chronologically.
•	FR4.3: The system shall allow kitchen staff to transition order statuses through four states: PENDING -> PREPARING -> READY -> COMPLETED.
FR5: Inventory & Stock Tracking
•	FR5.1: The system shall maintain real-time quantities for key raw ingredients in kitchen stock.
•	FR5.2: The system shall automatically decrement ingredient stock balances when an order moves to the PREPARING state.
•	FR5.3: The system shall trigger low-stock alerts on the Owner dashboard when ingredient balances fall below defined minimum threshold limits.
FR6: Payment Recording
•	FR6.1: The system shall record payment method modes (CASH or MOMO).
•	FR6.2: The system shall track payment status states (PENDING, PAID, FAILED) and generate printable or digital transaction receipts.
FR7: Staff Attendance Logging
•	FR7.1: The system shall allow staff members to record daily clock-in and clock-out timestamps for shift monitoring.
4. Non-Functional Requirements (NFRs)
NFR1: Usability & Accessibility
•	NFR1.1: The POS and Kitchen Display interface shall feature high-contrast, large touch elements optimized for tablet and mobile devices operated in fast-paced kitchen environments.
•	NFR1.2: The customer ordering UI shall comply with WCAG 2.1 Level AA accessibility standards for color contrast and font legibility.
NFR2: Performance & Response Time
•	NFR2.1: API endpoints for delivery fee calculations and menu catalog fetching shall respond within less than 1.5 seconds under normal load.
•	NFR2.2: Page load times across customer-facing screens shall not exceed 2.0 seconds on standard 3G/4G mobile networks.
NFR3: Reliability & Data Integrity
•	NFR3.1: The system shall execute database stock decrements inside atomic SQL transactions to prevent race conditions during concurrent orders.
•	NFR3.2: The system shall achieve 99.5% operational uptime during active business hours (2:00 AM to 6:00 PM GMT).
NFR4: Security & Access Control
•	NFR4.1: The system shall enforce Role-Based Access Control (RBAC), restricting administrative menu modification and financial reporting strictly to authenticated OWNER accounts.
•	NFR4.2: All communication between web clients and the backend API shall be encrypted using HTTPS (TLS 1.3).
•	NFR4.3: User authentication credentials shall be protected using bcrypt password hashing.
5. Use Case Specifications
Use Case UC-01: Place Remote Order with Delivery Calculation
•	Primary Actor: Customer
•	Preconditions: Customer accesses web portal via browser; menu items are available.
•	Main Success Scenario:
1.	Customer browses menu categories and adds items to shopping cart.
2.	Customer proceeds to checkout and selects DELIVERY fulfillment.
3.	Customer enters delivery address and distance (5.0km).
4.	System executes FR3 calculation engine (Base GHS10.00 + (5 x GHS 3.50) = GHS 27.50).
5.	System displays itemized pricing breakdown.
6.	Customer selects Mobile Money payment mode and places order.
7.	System sets order status to PENDING and pushes order to Kitchen Display queue.
•	Extensions:
1.	3a. Customer selects PICKUP: System sets delivery fee to GHS 0.00 and prompts for estimated pickup time.
Use Case UC-02: Process Kitchen Order Status Update
•	Primary Actor: Kitchen Staff
•	Preconditions: Active orders exist in the kitchen display queue.
•	Main Success Scenario:
1.	Kitchen staff member views order card in PENDING column.
2.	Staff member clicks "Start Preparing".
3.	System updates order status to PREPARING and decrements associated ingredient stock in PostgreSQL database.
4.	Upon food completion, staff member clicks "Mark Ready".
5.	System updates order status to READY and notifies customer tracking screen.
6. User Stories with Acceptance Criteria
User Story US-01: Distance-Based Delivery Calculation
As a remote customer,
I want my delivery fee calculated automatically based on my distance,
So that I receive a transparent, accurate order total before confirming payment.
•	Acceptance Criteria (Given/When/Then):
o	Scenario 1: Home Delivery Selected
	Given I have items worth GHC50.00 in my cart,
	When I select "Delivery" and input a distance of 4km
	Then the system should display a delivery fee of GHC24.00 (10.00 + (4 x 3.50) and a total bill of GHC74.00.
o	Scenario 2: Self-Pickup Selected
	Given I have items in my cart,
	When I select "Self-Pickup",
	Then the system should display a delivery fee of exactly GHC0.00.
User Story US-02: Kitchen Queue State Management
As a kitchen staff member,
I want to move orders through preparation stages on a touch screen display,
So that meals are prepared in correct order sequence without paper ticket loss.
•	Acceptance Criteria (Given/When/Then):
o	Given an order appears in the PENDING column,
o	When I tap the "Start Order" button,
o	Then the order status must update to PREPARING, the card must move to the active column, and ingredient stock must automatically decrement.
User Story US-03: Low Stock Alert Warning
As a restaurant owner,
I want to receive low-stock alerts on my dashboard,
So that I know which ingredients to procure during 3:00 AM market trips.
•	Acceptance Criteria (Given/When/Then):
o	Given the minimum stock threshold for "Vegetable Oil" is set to 10Liters
o	When automated order decrements reduce current stock to 8.5Liters
o	Then a prominent warning badge must appear on the owner dashboard highlighting "Vegetable Oil - Low Stock"

