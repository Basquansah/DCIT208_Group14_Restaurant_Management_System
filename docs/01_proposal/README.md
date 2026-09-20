# 01 Project Proposal

Deliverable D1: Project Proposal, Feasibility & Business Considerations
Course: DCIT 208 – Software Engineering
Deliverable ID: D1
Team Name: Group 14
Project Title: Restaurant Management System
Client: Local Traditional Ghanaian Restaurant Owner
Repository URL: https://github.com/Basquansah/DCIT208_Group14_Restaurant_Management_System
Primary Contact: Abraham Tetteh (atetteh343@st.ug.edu.gh)
1. Executive Summary
The food service industry in Ghana relies heavily on traditional, high-volume dining establishments that operate on demanding physical schedules. The client enterprise operates a local restaurant providing traditional Ghanaian dishes (such as Banku, Waakye, Jollof Rice, and Fufu). Currently, the restaurant operates without a digital software infrastructure. All customer order taking, kitchen queuing, payment tracking, inventory management, and employee attendance logging are conducted manually.
This manual operational model introduces significant vulnerabilities:
•	Frequent order mix-ups during peak morning and afternoon meal rushes.
•	Unrecorded custom meal requests resulting in inventory discrepancies and lost revenue.
•	Inability to capture remote or off-site customer demand due to a lack of digital ordering mechanisms.
•	Absence of real-time visibility into daily revenue, Cash vs. Mobile Money transaction breakdowns, and ingredient stock levels.
The Restaurant Management System is a responsive web application engineered to digitize and automate the restaurant's end-to-end operations. The solution provides a frictionless remote ordering web portal for customers featuring automated distance-based delivery fee calculations, an intuitive Point-of-Sale (POS) and kitchen display interface for staff, and a management dashboard for the owner to monitor sales analytics and inventory balances in real time.
2. System Scope and Non-Goals
To maintain high development velocity and ensure project completion within course timelines, clear scope boundaries have been established:
In-Scope Features:
1.	Interactive Menu Management: Categorized presentation of staples, proteins, and stews/soups with real-time availability toggles.
2.	Flexible Customer Ordering Subsystem: Remote order creation supporting both self-pickup and home/office delivery options.
3.	Automated Delivery Calculation Engine: Distance-based delivery fee computation using dynamic per-kilometer rates added to the food subtotal.
4.	Point-of-Sale (POS) & Kitchen Display Board: Real-time queue interface for kitchen staff to process walk-in orders and transition order states (PENDING -> PREPARING -> READY -> COMPLETED).
5.	Inventory & Stock Management: Automated ingredient stock tracking with low-stock alerts triggered when items breach minimum safety thresholds.
6.	Payment & Revenue Tracking: Support for Cash and Mobile Money (MoMo) transaction recording with daily sales summary generation.
7.	Staff Attendance Logging: Digital clock-in and clock-out recording for kitchen workers during daily shifts.
Out-of-Scope (Non-Goals):
1.	Integrated In-House Driver Dispatching: The system will not manage or track third-party courier routes via live GPS navigation.
2.	Third-Party Payment Gateway Integration: Direct payment API integrations (e.g., Paystack/Hubtel live webhooks) are simulated via payment reference verification to avoid live financial transaction compliance hurdles during academic evaluation.
3.	Multi-Location Enterprise Franchising: The current release architecture targets single-location restaurant operations.
3. Business, Legal, and Data Privacy Considerations
3.1 Software Licensing
The Restaurant Management System is developed under the open-source MIT License. The client is granted a perpetual, non-exclusive, royalty-free license to use, modify, and deploy the software for business operations.
3.2 Open-Source Dependency Compliance
All third-party libraries and frameworks used in the project (Next.js, React, Tailwind CSS, PostgreSQL drivers) are distributed under permissive open-source licenses (MIT, Apache 2.0, or BSD). No copyleft or restrictive GPL-licensed software is included, preventing potential intellectual property conflicts.
3.3 Data Privacy & Protection
In compliance with data protection principles:
•	Customer phone numbers, delivery addresses, and names collected during remote checkout are stored securely in PostgreSQL and used strictly for order fulfillment.
•	Customer data will never be shared with third parties or used for external telemarketing.
•	Passwords and authentication credentials for administrative access are hashed using industry-standard bcrypt algorithms prior to storage.
3.4 Academic Disclaimer & Limitation of Liability
The system is provided "AS-IS" without warranty of any kind. As an academic project developed under the DCIT 208 course curriculum, the development team and the University of Ghana carry no legal or financial liability for operational disruptions, data losses, or business interruptions during deployment.
4. Feasibility Analysis
4.1 Technical Feasibility
•	Stack Maturity: Built on modern, standard web technologies (Next.js, TypeScript, Tailwind CSS, PostgreSQL, Vercel/Render hosting).
•	Cross-Platform Compatibility: Responsive web design guarantees seamless rendering across mobile phones, tablets, and desktop workstations without cross-platform mobile SDK complexities.
•	Continuous Integration: Automated build and test validation via GitHub Actions ensures stability across every pull request.
4.2 Financial Feasibility
•	Zero Software Licensing Cost: Built entirely using open-source frameworks and free-tier hosting platforms (Vercel, Render, Supabase PostgreSQL).
•	Minimal Hardware Investment: Staff and administration can operate the application using existing mobile smartphones, tablets, or laptop computers.
4.3 Operational Feasibility
•	Simplified User Experience: Designed with high contrast, touch-friendly interfaces requiring minimal technical literacy for kitchen staff operating under fast-paced conditions.
•	Workflow Alignment: Digital states mirror the restaurant's existing physical preparation cycle (2:00 AM market procurement through 4:00 PM close).
5. Top 10 Risk Matrix
Risk ID	Risk Category	Identified Risk Event	Likelihood	Impact	Severity	Mitigation Strategy
R-01	Technical	Internet connectivity disruption at restaurant location	Medium	High	High	Design offline-first local browser caching (PWA features) to queue orders locally until connection restores.
R-02	Operational	Kitchen staff resistance to digital POS during rush hours	Medium	High	High	Implement simplified touch cards with large buttons and provide pre-launch hands-on training sessions.
R-03	Schedule	Weekly deliverable deadline conflicts with course workload	High	Medium	High	Enforce strict 24-hour pre-deadline freeze policy and utilize modular feature branches.
R-04	Client	Primary restaurant owner unavailable for weekly review	Medium	Medium	Medium	Utilize simulated client user personas and fallback acceptance criteria derived from intake specification documents.
R-05	Technical	Inaccurate distance calculation for delivery fees	Low	High	Medium	Implement fallback flat-rate zone pricing if distance API or geographic coordinate lookup fails.
R-06	Data Integrity	Concurrent stock decrement errors during simultaneous orders	Low	High	Medium	Enforce atomic transaction isolation levels and row-locking mechanisms inside PostgreSQL database queries.
R-07	Security	Unauthorized access to owner administrative dashboard	Low	High	Medium	Implement Role-Based Access Control (RBAC) and JSON Web Token (JWT) session validation across all API routes.
R-08	Quality	Uncaught regression bugs breaking core checkout flow	Medium	High	High	Enforce mandatory unit testing for calculation functions and block PR merges failing CI pipeline checks.
R-09	Legal	Privacy breach exposing customer phone numbers and addresses	Low	Medium	Low	Sanitize all logs, enforce HTTPS encryption in transit, and apply strict database access constraints.
R-10	Scope	Scope creep adding complex driver tracking or payment gateways	High	Medium	Medium	Enforce strict adherence to Section 2 Scope Non-Goals throughout all sprint planning sessions.


