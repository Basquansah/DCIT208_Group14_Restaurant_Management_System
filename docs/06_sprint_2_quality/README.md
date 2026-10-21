# 06 Sprint 2 Review and Quality Evidence

Deliverable D6: Sprint 2 Review Report, Test Plan & Quality Evidence v0.2-beta
Course: DCIT 208 – Software Engineering
Deliverable ID: D6
Team Name: Group 14
Project Title: Restaurant Management System (Sarah's Tasty Foods)
Target Release Tag: v0.2-beta
Repository URL: https://github.com/Basquansah/DCIT208_Group14_Restaurant_Management_System
Primary Contact: Abraham Tetteh (atetteh343@st.ug.edu.gh)
1. Master Test Strategy & Quality Evidence
Deliverable D6 establishes automated software testing and database integration quality controls for Sarah's Tasty Foods.
Test Environment & Automation Framework
•	Testing Engine: Jest / Vitest for TypeScript utility functions.
•	Continuous Integration: Executed via GitHub Actions workflow (.github/workflows/ci.yml).
•	Database Verification: Supabase PostgreSQL cloud database instance enforcing foreign key constraints and schema validation.
2. Test Execution Log & Results Matrix
Test ID	Target Component / Utility	Test Description & Scenario	Expected Result	Result
TST-01	calculateOrderPricing	Verify Self-Pickup returns GHS 0.00 delivery fee	Fee = 0.00, Total = Food Subtotal	PASSED
TST-02	calculateOrderPricing	Verify Home Delivery calculates distance formula	10.00+(4×3.50)=24.00	PASSED
TST-03	calculateOrderPricing	Verify error thrown for negative food subtotals	Throws validation error	PASSED
TST-04	KitchenQueuePage	Verify order status transition (PENDING -> PREPARING)	State updates and moves card column	PASSED
TST-05	Supabase PostgreSQL	Verify relational integrity and initial 18 menu items seed	Returns 18 items across 3 categories	PASSED
3. Sprint 2 Accomplishments & Release Status
•	Cloud Database Setup: Successfully initialized Supabase PostgreSQL database tables with categories, 18 menu items with local image paths (/images/banku.jpg), and orders tracking.
•	Kitchen Queue Display: Built responsive kitchen staff board (/kitchen) supporting live order state updates (PENDING -> PREPARING -> READY -> COMPLETED).
•	Automated CI Validation: Unit test suite integrated into root Makefile and GitHub Actions pipeline.
•	Release Tag: Published official release tag v0.2-beta.


