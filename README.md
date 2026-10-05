# 🏆 DRMC IT Club — Smart Club Operations & Competition Platform
> **9th DRMC International Tech Carnival 2026 — AI Web Development Contest Submission**  
> *Theme: Smart Club Operations (Eliminating Google Forms for Student Organizations)*

---

## 1. Project Name
**ClubSphere / DRMC Smart Club Operations & Competition Platform**  
*Next-Generation Multi-Tenant Event Registration, Ticketing, Competition Judging, and Tournament System*

---

## 2. Project Description
Traditionally, student club events and festivals rely on third-party tools like Google Forms for registrations. This creates an unprofessional, disconnected user experience plagued by manual tracking, lack of ticket issuance, messy spreadsheets, poor capacity management, and zero competition infrastructure.

**ClubSphere** is a high-performance, full-stack, multi-tenant web platform engineered for student organizations (anchored by **DRMC IT Club**). It models the full hierarchy:
$$\textbf{Organization} \longrightarrow \textbf{Fest} \longrightarrow \textbf{Event} \longrightarrow \textbf{Registration / E-Ticket} \longrightarrow \textbf{Competition / Submission / Leaderboard}$$

The platform delivers an end-to-end registration and ticketing workflow for attendees, an **all-in-one Competition & Tournament Suite** (project submissions, judge scoring rubrics, live scoreboards with freeze mode, and knockout brackets), and enterprise-grade operational tools for club organizers (real-time capacity locks, automated waitlists, camera-based QR check-in, and tamper-proof digital certificates).

---

## 3. Key Features

### 🌟 A. Fest & Event Directory & Executive Navigation (30 pts)
- **Executive SaaS Navigation**: Top-tier header with DRMC live status pill, clean navigation (`Fests`, `Competitions`, `Leaderboards`, `Verify Certificate`), instant **Dark / Light Mode theme toggle**, and unified padding gutters across all screens.
- **Global `Cmd+K` Command Palette**: Instant fuzzy search across fests, events, teams, participants, and ticket passes.
- **Multi-Tenant Hierarchy**: DRMC IT Club as flagship with multiple fests (*Tech Carnival 2026*, *Winter Tech Fest 2026*, *Freshers Tech Fest 2027*).
- **Flagship Contest Centerpiece**: The **AI Web Development Contest** is prominently featured with full rules, real deadlines, prize pools, and live capacity meters starting fresh for attendee registration.
- **Interactive Event Cards**: Real-time tags, dates, venues, entry fees, eligibility, and remaining spots meter.
- **Instant Search & Multi-Filter**: Live filter by keyword, category (Hackathon, Programming Contest, Robotics, Gaming, Workshop), and status.
- **Event Detail Hub**: Live countdown timer to deadline, capacity progress bar, rules/prizes breakdown, and direct 1-click registration.
- **ClubSphere Design Language**: Neutral zinc/slate foundations in both Light and Dark modes, restrained electric violet accents, crisp 1px borders, high information density, and zero decorative AI clutter.

### 🎫 B. Registration, Attendee & Support System (30 pts)
- **Account Registration & Login (`/register` & `/login`)**: Dedicated user sign-up with auto-login on registration, standard login, and 1-click Demo Persona Sign-In for evaluators.
- **Dynamic Event Forms**: Type-safe dynamic questionnaires (T-shirt sizes, GitHub/Portfolio links, custom questions).
- **Clean Slate Testing**: Clean registration state allowing judges to register fresh and test capacity increments in real-time.
- **Solo & Dynamic Team Registrations**: Team captains create teams and receive an invite code; teammates join with one click.
- **Instant E-Ticket Generation**: Digital pass featuring an SVG QR code, attendee badge, and event schedule.
- **Downloadable Pass & iCal Sync**: Export ticket to PDF and 1-click sync to Google Calendar / Apple Calendar.
- **Attendee "My Registrations" Portal**: View registered events, update responses before deadline, download passes, or cancel registrations.
- **Contestant Support Ticket Desk (`/support`)**: Contestants can open support tickets linked to events (technical queries, team issues, rules clarifications) and engage in threaded two-way conversations with organizers.

### 🛡️ C. Organizer Operations & Admin Dashboard (30 pts)
- **Executive Analytics**: Real-time Recharts dashboards displaying registration velocity, capacity utilization, and category breakdowns.
- **Fest & Event Studio**: Create, edit, and configure events, deadlines, limits, and custom questionnaire schemas.
- **Participant Command Center**: High-performance DataTable with fuzzy search, multi-field filtering, and bulk status actions (*Approve*, *Waitlist*, *Reject*, *Check-in*).
- **Printable ID Badges & Lanyard Sheets (`/admin/events/[id]/badges`)**: 1-click batch generation of print-ready A4 attendee badge sheets with QR passes, name, institution, and DRMC branding.
- **Operational Audit & Activity Log (`/admin/audit-logs`)**: Complete real-time timeline tracking registrations, waitlist bumps, check-ins, and admin actions.
- **Contestant Help Desk Center (`/admin/support`)**: Centralized support queue for organizers to triage inquiries, assign staff, reply to contestants in real-time, and track ticket resolution.
- **Export Capabilities**: 1-click CSV/Excel export for offline club operations and logistics.
- **In-Browser Web Camera QR Check-in Scanner**: Organizers scan attendees' QR passes with real-time verification and sound effects.

### ⚔️ D. Dedicated Competition & Tournament Suite (Standout Addition)
- **Project Submission Engine**: Teams and solo competitors submit GitHub repository links, live deployment URLs, demo videos, and project briefs before deadlines.
- **Judge Evaluation Portal (`/judge`)**: Dedicated blind-scoring panel with interactive criteria sliders (UI/UX, Functionality, Technical Architecture, Bonus Creativity) and private judge remarks.
- **Live Public Leaderboard & Scoreboard Freeze**: Real-time ranking with gold/silver/bronze badges, score breakdown popovers, and ICPC-style **Scoreboard Freeze Mode** to build suspense before award ceremonies.
- **Interactive Tournament Bracket Manager**: Visual knockout tree (Quarterfinals $\to$ Semifinals $\to$ Finals) for gaming tournaments and robotics challenges with 1-click match progression.

### 🚀 E. Core 30-Point Bonus & Operations Capabilities
1. **Concurrency-Safe Atomic Capacity & Redis Auto-Waitlist**:
   - Atomic seat decrement prevents overselling during high-traffic registration rushes.
   - When an attendee cancels their ticket, Redis triggers an immediate **Automated Waitlist Promotion**, notifying and bumping the next eligible candidate to confirmed status.
2. **Offline-Resilient E-Ticket Pass (Auditorium Dead-Zone Caching)**:
   - Passes are cached client-side in LocalStorage so attendees can display their valid QR ticket at the gate even with zero cellular signal.
3. **Cryptographically Verifiable Digital Certificates**:
   - Organizers issue post-event completion certificates with public verification URLs (`/verify-certificate/:hash`) and PDF downloads.
4. **Interactive Demo Persona Switcher**:
   - Judges can toggle between **Organizer Admin**, **Competition Judge**, and **Student Attendee** personas in one click without tedious signups.

---

## 4. Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, Server Actions)
- **Styling & UI**: Tailwind CSS v4, shadcn/ui primitives, Lucide React, Framer Motion
- **Database & ORM**: PostgreSQL 16 with Prisma ORM
- **Cache & Concurrency**: Redis 7 (ioredis) for atomic locks, waitlist queues, and live scoreboards
- **Authentication**: NextAuth.js (Auth.js) with Credentials & OAuth readiness
- **QR & Media**: `qrcode.react`, `html5-qrcode` (webcam scanning), `canvas-confetti`
- **Document Generation**: `jspdf` & `html2canvas` for downloadable PDF passes & certificates
- **Deployment & DevOps**: Docker, Docker Compose, Caddy (Automatic HTTPS / Let's Encrypt reverse proxy)

---

## 5. Setup Instructions (Local & Production)

### Local Development
```bash
# 1. Clone repository
git clone https://github.com/litlua/event_management.git
cd event_management

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Start PostgreSQL and Redis via Docker Compose
docker compose up -d postgres redis

# 5. Run Prisma migrations and seed mock data
npx prisma migrate dev --name init
npx prisma db seed

# 6. Start Next.js development server
npm run dev
```

### Production Deployment via Docker Compose & Caddy
```bash
# Build and run all services in production mode
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 6. Deployment URL
- **Production Live URL**: *`https://your-domain.com`* (Configured with Caddy auto-HTTPS)
- **Demo Mode**: Fully operational cloud deployment accessible without local setup.

---

## 7. Demo Credentials

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Club Organizer / Admin** | `organizer@drmc.edu` | `Admin@123` | Full access to Organizer Dashboard, Event Builder, QR Scanner, Brackets, and Scoreboard Freeze |
| **Contest Judge** | `judge@drmc.edu` | `Judge@123` | Dedicated Judge Portal to evaluate assigned submissions with multi-criteria rubric sliders |
| **Student Attendee** | `student@drmc.edu` | `Student@123` | Browse Fests, Register for Events, Team Joining, Project Submissions, My Tickets Portal |

*(Judges can also use the one-click demo persona switcher on the navigation bar)*

---

## 8. Third-Party Services & APIs
- **Let's Encrypt / Caddy**: Automated TLS/SSL certificate issuance and renewal.
- **Gravatar / Unsplash API**: Curated event banners and club asset imagery.

---

## 9. AI Tools & Features Disclosed
In accordance with contest submission transparency guidelines:
- **Google Antigravity & Claude 3.5 / Gemini**: Used for architectural scaffolding, rapid UI component composition, and test mock data generation.
- **vibe-coding workflows**: Used to enforce clean modular architecture and responsive CSS styling.

---

## 10. Screenshots
*(High-resolution screenshots of Fest Directory, E-Ticket with QR Pass, Organizer Dashboard, Judge Rubric, Live Leaderboard, and Camera Scanner will be added here upon completion)*

---

## 11. Known Limitations
- Email delivery in local offline mode uses in-app console logging / toast mock previews unless SMTP keys are configured.
- Camera QR scanning requires standard browser camera permissions over secure HTTPS or localhost.

---

## 12. License
This project is licensed under the [MIT License](LICENSE).
