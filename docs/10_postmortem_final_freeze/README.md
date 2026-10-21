# 10 Post-Mortem and Final Freeze
UNIVERSITY OF GHANA DEPARTMENT OF COMPUTER SCIENCE DCIT 208: SOFTWARE ENGINEERING ACADEMIC YEAR 2025/2026
DELIVERABLE D10: FINAL REPOSITORY FREEZE, POST-MORTEM, PEER EVALUATION AND INDIVIDUAL EVIDENCE PACK
PROJECT TITLE: SARAH'S TASTY FOODS - RESTAURANT MANAGEMENT SYSTEM GROUP NUMBER: GROUP 14 PRIMARY CONTACT: ABRAHAM TETTEH (atetteh343@st.ug.edu.gh) SUBMISSION DATE: OCTOBER 21, 2026
================================================================================ SECTION 1: REPOSITORY FREEZE AND DEPLOYMENT VERIFICATION
1.1 FINAL REPOSITORY FREEZE STATUS The project codebase has reached a final freeze state in accordance with D10 submission requirements. No further code modifications will be pushed to the release branch to ensure complete stability during grading.
•	Live Cloud URL: https://dcit208-group14-restaurant-management.onrender.com
•	Public GitHub Repository: https://github.com/Basquansah/DCIT208_Group14_Restaurant_Management_System
•	Official Release Tag: v1.0-handoff
•	Final Commit Hash (Commit S): 248aec01f9c70bf575a687bfd356719ae5367543
•	Deployment Platform: Render Web Service (Node.js Runtime)
1.2 LOCAL RUNTIME & SETUP INSTRUCTIONS To run and test the frozen repository locally:
1.	Clone the repository: git clone https://github.com/Basquansah/DCIT208_Group14_Restaurant_Management_System.git
2.	Checkout the release commit: git checkout v1.0-handoff
3.	Install dependencies: npm install
4.	Configure environment variables in .env.local: NEXT_PUBLIC_SUPABASE_URL= NEXT_PUBLIC_SUPABASE_ANON_KEY=
5.	Start local server: npm run dev (Access at http://localhost:3000)
================================================================================ SECTION 2: PROJECT POST-MORTEM ANALYSIS
2.1 WHAT WENT WELL
•	Modular Next.js App Router architecture facilitated clear component division between user catalog, order cart, and administrative management.
•	Supabase integration provided seamless PostgreSQL database persistence, real-time table sync, and secure cloud storage.
•	Effective communication and iterative testing enabled quick resolution of critical deployment blockers.
2.2 TECHNICAL CHALLENGES & RESOLUTIONS
•	Repository & Build Path Misconfigurations: Render initial builds failed due to repository permissions and incorrect root directory settings. Solved by setting repository visibility to public and re-aligning the Render Web Service root directory setting to the main repository root containing package.json.
•	Linux Case Sensitivity & Media Asset Delivery: Local testing on Windows hid case mismatches between code references and public folder image assets, resulting in 404 errors on Render's Linux environment. Solved by migrating menu image assets directly into Supabase Storage Buckets via the Admin Dashboard, generating global CDN URLs stored straight in the database.
2.3 KEY LESSONS LEARNED
•	Cross-platform file pathing must account for OS-level case sensitivity early in development.
•	Decoupling static media assets from static app builds by leveraging cloud buckets improves reliability across continuous integration environments.
================================================================================ SECTION 3: PEER EVALUATION OVERVIEW & TEAM ROSTER
3.1 GROUP MEMBER CONTRIBUTION ROSTER
+------------------------+----------------+--------------------------------------+--------------------+ | Student Full Name | Index Number | Primary Role / Area of Work | Contribution Score | +------------------------+----------------+--------------------------------------+--------------------+ | Abraham Tetteh | [Index Number] | Deployment, CI/CD, Admin & Asset Mgmt| 100% | | [Member 2 Full Name] | [Index Number] | Frontend UI/UX & Menu Catalog | 100% | | [Member 3 Full Name] | [Index Number] | Backend Supabase Schema & Auth | 100% | | [Member 4 Full Name] | [Index Number] | Cart & Order Workflow Logic | 100% | | [Member 5 Full Name] | [Index Number] | Quality Assurance & Documentation | 100% | +------------------------+----------------+--------------------------------------+--------------------+
3.2 TEAMWORK AND WORKFLOW SUMMARY Group 14 maintained an active collaborative workflow throughout all deliverables (D1 through D10). Tasks were divided according to core competencies:
•	Frontend & UI/UX Development: Designed customer ordering interfaces, responsive layout, menu navigation, and shopping cart workflow.
•	Database & Backend Integration: Configured Supabase schema tables, Row Level Security (RLS) policies, storage buckets, and API client connections.
•	Administrative Portal & Asset Management: Built admin management screens, menu creation/updating functionality, and live image upload flows.
•	Deployment, CI/CD & Quality Assurance: Managed GitHub repository releases, release tagging, Render cloud configuration, cross-OS debugging, and final D10 evidence compilation.
(Detailed individual peer evaluation forms and scoring sheets are submitted alongside this document on Sakai).
================================================================================ SECTION 4: INDIVIDUAL EVIDENCE PACK
4.1 PRIMARY CONTACT & CONTRIBUTOR EVIDENCE
•	Student Name: Abraham Tetteh
•	Email: atetteh343@st.ug.edu.gh
•	Core Contributions:
o	Led deployment pipeline setup on Render, root directory path resolution, and repository freeze validation.
o	Executed live database and image asset updates via the Admin Dashboard to resolve Supabase Storage integration.
o	Authored and compiled Deliverable D10 Final Handoff Report and Repository Evidence Pack.
4.2 COMMIT & WORK EVIDENCE LOG
•	Frozen Commit Tag: v1.0-handoff
•	Verification Commit Hash: 248aec01f9c70bf575a687bfd356719ae5367543
•	Key Pull Requests & Commits: Configured Expo/Next settings, established database tables/policies, updated public image assets, and verified live production builds.
================================================================================ SECTION 5: CONCLUSION & FINAL HANDOFF SIGN-OFF
The Sarah's Tasty Foods Restaurant Management System is completely deployed, fully functional, and officially frozen for DCIT 208 grading. All live cloud URLs, public code repositories, database storage channels, and individual contribution evidence packs are verified and ready for evaluation.

