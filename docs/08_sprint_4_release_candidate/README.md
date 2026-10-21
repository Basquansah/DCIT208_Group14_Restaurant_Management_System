# 08 Sprint 4 Release Candidate
DELIVERABLE D8: SPRINT 4 REVIEW REPORT, RELEASE CANDIDATE, AND USER MANUAL DRAFT
Course: DCIT 208 – Software Engineering Deliverable
 ID: D8 
Team Name: Group 14 
Project Title: Restaurant Management System (Sarah's Tasty Foods) 
Target Release Tag: v0.4-staging Repository URL: https://github.com/Basquansah/DCIT208_Group14_Restaurant_Management_System 
Primary Contact: Abraham Tetteh (atetteh343@st.ug.edu.gh)
COURSE CODE: DCIT 208 PROJECT TITLE: RESTAURANT MANAGEMENT SYSTEM GROUP NUMBER: GROUP 14
SECTION 1: SPRINT 4 REVIEW REPORT
1.1 Executive Summary Sprint 4 focused on finalizing station-level access security, standardizing user interface components across operating terminals, refining daily reporting features, and completing system release preparation. The key objectives accomplished during Sprint 4 include:
•	Standardizing full-screen, credential-based authentication gates across Point of Sale (POS), Kitchen Display, Inventory Control, and Executive Admin terminals.
•	Implementing dedicated access control rules, including removing logout and lock triggers from the active Kitchen Display working monitor to prevent accidental workstation suspension during live meal production.
•	Integrating an interactive Daily Interface Date picker in the Inventory Management module to allow staff to review historical stock receipt and issue logs while preserving cumulative inventory balances.
•	Modernizing the Executive Admin interface with a custom full-screen background image manager and a maroon-themed left navigation sidebar containing bold visual icons and clear menu categorization.
•	Standardizing the Admin login gate to a unified two-field credential pattern (Staff Name and Password/PIN/Phone) matching the system-wide authentication paradigm.
•	Cleaning local Git index repositories and successfully pushing the complete production codebase to the remote GitHub repository.
1.2 Sprint Accomplishments and User Stories Completed
•	User Story 4.1 (Station Security): As a restaurant manager, I want all working stations (POS, Kitchen, Inventory, Admin) to be protected by full-screen login gates so that unauthorized staff cannot perform actions on unauthorized terminals. (Status: Completed)
•	User Story 4.2 (Kitchen Terminal Stability): As a kitchen supervisor, I want the active kitchen monitor interface free of explicit logout or lock buttons so that kitchen staff do not accidentally lock the screen during busy service hours. (Status: Completed)
•	User Story 4.3 (Inventory Date Filtering): As an inventory manager, I want an interactive date picker on the inventory screen so that I can audit stock receives and issues for specific past dates without disturbing total stock quantities. (Status: Completed)
•	User Story 4.4 (Admin Customization & Layout): As a restaurant owner, I want a dedicated left navigation sidebar with a distinct maroon color theme and the ability to customize the login background image so that administrative control feels professional and cohesive. (Status: Completed)
•	User Story 4.5 (Unified Login Pattern): As a system user, I want a consistent two-field authentication prompt (Staff Name and Password/PIN/Phone) across all terminals for a seamless user experience. (Status: Completed)
1.3 Velocity and Sprint Performance Metrics
•	Planned Story Points: 40 Story Points
•	Completed Story Points: 40 Story Points
•	Sprint Completion Rate: 100%
•	Key Challenges Overcome: Windows file locking issues on build directories (.next/server) were resolved by terminating active Node background processes. Repository size limitations on GitHub (100MB per file limit caused by next-swc binaries in node_modules) were successfully resolved by cleaning Git tracking caches and enforcing proper repository ignore configurations.
SECTION 2: RELEASE CANDIDATE SPECIFICATION
2.1 Overview The Sprint 4 deliverable represents the primary Release Candidate (RC1) for the Restaurant Management System. This candidate contains full cross-terminal operational functionality including order entry, kitchen display fulfillment, stock management, and administrative oversight.
2.2 Core Component Architecture
•	Web Framework: Next.js (App Router)
•	Programming Language: TypeScript
•	Database & Authentication Service: Supabase
•	Client State & Session Storage: Browser localStorage & React State
•	Integrated Development Environment: Visual Studio Code / Android Studio
2.3 System Build & Repository Verification
•	Repository URL: https://github.com/Basquansah/DCIT208_Group14_Restaurant_Management_System.git
•	Target Branch: main
•	Excluded Artifacts: Heavy binary files, build outputs (.next), and node_modules dependencies are strictly excluded from version control to maintain lightweight repository health.
SECTION 3: USER MANUAL DRAFT
3.1 System Access and Station Authentication The system provides four primary operating terminals: Point of Sale (POS), Kitchen Display System, Inventory Management, and Executive Admin.
3.1.1 Authenticating at a Station
1.	Navigate to the desired station route in your web browser (e.g., /pos, /kitchen, /inventory, /admin).
2.	The station will display a full-screen authentication gate blocking access to background controls.
3.	Enter your registered Staff Name in the first field.
4.	Enter your assigned Password, PIN, or Phone Number in the second field.
5.	Click the "Authenticate Station" button.
6.	Upon successful verification against the system staff directory, the gate will unlock and display the active terminal workspace.
3.2 Point of Sale (POS) Station
•	Placing Orders: Select menu categories, click item cards to add items to the current ticket, adjust item quantities, select order type (Dine-in or Takeaway), and click "Complete Order".
•	Station Locking: To lock or switch staff on the POS terminal, click the lock icon located in the upper action header.
3.3 Kitchen Display System (KDS) Station
•	Order Tracking: Incoming customer orders appear automatically in real-time order cards showing table numbers, items, and prep notes.
•	Status Updating: Kitchen staff click order status toggles (e.g., "Preparing" or "Ready") as food is cooked.
•	Station Design Note: The active kitchen workspace intentional omits logout or lock buttons to prevent accidental screen lockouts during food preparation.
3.4 Inventory Management Station
•	Stock Viewing: Displays current item stock levels, low-stock alerts, and daily stock movement summary records.
•	Date Filtering: Locate the "Daily Interface Date" picker in the top header bar. Select any past calendar date using the date picker to inspect receive and issue transactions logged on that specific day. Click "Reset to Today" to return to current date logging.
•	Stock Adjustments: Use the Receive Stock or Issue Stock forms to update inventory balances. Total cumulative item quantities will update globally while transaction logs store the timestamp.
3.5 Executive Admin Panel
•	Accessing the Panel: Authenticate using valid Administrator credentials at the /admin route.
•	Navigation Sidebar: Use the maroon left sidebar menu to navigate between system modules:
o	Executive Overview (Sales graphs, metrics, summary cards)
o	Menu & Portions Management (Item pricing, recipes, category setup)
o	Staff & Department Control (Adding, editing, or deactivating staff records and PINs)
o	Inventory Control (Global stock parameters and reorder thresholds)
o	Master Order History (Complete history of processed restaurant orders)
•	Customizing Login Background: Navigate to Admin Settings from the header control area. Select "Change Login Background" to upload or input an image URL. This custom background will display on future Admin login screens.
