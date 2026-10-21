# 09 Final Demo and Handoff
Deliverable D9: Final Demo, User Manual, Deployment/Ops Guide and Client Handoff Pack Course: DCIT 208 – Software Engineering Deliverable ID: D9 Team Name: Group 14 Project Title: Restaurant Management System (Sarah's Tasty Foods) Target Release Tag: v1.0-release Repository URL: https://github.com/Basquansah/DCIT208_Group14_Restaurant_Management_System Primary Contact: Abraham Tetteh (atetteh343@st.ug.edu.gh)
SECTION 1: FINAL DEMO SCRIPT AND SYSTEM WALKTHROUGH
1.1 Executive Summary Deliverable D9 represents the complete, final release candidate and client handoff package for the Restaurant Management System developed for Sarah's Tasty Foods. The system establishes a unified, multi-station platform connecting Point of Sale (POS), Kitchen Display Systems (KDS), Inventory Management, and Executive Administration into a cohesive real-time workflow.
1.2 Demonstration Scenario Flow The final demonstration showcases a complete operational lifecycle of a customer order and inventory audit:
Step 1: Admin Configuration and Visual Customization
•	The Administrator logs in via /admin using the full-screen branded login screen.
•	The Admin accesses the background image manager from settings and updates the login screen backdrop image.
•	Using the maroon left navigation menu, the Admin inspects Executive Overview metrics, verifies staff accounts under Staff & Department Control, and checks menu pricing under Menu & Portions Management.
Step 2: Point of Sale (POS) Order Entry
•	POS staff authenticate at /pos via the two-field Staff Login Gate (Staff Name and Password/PIN/Phone).
•	The cashier creates a new order ticket (e.g., Table 4, Dine-in: 2x Jollof Rice with Grilled Chicken, 1x Fresh Juice).
•	The order is submitted, updating local session storage and broadcasting to Supabase database tables in real time.
Step 3: Real-Time Kitchen Display Order Fulfillment
•	Kitchen staff access /kitchen through the dedicated login gate.
•	The active kitchen monitor renders incoming order tickets automatically.
•	Kitchen staff toggle order statuses ("Pending" to "Preparing" to "Ready").
•	Note: The working kitchen view intentionally omits internal logout/lock trigger buttons to prevent accidental screen locks during active meal preparation.
Step 4: Inventory Management and Daily Interface Date Audit
•	Inventory personnel authenticate at /inventory.
•	Staff record stock receipts (e.g., receiving 50 kg of Rice) and stock issues for kitchen usage.
•	Using the "Interface Date" picker in the header, the user selects a previous date to audit historical stock receive and issue logs without altering global inventory balances. Clicking "Reset to Today" restores the active date view.
SECTION 2: FINAL USER MANUAL
2.1 Station Architecture and Security Overview All terminals in the Restaurant Management System utilize standard full-screen authentication gates blocking background controls until valid credentials matching the Supabase staff database table are provided.
2.2 Terminal Operating Guides
2.2.1 Executive Admin Panel (/admin)
•	Authentication: Enter valid Administrator credentials on the custom full-screen background screen.
•	Left Sidebar Navigation:
o	Executive Overview: High-level financial reporting, sales metrics, and system analytics.
o	Menu & Portions Management: Adding/editing menu items, pricing, portion ratios, and availability toggles.
o	Staff & Department Control: Onboarding staff, assigning roles (POS, Kitchen, Inventory, Admin), and setting access PINs/passwords.
o	Inventory Control: Global stock thresholds, reorder warnings, and category definitions.
o	Master Order History: Full searchable archive of all past orders and transaction logs.
•	Custom Login Background: Open Admin Settings from the top action bar, upload or enter an image URL, and click Save.
2.2.2 Point of Sale Terminal (/pos)
•	Accessing Terminal: Authenticate using assigned cashier credentials.
•	Ticket Creation: Tap menu items to add them to the ticket, adjust quantities using + / - buttons, assign Table Number / Order Type, and click "Complete Order".
•	Station Locking: Click the lock icon in the top right header to lock the station when stepping away.
2.2.3 Kitchen Display Terminal (/kitchen)
•	Accessing Terminal: Authenticate using assigned kitchen staff credentials.
•	Order Management: View incoming tickets ordered chronologically. Click status badges to advance order prep state.
•	Operational Continuity: Lock buttons are omitted from the active working station to maintain uninterrupted display focus.
2.2.4 Inventory Management Terminal (/inventory)
•	Accessing Terminal: Authenticate using assigned inventory staff credentials.
•	Stock Entry: Select "Receive Stock" or "Issue Stock", choose the inventory item, enter quantity and notes, and submit.
•	Historical Audit: Use the "Interface Date" date picker in the header bar to inspect stock movement logs for past days.
SECTION 3: DEPLOYMENT AND OPERATIONS GUIDE
3.1 System Requirements
•	Environment: Node.js version 18.x or higher, npm or yarn package manager.
•	Core Stack: Next.js (App Router), TypeScript, React.
•	Database: Supabase PostgreSQL instance with Realtime enabled.
•	Hosting Platform: Vercel, Netlify, or any Node.js container environment.
3.2 Local Deployment Steps
1.	Clone the repository: git clone https://github.com/Basquansah/DCIT208_Group14_Restaurant_Management_System.git
2.	Navigate to project root directory: cd DCIT208_Group14_Restaurant_Management_System
3.	Install dependencies: npm install
4.	Configure Environment Variables: Create a .env.local file in the root folder containing: NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
5.	Start local production build: npm run build npm run start
6.	Open http://localhost:3000 in browser.
3.3 Maintenance and Operational Protocols
•	Clearing Lock Issues: If file lock errors occur during local compilation on Windows (.next/server file locks), force-stop Node processes in PowerShell via taskkill /F /IM node.exe and rebuild.
•	Version Control Rules: Do not force-add heavy node_modules binaries to Git. Ensure .gitignore excludes node_modules/, .next/, and .env*.local.
SECTION 4: CLIENT HANDOFF PACK
4.1 Final Deliverable Inventory
1.	Production Source Code: Complete codebase stored on GitHub main branch (Tag: v1.0-release).
2.	Database Schema and Seed Data: Supabase database configuration scripts including staff tables, menu tables, inventory tables, and order logs.
3.	System Documentation: Deliverables D1 through D9 covering requirements, architecture, sprint reviews, user manuals, and deployment guides.
4.2 Client Sign-Off and Handoff Approval
•	Client Name: Sarah's Tasty Foods
•	Project Team: Group 14 (DCIT 208)
•	Primary Contact: Abraham Tetteh (atetteh343@st.ug.edu.gh)
•	Release Tag: v1.0-release
•	Sign-off Date: October 21, 2026

