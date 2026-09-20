# 00 Team Charter Documentation

Deliverable D0: Team Charter, Client Intake, Repository Setup & AI Contract
Course: DCIT 208 – Software Engineering
Deliverable ID: D0
Team Name: DCIT 208 - Group 14
Project Title: Restaurant Management System
Client: SARAH’S TASTY FOODS
Repository URL: https://github.com/Basquansah/DCIT208_Group14_Restaurant_Management_System
Git Tag / Status: Initialized Repository (v0.0-init)
Primary Contact: Abraham Tetteh (atetteh343@st.ug.edu.gh)
Section A: Team Identity and Role Allocation
1. Project Identity
•	Team Name: Group 14
•	Working Title: Restaurant Management System
•	Tagline: Modernizing traditional Ghanaian restaurant operations through streamlined order workflows, dynamic delivery fee calculations, and real-time inventory management.
2. Mandatory Team Role Assignments (7 Roles)
To ensure full compliance with course engineering standards and total system ownership, all 7 required functional roles are consolidated and assigned under Group 14's primary lead:
Mandatory Course Role	Assigned Lead	Student ID	Email 	GitHub Username	Core Responsibilities & Artifact Ownership
UX / Research Lead	Abraham Tetteh
	22402932 	 atetteh343@st.ug.edu.gh


	abrahamtetteh	User observation, customer personas, workflow mapping, UI wireframes, usability checks, and accessibility compliance.
Product / Client Manager	Lawrencia Naa Momo Ashong	22391281	 lnmashong@st.ug.edu.gh
Lawrencia Ashong	Client intake interviews, requirement validations, user story acceptance criteria, and Sakai coordination.
Architecture & Context Lead	Prince Nkansah Asare	22392502	pnasare006@st.ug.edu.gh	Princeasare26	C4 context diagrams, ERD data models, API endpoint specifications, and Architecture Decision Records (ADRs).
QA / Validation Lead	Davina Ohenewaa Koranteng	22407724	dokoranteng006@st.ug.edu.gh
 dokoranteng 	Master Test Plan authoring, unit/integration test execution, CI quality gates, and bug defect tracking.
DevOps / Release Lead	Benedicta Akyere Sika Quansah	22399419	basquansah@st.ug.edu.gh
Basquansah	Repository governance, GitHub Actions workflow automation, root Makefile management, and release tagging (v0.0 to v1.0).
Implementation Lead	Jeffrey Darko	22268728	Jdarko325@st.ug.edu.gh	abrahamtetteh	Full-stack web application development, responsive UI components, core API route construction, and pull request management.
Documentation Lead	Daniel Koomson	22429410	dkoomson012@st.ug.edu.gh	dkoomson012	Deliverable report compilation, repository markdown maintenance, user manual authoring, and final client handoff pack.

3. Professional Biography
(i)	Abraham Tetteh — UX Lead, is a BSc Information Technology Student at the University of Ghana (Student ID: 22402932) specializing in user experience design, full-stack software development, and modern web application development. Serving as the primary engineer for Group 14, Abraham leads the end-to-end execution of the Restaurant Management System. His responsibilities span user observation, interaction design, software architecture, system testing, DevOps automation, and technical documentation. He is dedicated to building intuitive, accessible, and resilient digital solutions that solve operational challenges for real-world Ghanaian enterprises.

(ii)	Jeffrey Darko - Implementation Lead is a Level 200 Information Technology student at the University of Ghana, pursuing a Bachelor of Science in Information Technology. He has developed knowledge and practical skills in information technology, system analysis, software development, database management, and technical problem-solving through his academic work and project experience. He has also gained experience in project coordination, documentation, system implementation, and technical support. On this project, Jeffrey serves as the Implementation Lead, responsible for coordinating the implementation of the restaurant management system, ensuring that the system is properly configured and aligned with the restaurant’s operational requirements, coordinating implementation activities, supporting system testing and deployment, and ensuring that the system is ready for use by the intended users. He also works with team members to monitor implementation progress, identify and resolve issues, and support the successful handover of the completed system. He is organised, responsible, detail-oriented, and committed to ensuring that the project is implemented effectively and meets the required objectives.

(iii)	Daniel Koomson - Documentation Lead is a Level 200 Information Technology student at the University of Ghana, pursuing a Bachelor of Science in Information Technology. He has a background in Computer Networking Management and practical experience in IT support, system troubleshooting, hardware and software configuration, Microsoft 365, SharePoint, and technical operations. He has also developed skills in documentation, project coordination, system analysis, and technical support through his academic and professional experience. On this project, Daniel serves as Documentation / Evidence Lead, responsible for maintaining project documentation, organising project evidence, recording progress, updating repository documentation, and supporting the preparation of deliverables and the final handoff package. He is organised, detail-oriented, and committed to maintaining clear and accurate project records.

(iv)	Benedicta Akyere Sika Quansah - DevOps / Release Lead is a second-year Information Technology student at the University of Ghana with a passion for UI/UX design and web application development. A lady who possesses technical skills in HTML, CSS, C++, and Figma, along with strong proficiency in Microsoft Office applications for academic and professional environments. Currently preparing to undertake the intensive Data Science and Machine learning training program, Benedicta aims to leverage her technical capabilities to build user-centric digital solutions for dynamic organizations.



(v)	Lawrencia Naa Momo Ashong Product / Client Manager is a Level 200 Bachelor of Science in Information Technology student at the University of Ghana with a growing interest in technology and design. She enjoys exploring how technology can be used to create practical and user-friendly solutions. She has experience working with Figma and HTML and has developed an interest in designing digital solutions and creating programs that meet users’ needs. As the Product/Client Manager for this project, she is responsible for communicating with clients, gathering and organizing the information and requirements needed for the project, and works with the team to ensure that these requirements are properly understood and considered. She also contributes through research, teamwork, and coordination. Through her academic projects and practical experience, she continues to build her technical and design skills while exploring her interests in the field of Information Technology.

(vi)	Prince Nkansah Asare Architecture & Context Lead - is a Level 200 Information Technology student at the University of Ghana, pursuing a Distance Education program that blends information systems thinking with practical software development. He has hands-on experience with data modeling — building information models using Ellis-Barker ER and UML class notation — as well as document automation using Node.js, having built modular scripts for structured, professionally formatted multi-chapter reports. On this project, Prince serves as Architecture and Context Lead, responsible for translating client requirements into sound technical structure, data models, and interface contracts. He is detail-oriented, dependable, and committed to producing engineering work that is both functional and well-documented.

(vii)	Davina Ohenewaa Koranteng - UX / Research Lead A level 200 students pursuing the same course. Enjoy exploring how technology can be used to create practical and user-friendly solutions, build a solid foundation in core technical concepts while mastering independent problem-solving and practical skills.
On this project, I served as the QA/ Validation lead, owns test strategy, CI/CD checks, test evidence, bug log, definition of done and release readiness

Section B: Team Operating Agreement
1.	Communication Protocol & Responsiveness:
o	Primary Channels: Email (atetteh343@st.ug.edu.gh), WhatsApp, and GitHub Issue threads.
o	Expected Response Window: Within 4 hours during normal operating days.
2.	Meeting Schedule & Decision Logging:
o	Weekly sprint reviews and progress validation every Monday at 4:00 PM.
o	All requirement modifications, client feedback, and architectural decisions are logged in docs/00_team_charter/client_intake.md.
3.	Task Tracking & Sprint Management:
o	Features and tasks are managed via GitHub Issues with assigned story points.
o	Project progress moves systematically across Kanban board columns: Backlog -> Ready -> In Progress -> Review -> Done.
4.	Version Control & Quality Rules:
o	Branch Protection: Direct unreviewed pushes to main are prohibited; features are developed on dedicated topic branches (feature/, fix/, docs/).
o	Commit Standards: Commits must follow standard conventional formatting (e.g., feat(order): implement delivery fee engine).
o	CI Validation: Every pull request must pass automated linting and build checks executed by GitHub Actions.
5.	Submission Release Freeze Policy:
o	A strict code freeze is enforced 24 hours prior to every weekly course deadline (4:00 PM Ghana Time every Thursday ahead of Friday Sakai submissions).
Section C: Client and Problem Intake
1. Client Overview & Key Stakeholders
•	Client Enterprise: Traditional High-Volume Ghanaian Restaurant
•	Primary Stakeholder: Restaurant Owner / Manager
•	Target System Users:
1.	Owner / Admin: Oversees daily sales performance, menu pricing, inventory stock balances, and employee shift logs.
2.	Kitchen Staff: Require a Point-of-Sale (POS) and kitchen queue screen to process incoming orders and update preparation states.
3.	Customers (Dine-in, Takeaway, Remote): Require a responsive web interface to browse food offerings, customize orders, choose pickup or home delivery, and calculate delivery fees.
2. Client Problem Statement
The client operates a high-volume Ghanaian restaurant following an intensive manual routine starting daily at 2:00 AM. Current operations rely entirely on manual paper tracking and memory, creating severe operational bottlenecks. During peak rush hours, staff encounter frequent order mix-ups, unrecorded custom requests, and a complete lack of daily sales and ingredient visibility. Furthermore, customers living at a distance cannot place orders due to the absence of a remote ordering system.
The proposed Restaurant Management System is a responsive web application engineered to digitize the restaurant's operational workflows. The platform allows remote customers to view available menu items, select between self-pickup and delivery, and receive distance-based delivery fee calculations. Kitchen staff receive an intuitive point-of-sale interface to record orders, track item states (Pending, Preparing, Ready, Completed), and decrement ingredient inventory levels automatically. The owner receives real-time transaction recording for Cash and Mobile Money, low-stock inventory alerts, and daily sales performance analytics.
3. Fallback Validation Plan
If client personnel become unavailable during sprint cycles, user workflows and feature acceptance criteria will be evaluated against standard restaurant operating procedures and simulated user personas documented in the project specifications.
Section D: Repository Governance and Infrastructure
Official Repository URL: https://github.com/Basquansah/DCIT208_Group14_Restaurant_Management_System
1.	Directory Architecture Status: Verified and aligned with course specifications:
o	.github/workflows/ci.yml (Continuous Integration)
o	docs/00_team_charter/ through docs/10_postmortem_final_freeze/
o	src/ (Application Source Code)
o	tests/ (Automated Test Suites)
o	presentations/ & videos/
o	Makefile, TEAM.md, AI_USAGE.md, README.md
2.	Continuous Integration Pipeline: Configured via GitHub Actions to execute Makefile targets (setup, lint, test, run, build).
Section E: AI Usage Contract & Academic Integrity
1.	AI Role Definition: Artificial Intelligence tools (such as ChatGPT) serve exclusively as productivity assistants for structural formatting, code boilerplate drafting, and conceptual debugging. They do not replace human software engineering analysis or system design.
2.	Auditability & Logging: All AI interactions are logged transparently in AI_USAGE.md, recording the date, tool, prompt overview, human verification steps, and resulting code artifacts.
3.	Data Security Commitment: Private client details, credentials, or sensitive API keys will never be entered into public AI prompts.
4.	Viva Defense Guarantee: Every line of code, software architecture decision, and test suite committed to the repository will be fully understood, explainable, and defensible during individual oral viva evaluations.

