# 05 Sprint 1 Review

Deliverable D5: Sprint 1 Review Report & Working Prototype v0.1-prototype

Course: DCIT 208 – Software Engineering
Deliverable ID: D5
Team Name: Group 14
Project Title: Restaurant Management System (Sarah's Tasty Foods)
Target Release Tag: v0.1-prototype
Repository URL: https://github.com/Basquansah/DCIT208_Group14_Restaurant_Management_System
Primary Contact: Abraham Tetteh (atetteh343@st.ug.edu.gh)
1. Sprint 1 Goal & Overview
The objective of Sprint 1 was to implement a functional, working web application prototype for Sarah's Tasty Foods. The prototype delivers the core customer-facing menu catalog, interactive cart state management, fulfillment option toggling (Self-Pickup vs. Home Delivery), dynamic distance-based delivery fee computation logic, and itemized billing summaries.
2. Implemented Features & Verification Matrix
All planned user stories for Sprint 1 were successfully developed, tested, and integrated into the src/ codebase:
User Story ID	Feature Description	Status	Verification & Acceptance Evidence
US-01	Interactive Menu Catalog Browsing & Category Filtering	Completed	Verified menu rendering across Staples and Proteins with real-time category filtering.
US-02	Dynamic Distance Delivery Fee Engine (calculateOrderPricing)	Completed	Executed unit validation confirming formula Fee = Base (GHS10.00) + (Distance xGHS3.50).
US-03	Shopping Cart Assembly & Live Order Breakdown	Completed	Verified live quantity adjusters, subtotal tracking, and itemized total calculation.
US-04	POS Walk-In Quick Entry Interface Draft	Completed	Formulated initial walk-in order state handler for kitchen queues.
3. Core Technical Engine Implementation
The dynamic calculation engine was implemented in src/utils/deliveryCalculator.ts to execute automated pricing updates without page reloads:
•	Self-Pickup Rule: When fulfillment is set to PICKUP, delivery fee evaluates to GHS0.00
•	Home Delivery Rule: When fulfillment is set to DELIVERY, delivery fee evaluates dynamically based on distance:
Total Payable = FoodSubtotal + [BaseFee (GHS 10.00) + (DistanceInKm X GHS3.50)
4. Client & Usability Feedback Verification
Initial prototype testing with simulated user personas yielded positive results:
•	Frictionless Customer Ordering: Remote customers can assemble orders and calculate delivery costs instantly without creating accounts or downloading native mobile applications.
•	Pricing Transparency: Displaying an itemized breakdown (Food Subtotal vs. Delivery Fee) eliminated customer confusion regarding delivery surcharges.
5. Sprint Retrospective & Velocity Metrics
•	Committed Story Points: 18 Story Points
•	Completed Story Points: 18 Story Points
•	Sprint Completion Velocity: 100
•	Key Learning: Modularizing calculation utilities (deliveryCalculator.ts) outside React component trees ensures easy unit testing in automated CI pipelines.
•	Next Sprint Target (Sprint 2 / D6): Build the Kitchen Queue display board (PENDING -> PREPARING -> READY), execute ingredient stock decrements, and implement automated test suites.


