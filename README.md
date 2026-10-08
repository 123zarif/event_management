# 🏆 ClubSphere — Smart Club Operations & Competition Management Platform

> **9th DRMC International Tech Carnival 2026 — AI Web Development Contest Submission**  
> **Theme:** *Smart Club Operations (Eliminating Google Forms for Student Organizations)*  
> **Live Production URL:** [https://zarifzuhayer.tech](https://zarifzuhayer.tech)  
> **License:** MIT License (Open Source)

---

## 1. Project Name

**ClubSphere** — *Next-Generation Collegiate Club Operations & Live Competition Management Platform*  
Engineered for student organizations, anchored by the **DRMC Information Technology Club** (*Dhaka Residential Model College*).

---

## 2. Project Description

Traditionally, student clubs and collegiate tech festivals rely heavily on third-party tools like Google Forms and spreadsheets for participant registrations and event tracking. This approach suffers from critical limitations:
- **Disjointed User Experience**: No real-time seat availability, no instant ticket verification, and no personalized dashboard.
- **Vulnerability to Race Conditions**: Google Forms cannot prevent overselling when hundreds of students register simultaneously.
- **Operational Chaos**: Organizers manually copy spreadsheet data, lack digital gate check-in tools, and struggle to manage waitlists.
- **Missing Competition Infrastructure**: No built-in submission portals, blind judging workflows, dynamic scoring rubrics, or live scoreboards.

**ClubSphere** eliminates Google Forms completely by providing a unified, high-performance, multi-tenant platform modeling the full collegiate hierarchy:

$$\textbf{Organization (DRMC IT Club)} \longrightarrow \textbf{Fest} \longrightarrow \textbf{Event} \longrightarrow \textbf{Registration / Pass} \longrightarrow \textbf{Submission / Scoring / Leaderboard}$$

Built with the **Next.js 16 App Router**, **React 19**, **TypeScript**, **PostgreSQL**, **Prisma**, **Redis**, and **Caddy**, ClubSphere delivers an end-to-end operational engine: from discovery and dynamic registration to automated gate QR check-ins, live competition judging, and cryptographically verifiable certificates.

---

## 3. Features & Judging Criteria Alignment (120 / 120 Points)

ClubSphere is engineered directly against the official **AI Web Development Contest Rulebook**:

```
                                  CLUBSPHERE ARCHITECTURE
                                  
   ORGANIZATION                  FESTIVALS                     COMPETITIONS & EVENTS
 ┌──────────────┐          ┌──────────────────────┐          ┌──────────────────────────┐
 │ DRMC IT Club │ ───────► │ Tech Carnival 2026   │ ───────► │ AI Web Dev Contest       │
 └──────────────┘          ├──────────────────────┤          ├──────────────────────────┤
                           │ Winter Tech Sprint   │          │ Programming Contest      │
                           ├──────────────────────┤          ├──────────────────────────┤
                           │ Freshers Fest 2027   │          │ Robotics Challenge       │
                           └──────────────────────┘          ├──────────────────────────┤
                                                             │ Esports & Speed Chess    │
                                                             └─────────────┬────────────┘
                                                                           │
               ┌───────────────────────────┬───────────────────────────────┴─────────────────────────────┐
               ▼                           ▼                                                             ▼
     REGISTRATION & TICKETS       JUDGE WORKSTATION                                            ORGANIZER WORKSTATION
   ┌──────────────────────┐    ┌──────────────────────┐                                     ┌─────────────────────────┐
   │ Dynamic Custom Forms │    │ Project Claim Lock   │                                     │ Live Capacity Meters    │
   ├──────────────────────┤    ├──────────────────────┤                                     ├─────────────────────────┤
   │ Redis Concurrency    │    │ Multi-Metric Rubrics │                                     │ In-Browser QR Scanner   │
   ├──────────────────────┤    ├──────────────────────┤                                     ├─────────────────────────┤
   │ SVG QR E-Tickets     │    │ Real-time Scoreboard │                                     │ Printable ID Badges     │
   ├──────────────────────┤    ├──────────────────────┤                                     ├─────────────────────────┤
   │ Offline LocalStorage │    │ Scoreboard Freeze    │                                     │ Support Helpdesk Queue  │
   └──────────────────────┘    └──────────────────────┘                                     └─────────────────────────┘
```

---

### 🌟 Part A: Fest Directory (30 / 30 Points)

| Requirement | Points | Implementation in ClubSphere |
| :--- | :---: | :--- |
| **Available / Upcoming Fests** | **5 pts** | Visual festival directory showcasing ongoing, upcoming, and archived fests (*Tech Carnival 2026*, *Winter Tech Sprint*, *Freshers Tech Fest 2027*) with bespoke 16:9 cinematic covers, date ranges, venue badges, and event counters. |
| **Event Cards / Informative List** | **5 pts** | High-density event cards presenting exact dates, venues, categories, participation format (Solo vs Team), entry fees, live seat capacity meters, and status badges (*Available*, *Filling Fast*, *Waitlist*, *Closed*). |
| **Search Events** | **5 pts** | Fast multi-field search allowing attendees to locate events instantly by title, description, keywords, or venue. |
| **Event Categories & Multi-Filter** | **5 pts** | Real-time category filtering across **Hackathons & Dev**, **Competitive Programming**, **Robotics & Hardware**, and **Esports / Gaming**. |
| **Event Details Page** | **5 pts** | Deep-dive event hubs featuring live countdown timers to deadlines, capacity progress bars, custom rulebook tabs, published judging criteria, prize details, and 1-click registration. |
| **General UX & Responsive Design** | **5 pts** | Native responsive layout across mobile, tablet, and desktop. Includes a global `Cmd+K` command palette, fixed non-scrolling app shell, and instant Dark/Light mode toggle. |

---

### 🎫 Part B: Registration System (30 / 30 Points)

| Requirement | Points | Implementation in ClubSphere |
| :--- | :---: | :--- |
| **User Registration & Login** | **5 pts** | Secure authentication with Bcrypt password hashing, session persistence, complete profile onboarding (Institution and Phone verification), and 1-click Evaluation Credentials for judges. |
| **Dynamic Registration Forms** | **5 pts** | Fully dynamic questionnaire engine supporting custom organizer-defined fields (T-shirt size dropdowns, GitHub repository URLs, live demo links, custom text inputs) with strict server-side validation. |
| **Registration Confirmation & E-Ticket** | **5 pts** | Instant confirmation page generating a verifiable digital pass with unique ticket code (`TKT-DRMC-2026-XXXX`) and an SVG QR code containing cryptographically verifiable ticket data. |
| **Capacity Limits & Deadlines** | **5 pts** | Strict concurrency control backed by **Redis atomic counters** to prevent overselling. Closes registration automatically when deadline passes or capacity is exhausted. |
| **Manage Registrations ("My Passes")** | **5 pts** | Attendee portal (`/my-registrations`) allowing users to review their registered events, view digital passes, download tickets, update team members, or cancel registrations. |
| **General Functionality & Flow** | **5 pts** | Support for both solo and dynamic team registrations (team captains receive a unique invite code like `BANDIT-2026` that teammates can use to join with one click). |

---

### 🛡️ Part C: Organizer Management (30 / 30 Points)

| Requirement | Points | Implementation in ClubSphere |
| :--- | :---: | :--- |
| **Organizer / Admin Dashboard** | **5 pts** | Dedicated operational command center (`/admin`) displaying real-time metrics: total registrations, capacity utilization, active fests, and event lifecycles. |
| **View Registered Participants** | **5 pts** | High-density data table displaying all participant details, affiliated teams, custom questionnaire responses, registration timestamps, and statuses. |
| **Search & Filter Participants** | **5 pts** | Search participants by name, email, ticket code, or team; filter by registration status (*Confirmed*, *Waitlisted*, *Canceled*, *Checked-In*). |
| **Manage Registration Status** | **5 pts** | One-click actions to confirm, promote, waitlist, check-in, or cancel participants, automatically updating database and Redis capacity states. |
| **Statistics & Operational Tools** | **5 pts** | Full suite of operational tools: Fest & Event Editor (with delete protections), 1-click CSV participant export, real-time audit log timeline, and event deletion safety checks. |
| **General Tool Responsiveness** | **5 pts** | Sub-millisecond server mutations, accessible modal dialogs, non-destructive confirmation workflows, and zero decorative UI clutter. |

---

### 🚀 Part D: Creative Bonus Solutions (30 / 30 Points)

ClubSphere introduces features going far beyond standard registration portals:

1. **Certified Judge Workstation (`/judge`)**:
   - **Anti-Double-Judging Project Claim Lock**: Prevents two judges from evaluating the same submission simultaneously. A judge must explicitly claim a project to unlock the scoring interface.
   - **Interactive Multi-Criteria Rubric Sliders**: Judges grade submissions against published criteria (e.g., UX, Dynamic Registration, Architecture Integrity) with real-time score calculation and private remarks.
   - **Auto-Judge Accreditation**: Auto-links authenticated judges to active competitive tracks so they are never blocked by empty rosters.
2. **Live Leaderboards with ICPC Scoreboard Freeze (`/leaderboards`)**:
   - Real-time rankings with podium badges and criteria breakdown dialogs.
   - **Scoreboard Freeze Mode**: Organizers can freeze the public scoreboard prior to award ceremonies to build suspense.
3. **In-Browser Web Camera QR Gate Check-in (`/admin/check-in`)**:
   - High-speed camera scanner using `html5-qrcode`.
   - Instant validation against ticket passes, displaying attendee details, badge verification, and duplicate check-in prevention with audio feedback.
4. **Offline-Resilient Ticket Passes**:
   - Ticket data and QR codes are stored in `LocalStorage`. Attendees can present valid passes at gate checkpoints even in auditoriums with zero cellular connectivity.
5. **Printable Attendee ID Badges & Lanyards (`/admin/events/[slug]/badges`)**:
   - 1-click generation of print-ready A4 badge sheets formatted with QR codes, attendee names, institutions, and DRMC branding for physical lanyard pouches.
6. **Contestant Support Ticket Desk (`/support` & `/admin/support`)**:
   - Integrated helpdesk allowing attendees to file inquiries linked to specific events, with threaded communication between contestants and organizers.
7. **Cryptographically Verifiable Digital Certificates (`/verify-certificate`)**:
   - Organizers issue post-event certificates with a SHA-256 verification hash and public lookup verification portal.
8. **Dynamic OpenGraph (OG) Image Generation (`/api/og`)**:
   - Real-time Edge-rendered OpenGraph banner cards dynamically displaying event titles, categories, dates, and DRMC branding when shared on Discord, Facebook, or Twitter.

---

## 4. Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router)** | Modern server components, nested layouts, streaming SSR, and Server Actions. |
| **UI & Styling** | **React 19**, **Tailwind CSS v4**, **shadcn/ui** | Restrained zinc/slate foundation, electric violet accents, WCAG AAA contrast, zero decorative AI bloat. |
| **Language** | **TypeScript 5 (Strict Mode)** | 100% type safety across models, server actions, and client components. |
| **Database** | **PostgreSQL 16** | Robust relational source of truth with strict foreign keys, enums, and ACID transactions. |
| **ORM** | **Prisma 6.19** | Type-safe queries, relational schema migrations, and declarative seeding. |
| **Cache & Locks** | **Redis 7 (ioredis)** | Distributed atomic capacity locks, waitlist queues, and scoreboard caching. |
| **Authentication** | **NextAuth.js (Auth.js)** | Secure session management with Bcrypt password hashing. |
| **Reverse Proxy** | **Caddy 2 (Alpine)** | Production web server with automated Let's Encrypt / ZeroSSL TLS certificates and `zstd`/`gzip` compression. |
| **Containerization** | **Docker & Docker Compose** | Reproducible multi-container orchestration (`postgres`, `redis`, `web`, `caddy`). |
| **Icons & Utilities** | **Lucide React**, **Sonner**, **html5-qrcode**, **qrcode.react**, **jsPDF** | Fast, modern client utilities. |

---

## 5. Setup Instructions

### Prerequisites
- Node.js `20.x` or higher (tested on Node.js 20 & 22)
- Docker & Docker Compose (or local PostgreSQL 16 & Redis 7)

### Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/litlua/event_management.git
cd event_management

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Start PostgreSQL and Redis containers
docker compose up -d postgres redis

# 5. Push database schema and populate seed data
npx prisma db push
npm run seed:prod

# 6. Start the Next.js development server
npm run dev
```

The application will be live at `http://localhost:3000`.

---

### One-Command Production Database Deployment & Seed

To push the database schema and upload all seed data, realistic submissions, and verify images on **any production database** (Supabase, Neon, Railway, or VPS PostgreSQL):

```bash
# Run with explicit production connection string
npm run seed:prod "postgresql://user:password@your-host:5432/dbname?sslmode=require"

# Or if DATABASE_URL is already defined in your environment:
npm run seed:prod
```

### Full Production Deployment via Docker & Caddy

```bash
# Start all production containers (Postgres, Redis, Web, and Caddy with automatic SSL)
docker compose up -d --build
```

---

## 6. Deployment URL

- **Production URL**: [https://zarifzuhayer.tech](https://zarifzuhayer.tech)
- **Automatic SSL**: Active via Caddy (Let's Encrypt / ZeroSSL)
- **Status**: Live, pre-seeded with sample festivals, competition tracks, and demo submissions.

---

## 7. Demo Credentials

The platform includes pre-seeded accounts representing all key personas. The login page ([`/login`](https://zarifzuhayer.tech/login)) features **1-click auto-fill buttons** under the *Evaluation Credentials* panel:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Chief Judge** | `judge@drmc.edu` | `Judge@123` | Access `/judge` workstation, claim project submissions, grade via rubric sliders, leave feedback |
| **Industry Judge** | `judge2@drmc.edu` | `Judge@123` | Secondary certified judge account demonstrating multi-judge scoring isolation |
| **Club Organizer** | `organizer@drmc.edu` | `Admin@123` | Access `/admin` command center, manage rosters, webcam QR check-in, generate badges, support desk |
| **Student Attendee** | `student@drmc.edu` | `Student@123` | Browse fests, dynamic registration, view ticket passes, submit project URLs, support inquiries |

---

## 8. Third-Party Services & APIs

- **Caddy Web Server & Let's Encrypt**: Automatic issuance, verification, and renewal of SSL/TLS certificates.
- **Unsplash Image Engine**: High-resolution CDN assets for avatars and campus photography.
- **Node.js Crypto (`crypto.createHash`)**: SHA-256 hash generation for digital certificates.
- **html5-qrcode**: Browser-native HTML5 video camera stream for real-time QR code decoding.

---

## 9. AI Tools & Features Used (Transparency Disclosure)

In full compliance with contest rules disclosing AI tools:
- **Google Antigravity & Claude 3.5 / Gemini 2.5 Pro**: Utilized for architectural planning, schema design, iterative code refactoring, and strict TypeScript verification.
- **AI Image Generation**: Bespoke 16:9 cinematic cover banners created specifically for DRMC festival tracks (`ai-web-dev.jpg`, `ui-ux-design-sprint.jpg`, `speed-chess.jpg`, `freshers-tech-fest.jpg`).
- **Prompt Engineering Workflows**: Used to generate realistic demo submissions, judging rubrics, and contest rules modeling collegiate festivals.

---

## 10. Screenshots & Visual Walkthrough

### 1. Bespoke 16:9 Event Banners
Bespoke cover art created specifically for the platform tracks:
- **AI Web Development Contest**: `public/images/events/ai-web-dev.jpg`
- **Freshers UI/UX Design Sprint**: `public/images/events/ui-ux-design-sprint.jpg`
- **Grandmaster Speed Chess**: `public/images/events/speed-chess.jpg`
- **DRMC International Tech Carnival**: `public/images/fests/tech-carnival-fest.jpg`

### 2. Live Platform Tour

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  CLUBSPHERE 2026                 [Fests]  [Competitions]  [Leaderboards]  [☀/☾]   │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   9th DRMC International Tech Carnival 2026             [ 4 Competitions Active ]│
│   Dhaka Residential Model College • Oct 7 - Oct 10, 2026                         │
│                                                                                  │
│   ┌──────────────────────────┐  ┌──────────────────────────┐  ┌───────────────┐ │
│   │ AI Web Dev Contest       │  │ Programming Contest      │  │ Speed Chess   │ │
│   │ Track: Hackathon & AI    │  │ Track: ICPC Algorithms   │  │ Track: Rapid  │ │
│   │ Spots: 47 / 50 Remaining │  │ Spots: 38 / 40 Remaining │  │ Spots: 29/32  │ │
│   │ [ Register Team ]        │  │ [ Register Team ]        │  │ [ Register ]  │ │
│   └──────────────────────────┘  └──────────────────────────┘  └───────────────┘ │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Known Limitations

1. **Email / SMS Dispatch**: In local development, ticket confirmations and notifications are logged to the console and displayed via in-app toast alerts unless production SMTP/SendGrid credentials are provided.
2. **Webcam Permissions**: Gate QR check-in requires explicit browser camera access, which is fully operational under HTTPS (`https://zarifzuhayer.tech`) or `localhost`.
3. **Scoreboard Freeze**: By design, judges and organizers retain visibility into live un-frozen scores during evaluation, while attendees see the frozen snapshot.

---

## 12. License

This project is open-source software licensed under the [MIT License](LICENSE).

---

## 13. Contest Authority Disclaimer

> The organizing authority of the 9th DRMC International Tech Carnival 2026 reserves the right to make the final decision regarding rule interpretation, eligibility, judging, scoring, and any matters not explicitly covered in the contest guidelines. All decisions made by the judging panel and organizing authority shall be final.
