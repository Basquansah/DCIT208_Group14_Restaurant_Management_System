# 03 Product Backlog and UX Designs

Deliverable D3: Product Backlog, UX Prototype & Sprint 1 Plan
Course: DCIT 208 – Software Engineering
Deliverable ID: D3
Team Name: Group 14
Project Title: Restaurant Management System
Client: Sarah’s Tasty Foods
Repository URL: https://github.com/Basquansah/DCIT208_Group14_Restaurant_Management_System
Primary Contact: Abraham Tetteh (atetteh343@st.ug.edu.gh)
1. Product Backlog & Story Point Estimations
Items on the product backlog are estimated using the standard Fibonacci story point scale (1, 2, 3, 5, 8). Any user story exceeding 8points is decomposed into smaller atomic sub-tasks.
Backlog ID	Priority	User Story Title	Story Points	Target Milestone	Status
US-01	High	Customer Menu Browsing & Filtering	3	Sprint 1 (D5)	Ready
US-02	High	Dynamic Distance Delivery Fee Engine	5	Sprint 1 (D5)	Ready
US-03	High	Customer Cart Assembly & Checkout Portal	5	Sprint 1 (D5)	Ready
US-04	High	Walk-In Order POS Entry Interface	5	Sprint 1 (D5)	Ready
US-05	High	Kitchen Display Queue & Order Status Updates	5	Sprint 2 (D6)	Backlog
US-06	Medium	Automated Ingredient Stock Decrementing	5	Sprint 2 (D6)	Backlog
US-07	Medium	Owner Low-Stock Alert Notifications	3	Sprint 2 (D6)	Backlog
US-08	Medium	Cash and Mobile Money Payment Logging	3	Sprint 3 (D7)	Backlog
US-09	Low	Owner Daily Sales & Revenue Analytics	5	Sprint 3 (D7)	Backlog
US-10	Low	Kitchen Staff Clock-In / Clock-Out Logging	3	Sprint 3 (D7)	Backlog
Total Estimated Backlog Velocity: 42 Story Points
2. User Experience (UX) Wireframe Specifications
The user interface is designed following mobile-first responsive guidelines and WCAG 2.1 AA accessibility standards, focusing on low cognitive load for kitchen staff operating during fast-paced rush hours.
2.1 Interface View 1: Customer Remote Ordering Portal
•	Layout Structure: Header with brand identifier and sticky shopping cart counter; main section featuring sticky filter chips for menu categories (Staples, Proteins, Soups/Stews); grid card display for menu items.
•	Key Interaction Elements:
o	Food Item Cards: Image container, item title, price display in GHS, plus/minus quantity adjusters, and an "Add to Cart" button.
o	Checkout Drawer: Modal sliding in from the right containing order summaries, a fulfillment selection toggle (Self-Pickup vs Delivery), a dynamic distance slider/input field, and an itemized price breakdown (Subtotal + Delivery Fee = Total Amount).
 
2.2 Interface View 2: Point-of-Sale (POS) & Kitchen Display Board
•	Layout Structure: Dual-pane layout optimized for wide tablet screens and desktop monitors.
•	Key Interaction Elements:
o	Left Pane (POS Quick Order Entry): Grid buttons representing high-frequency menu items for rapid touch entry by front-counter staff.
o	Right Pane (Kitchen Queue Board): Four distinct vertical columns representing order lifecycle states:
1.	PENDING: Yellow card header, elapsed time counter, item checklist.
2.	PREPARING: Blue card header, active cooking timer, "Mark Ready" primary action button.
3.	READY: Green card header, pickup notification status, "Complete Order" button.
4.	COMPLETED: Grayed historic log entries.
 
2.3 Interface View 3: Owner Administrative Dashboard
•	Layout Structure: Top metric summary cards coupled with side-by-side data tables for inventory balances and sales breakdown.
•	Key Interaction Elements:
o	Summary Stat Cards: Daily Gross Revenue, Total Orders Served, Cash vs. MoMo Breakdown.
o	Inventory Alert Table: List of critical raw ingredients with visual stock level indicators (Green = Adequate, Amber = Reorder Soon, Red = Critical Alert below threshold).
 
3. Engineering Quality Definitions
3.1 Definition of Ready (DoR)
A backlog user story is classified as Ready for sprint assignment only when all of the following conditions are met:
1.	The story is structured in standard format: As a... I want... So that...
2.	Clear, unambiguous Given/When/Then acceptance criteria are documented.
3.	Story points have been estimated and agreed upon (must be 8points).
4.	Dependencies on database schemas or third-party APIs are identified.
5.	Target UI wireframe sketches are finalized.
3.2 Definition of Done (DoD)
A user story is marked Done and closed on the project board only when:
1.	The feature code is implemented according to specifications and passes local execution checks.
2.	Automated unit test cases are written, covering both normal path and edge case scenarios.
3.	Code passes static analysis and linting without errors (npm run lint).
4.	A pull request (PR) is merged into the main branch after passing GitHub Actions CI pipeline checks.
5.	The working feature is verified against the recorded acceptance criteria.
4. Sprint 1 Execution Plan (Target: Deliverable D5)
Sprint 1 Duration: 1 Cycle
Sprint Goal: Build the foundation of the web application, including menu display, customer checkout with automated dynamic delivery fee calculation, and basic POS walk-in order creation.
Assigned Task	User Story	Target Component / API Route	Story Points	Task Owner
TSK-01	US-01	Setup Next.js App Router and render Menu Catalog UI	3	Abraham Tetteh
TSK-02	US-02	Implement dynamic delivery calculation function (calculateOrderPricing)	5	Abraham Tetteh
TSK-03	US-03	Construct shopping cart state and checkout modal	5	Abraham Tetteh
TSK-04	US-04	Build POS Walk-In order entry layout for staff	5	Abraham Tetteh
Total Sprint 1 Target Commitment: 18 Story Points.
