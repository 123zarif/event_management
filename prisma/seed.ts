import { 
  PrismaClient, 
  Role, 
  FestStatus, 
  EventCategory, 
  RegistrationStatus, 
  SupportCategory, 
  SupportPriority, 
  TicketStatus 
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting complete clean database seed for DRMC IT Club...');

  // 1. Clean existing records in safe relational order
  await prisma.auditLog.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.eventJudge.deleteMany();
  await prisma.judgeScore.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.team.deleteMany();
  await prisma.event.deleteMany();
  await prisma.category.deleteMany();
  await prisma.fest.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Purged all existing records cleanly.');

  // 2. Hash default passwords
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const judgePassword = await bcrypt.hash('Judge@123', 10);
  const studentPassword = await bcrypt.hash('Student@123', 10);

  // 3. Seed Users
  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@drmc.edu',
      passwordHash: adminPassword,
      name: 'DRMC IT Club Executive',
      role: Role.ORGANIZER,
      institution: 'Dhaka Residential Model College',
      phone: '+880 1711 000001',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const judge = await prisma.user.create({
    data: {
      email: 'judge@drmc.edu',
      passwordHash: judgePassword,
      name: 'Dr. Tahmid Rahman',
      role: Role.JUDGE,
      institution: 'DRMC Department of Computer Science & Engineering',
      phone: '+880 1711 000002',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const judge2 = await prisma.user.create({
    data: {
      email: 'judge2@drmc.edu',
      passwordHash: judgePassword,
      name: 'Engr. Farhana Yasmin',
      role: Role.JUDGE,
      institution: 'Dhaka University IT Alumni & Lead Architect',
      phone: '+880 1711 000012',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@drmc.edu',
      passwordHash: studentPassword,
      name: 'Tanvir Hasan',
      role: Role.ATTENDEE,
      institution: 'Dhaka Residential Model College',
      phone: '+880 1711 000003',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'sadia@gmail.com',
      passwordHash: studentPassword,
      name: 'Sadia Sultana',
      role: Role.ATTENDEE,
      institution: 'Notre Dame College',
      phone: '+880 1711 000004',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: 'rahim@gmail.com',
      passwordHash: studentPassword,
      name: 'Rahim Chowdhury',
      role: Role.ATTENDEE,
      institution: 'Saint Joseph Higher Secondary School',
      phone: '+880 1711 000005',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  const student4 = await prisma.user.create({
    data: {
      email: 'tasnim@buet.ac.bd',
      passwordHash: studentPassword,
      name: 'Tasnim Anjum',
      role: Role.ATTENDEE,
      institution: 'Bangladesh University of Engineering and Technology',
      phone: '+880 1711 000006',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    },
  });

  const student5 = await prisma.user.create({
    data: {
      email: 'asif@du.ac.bd',
      passwordHash: studentPassword,
      name: 'Asif Mahmud',
      role: Role.ATTENDEE,
      institution: 'University of Dhaka',
      phone: '+880 1711 000007',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    },
  });

  const student6 = await prisma.user.create({
    data: {
      email: 'nabila@iut-dhaka.edu',
      passwordHash: studentPassword,
      name: 'Nabila Zannat',
      role: Role.ATTENDEE,
      institution: 'Islamic University of Technology',
      phone: '+880 1711 000008',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
  });

  // 4. Seed Organization
  const org = await prisma.organization.create({
    data: {
      slug: 'drmc-it-club',
      name: 'DRMC Information Technology Club',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      bannerUrl: '/images/fests/tech-carnival-fest.jpg',
      description: 'Dhaka Residential Model College Information Technology Club — Championing competitive programming, robotics, AI, and smart club operations since 2012.',
      website: 'https://drmcitclub.org',
    },
  });

  // 5. Seed Categories
  const catHackathon = await prisma.category.create({
    data: {
      name: 'Hackathons & Dev',
      slug: 'hackathons',
      description: 'Rapid software engineering, full-stack applications, and AI innovation sprints.',
      color: 'violet',
    },
  });

  const catContest = await prisma.category.create({
    data: {
      name: 'Competitive Programming',
      slug: 'competitive-programming',
      description: 'Rigorous algorithmic challenges, data structures, and ICPC-format speed contests.',
      color: 'blue',
    },
  });

  const catRobotics = await prisma.category.create({
    data: {
      name: 'Robotics & Hardware',
      slug: 'robotics-hardware',
      description: 'Autonomous micro-rovers, line-tracking bots, and hardware circuit integrations.',
      color: 'emerald',
    },
  });

  const catGaming = await prisma.category.create({
    data: {
      name: 'Esports Championship',
      slug: 'esports-championship',
      description: 'Collegiate LAN esports tournaments, tactical shooters, and referee-scored brackets.',
      color: 'amber',
    },
  });

  // 6. Seed Festivals
  const techCarnival = await prisma.fest.create({
    data: {
      slug: '9th-drmc-international-tech-carnival-2026',
      title: '9th DRMC International Tech Carnival 2026',
      description: 'The premier national collegiate technology festival featuring programming contests, AI hackathons, robotics challenges, and esports arena.',
      bannerUrl: '/images/fests/tech-carnival-fest.jpg',
      startDate: new Date('2026-10-07T09:00:00Z'),
      endDate: new Date('2026-10-10T19:00:00Z'),
      location: 'Dhaka Residential Model College Campus, Mirpur Road, Dhaka',
      status: FestStatus.ONGOING,
      organizationId: org.id,
    },
  });

  const winterTechFest = await prisma.fest.create({
    data: {
      slug: 'winter-tech-innovation-sprint-2026',
      title: 'DRMC Winter Tech Innovation Sprint 2026',
      description: 'Focused sprint series empowering junior engineers and algorithm solvers with hands-on labs and mentor judging.',
      bannerUrl: '/images/fests/winter-tech-fest.jpg',
      startDate: new Date('2026-11-20T10:00:00Z'),
      endDate: new Date('2026-11-22T18:00:00Z'),
      location: 'DRMC Computer Science Pavilion',
      status: FestStatus.UPCOMING,
      organizationId: org.id,
    },
  });

  const freshersTechFest = await prisma.fest.create({
    data: {
      slug: 'freshers-tech-fest-2027',
      title: 'DRMC Freshers Tech Fest 2027',
      description: 'Flagship welcoming festival introducing incoming students to computer science, web design, and tech leadership.',
      bannerUrl: '/images/fests/freshers-tech-fest.jpg',
      startDate: new Date('2027-01-15T09:00:00Z'),
      endDate: new Date('2027-01-17T17:00:00Z'),
      location: 'DRMC Campus Grounds, Dhaka',
      status: FestStatus.UPCOMING,
      organizationId: org.id,
    },
  });

  // 7. Seed Competitions under Tech Carnival 2026
  const aiWebDev = await prisma.event.create({
    data: {
      slug: 'ai-web-development-contest',
      title: 'AI Web Development Contest',
      createdById: organizer.id,
      description: 'Theme: Smart Club Operations. Build a production-ready web platform eliminating Google Forms for student clubs with dynamic registration, ticketing, and live competition judging.',
      rules: '1. MIT License required. 2. Must be fully responsive across mobile, tablet, and desktop. 3. Working live deployment required for judges. 4. Pre-seeded demo data required.',
      category: EventCategory.HACKATHON,
      categoryId: catHackathon.id,
      festId: techCarnival.id,
      venue: 'Main Computer Science Lab & Remote',
      eventDate: new Date('2026-10-09T18:00:00Z'),
      registrationDeadline: new Date('2026-10-09T11:59:59Z'),
      capacity: 50,
      fee: 0,
      isTeamEvent: true,
      minTeamSize: 1,
      maxTeamSize: 4,
      customFields: [
        { id: 'tshirt', label: 'T-Shirt Size', type: 'select', options: ['S', 'M', 'L', 'XL', '2XL'], required: true },
        { id: 'github', label: 'GitHub Repository URL', type: 'text', placeholder: 'https://github.com/...', required: true },
        { id: 'deploy', label: 'Live Deployment URL', type: 'text', placeholder: 'https://...', required: true },
      ],
      isScoreboardFrozen: false,
      bannerUrl: '/images/events/ai-web-dev.jpg',
      isJudgingPublished: true,
      judgingCriteria: [
        { id: 'festDirectoryUX', name: 'Fest & Directory UX', maxScore: 30, description: 'Design hierarchy, visual restraint, and navigation fluidness' },
        { id: 'registrationSystem', name: 'Dynamic Registration & Ticketing', maxScore: 30, description: 'Custom forms, real-time ticket generation, and QR scan flow' },
        { id: 'organizerManagement', name: 'Organizer Workstation & Dashboard', maxScore: 30, description: 'Event lifecycle management, judging assignments, and analytics' },
        { id: 'bonusSolutions', name: 'Performance & Architecture Integrity', maxScore: 30, description: 'Transactional safety, concurrency control, and zero UI bloat' },
      ],
    },
  });

  const ncpc = await prisma.event.create({
    data: {
      slug: 'national-programming-contest',
      title: 'National Collegiate Programming Contest',
      createdById: organizer.id,
      description: 'ICPC-format algorithmic programming contest featuring 10 rigorous algorithmic challenges over 5 intense hours.',
      rules: 'ICPC scoring rules apply. 1 PC per team of 3 contestants. Internet access restricted to contest environment.',
      category: EventCategory.CONTEST,
      categoryId: catContest.id,
      festId: techCarnival.id,
      venue: 'DRMC Central Lab 1 & 2',
      eventDate: new Date('2026-10-08T10:00:00Z'),
      registrationDeadline: new Date('2026-10-07T23:59:59Z'),
      capacity: 40,
      fee: 500,
      isTeamEvent: true,
      minTeamSize: 3,
      maxTeamSize: 3,
      customFields: [
        { id: 'coach', label: 'Coach / Faculty Advisor Name', type: 'text', placeholder: 'Prof. ...', required: true },
        { id: 'language', label: 'Primary Programming Language', type: 'select', options: ['C++', 'Java', 'Python', 'Rust'], required: true },
      ],
      isScoreboardFrozen: false,
      bannerUrl: '/images/events/programming-contest.jpg',
      isJudgingPublished: true,
      judgingCriteria: [
        { id: 'optimality', name: 'Algorithmic Optimality', maxScore: 30, description: 'Correctness, optimal time/space complexity, and mathematical proofs' },
        { id: 'edgecases', name: 'Edge Case Resilience', maxScore: 30, description: 'Handling extreme integer bounds, empty graphs, and cyclic constraints' },
        { id: 'speed', name: 'Submissions Velocity & Penalties', maxScore: 30, description: 'Fast solve times and minimal wrong attempt penalties' },
        { id: 'cleanliness', name: 'Code Quality & Structure', maxScore: 30, description: 'Modular templates, readability, and clean variable abstractions' },
      ],
    },
  });

  const robotics = await prisma.event.create({
    data: {
      slug: 'autonomous-robotics-challenge',
      title: 'Autonomous Robotics Challenge (Line Follower & Maze)',
      createdById: organizer.id,
      description: 'Precision robotics competition where autonomous rovers navigate dynamic obstacle grids and line mazes against the clock.',
      rules: 'Rover dimensions must not exceed 25cm x 25cm x 20cm. Max weight 2.5kg. Must operate fully autonomously without external RF control.',
      category: EventCategory.ROBOTICS,
      categoryId: catRobotics.id,
      festId: techCarnival.id,
      venue: 'Indoor Gymnasium Arena',
      eventDate: new Date('2026-10-07T14:00:00Z'),
      registrationDeadline: new Date('2026-10-06T20:00:00Z'),
      capacity: 32,
      fee: 800,
      isTeamEvent: true,
      minTeamSize: 2,
      maxTeamSize: 4,
      customFields: [
        { id: 'mcu', label: 'Microcontroller Architecture', type: 'select', options: ['ESP32', 'STM32', 'Arduino Mega', 'RP2040'], required: true },
        { id: 'weight', label: 'Estimated Rover Weight (grams)', type: 'text', placeholder: 'e.g. 1850', required: true },
      ],
      isScoreboardFrozen: false,
      bannerUrl: '/images/events/robotics-challenge.jpg',
      isJudgingPublished: true,
      judgingCriteria: [
        { id: 'lapTime', name: 'Track Lap Speed & Velocity', maxScore: 30, description: 'Chronometer verified lap completion time through the full course' },
        { id: 'precision', name: 'Line Tracking Precision & PID Control', maxScore: 30, description: 'Minimal jitter on sharp 90-degree corners and smooth intersection navigation' },
        { id: 'engineering', name: 'Hardware & Circuit Engineering', maxScore: 30, description: 'Custom PCB design, wire management, and structural rigidity' },
        { id: 'recovery', name: 'Autonomous Fault Recovery', maxScore: 30, description: 'Automatic re-calibration when track contrast fluctuates' },
      ],
    },
  });

  const gaming = await prisma.event.create({
    data: {
      slug: 'valorant-champions-cup',
      title: 'Valorant Champions Invitational',
      createdById: organizer.id,
      description: '5v5 tactical shooter tournament on LAN. Certified referee and judge evaluation across tactical set plays, objective map control, sportsmanship, and individual MVP turnaround impact.',
      rules: 'Standard Riot competitive rulebook. Certified judge rubric evaluation.',
      category: EventCategory.GAMING,
      categoryId: catGaming.id,
      festId: techCarnival.id,
      venue: 'Auditorium Esports Stage',
      eventDate: new Date('2026-10-08T15:00:00Z'),
      registrationDeadline: new Date('2026-10-06T18:00:00Z'),
      capacity: 16,
      fee: 1000,
      isTeamEvent: true,
      minTeamSize: 5,
      maxTeamSize: 5,
      customFields: [
        { id: 'igl', label: 'In-Game Leader (IGL) Riot ID', type: 'text', placeholder: 'Username#TAG', required: true },
      ],
      isScoreboardFrozen: false,
      bannerUrl: '/images/events/valorant-champions.jpg',
      isJudgingPublished: true,
      judgingCriteria: [
        { id: 'tactics', name: 'Tactical Strategy & Set Plays', maxScore: 30, description: 'Site executes, defensive utility usage, and crossfire discipline' },
        { id: 'objectives', name: 'Objective & Map Control', maxScore: 30, description: 'Spike plant efficiency, map territory retention, and trade frag consistency' },
        { id: 'fairplay', name: 'Fair Play, Sportsmanship & Comms', maxScore: 30, description: 'Strict tournament rules adherence, team communication, and verified equipment integrity' },
        { id: 'mvp', name: 'Individual Mastery & MVP Performance', maxScore: 30, description: 'Clutch round conversions, mechanical precision, and turnaround impact' },
      ],
    },
  });

  const chess = await prisma.event.create({
    data: {
      slug: 'grandmaster-speed-chess',
      title: 'Grandmaster Speed Chess Championship',
      createdById: organizer.id,
      description: 'FIDE rated rapid and blitz chess championship. 7-round Swiss system followed by knockout tie-breakers on electronic DGT sensor boards.',
      rules: 'FIDE Rapid Time Control: 10 min + 5 sec increment. Strict anti-cheating digital screening.',
      category: EventCategory.CONTEST,
      categoryId: catContest.id,
      festId: techCarnival.id,
      venue: 'DRMC Executive Conference Hall',
      eventDate: new Date('2026-10-07T09:00:00Z'),
      registrationDeadline: new Date('2026-10-06T22:00:00Z'),
      capacity: 32,
      fee: 300,
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      customFields: [
        { id: 'fideRating', label: 'FIDE or Lichess Classical Rating', type: 'text', placeholder: 'e.g. 1950', required: true },
      ],
      isScoreboardFrozen: false,
      bannerUrl: '/images/events/speed-chess.jpg',
      isJudgingPublished: true,
      judgingCriteria: [
        { id: 'tactics', name: 'Tactical Vision & Calculation', maxScore: 30, description: 'Combinative play, piece sacrifices, and tactical counterplay execution' },
        { id: 'positional', name: 'Positional Mastery & Pawn Structure', maxScore: 30, description: 'Pawn structure management, outpost control, and weak square exploitation' },
        { id: 'clock', name: 'Time Management Under Pressure', maxScore: 30, description: 'Decision speed with increment preservation during complex middlegames' },
        { id: 'endgame', name: 'Endgame Technique & Conversion', maxScore: 30, description: 'King activity, passed pawn conversion, and theoretical draw holds' },
      ],
    },
  });

  // 8. Seed Competitions under Winter Tech Fest 2026
  const juniorRobotics = await prisma.event.create({
    data: {
      slug: 'junior-robotics-maker-sprint',
      title: 'Junior Robotics Maker Sprint',
      createdById: organizer.id,
      description: 'Hands-on hardware sprint where junior student teams build obstacle-avoidance rovers using provided sensor kits.',
      rules: 'Hardware kit provided. Teams must write original Arduino C++ control routines on-site.',
      category: EventCategory.ROBOTICS,
      categoryId: catRobotics.id,
      festId: winterTechFest.id,
      venue: 'DRMC Robotics Workshop Lab',
      eventDate: new Date('2026-11-21T11:00:00Z'),
      registrationDeadline: new Date('2026-11-18T18:00:00Z'),
      capacity: 24,
      fee: 400,
      isTeamEvent: true,
      minTeamSize: 2,
      maxTeamSize: 3,
      isScoreboardFrozen: false,
      bannerUrl: '/images/events/robotics-challenge.jpg',
      isJudgingPublished: true,
      judgingCriteria: [
        { id: 'sensors', name: 'Sensor Calibration', maxScore: 30, description: 'Ultrasonic and IR reflection sensor tuning accuracy' },
        { id: 'logic', name: 'Autonomous Logic Loop', maxScore: 30, description: 'State machine implementation and reactive turning response' },
        { id: 'hardware', name: 'Soldering & Assembly', maxScore: 30, description: 'Clean breadboarding, motor driver wiring, and chassis stability' },
        { id: 'demo', name: 'Live Course Run', maxScore: 30, description: 'Flawless traversal through the junior obstacle arena' },
      ],
    },
  });

  // 9. Seed Competitions under Freshers Tech Fest 2027
  const freshersUiSprint = await prisma.event.create({
    data: {
      slug: 'freshers-ui-ux-design-sprint',
      title: 'Freshers UI/UX Design Sprint',
      createdById: organizer.id,
      description: 'Design contest for new collegiate students: redesign a public service or campus portal with high-contrast accessibility, component tokens, and modern user hierarchies.',
      rules: 'Figma prototypes required. Mobile-first design system required with responsive desktop adaptations.',
      category: EventCategory.HACKATHON,
      categoryId: catHackathon.id,
      festId: freshersTechFest.id,
      venue: 'DRMC Multimedia Design Studio',
      eventDate: new Date('2027-01-16T10:00:00Z'),
      registrationDeadline: new Date('2027-01-14T23:59:59Z'),
      capacity: 30,
      fee: 0,
      isTeamEvent: true,
      minTeamSize: 1,
      maxTeamSize: 2,
      isScoreboardFrozen: false,
      bannerUrl: '/images/events/ui-ux-design-sprint.jpg',
      isJudgingPublished: true,
      judgingCriteria: [
        { id: 'visuals', name: 'Visual Hierarchy & Typography', maxScore: 30, description: 'Restrained typography, deliberate whitespace, and WCAG AAA contrast' },
        { id: 'components', name: 'Component System Architecture', maxScore: 30, description: 'Reusable Figma tokens, variant states, and auto-layout discipline' },
        { id: 'ux', name: 'User Flow Simplicity', maxScore: 30, description: 'Task completion efficiency with minimum friction and cognitive load' },
        { id: 'prototype', name: 'Interactive Micro-interactions', maxScore: 30, description: 'Functional transitions and interactive component states' },
      ],
    },
  });

  // 10. Assign Certified Judges to All Competitions
  const eventsToAssign = [aiWebDev, ncpc, robotics, gaming, chess, juniorRobotics, freshersUiSprint];
  for (const ev of eventsToAssign) {
    await prisma.eventJudge.create({
      data: {
        eventId: ev.id,
        judgeId: judge.id,
      },
    });
    await prisma.eventJudge.create({
      data: {
        eventId: ev.id,
        judgeId: judge2.id,
      },
    });
  }

  // 11. Seed Teams
  const teamAlpha = await prisma.team.create({
    data: {
      name: 'ByteBandits',
      inviteCode: 'BANDIT-2026',
      eventId: aiWebDev.id,
      captainId: student.id,
    },
  });
  await prisma.teamMember.create({ data: { teamId: teamAlpha.id, userId: student.id } });

  const teamDevDynasty = await prisma.team.create({
    data: {
      name: 'DevDynasty',
      inviteCode: 'DEV-DYNASTY',
      eventId: aiWebDev.id,
      captainId: student4.id,
    },
  });
  await prisma.teamMember.create({ data: { teamId: teamDevDynasty.id, userId: student4.id } });

  const teamCodeCrafters = await prisma.team.create({
    data: {
      name: 'CodeCrafters',
      inviteCode: 'CRAFTERS-26',
      eventId: aiWebDev.id,
      captainId: student5.id,
    },
  });
  await prisma.teamMember.create({ data: { teamId: teamCodeCrafters.id, userId: student5.id } });

  const teamUi1 = await prisma.team.create({
    data: {
      name: 'PixelPioneers',
      inviteCode: 'PIXEL-2027',
      eventId: freshersUiSprint.id,
      captainId: student2.id,
    },
  });
  await prisma.teamMember.create({ data: { teamId: teamUi1.id, userId: student2.id } });

  const teamUi2 = await prisma.team.create({
    data: {
      name: 'StudioNova',
      inviteCode: 'NOVA-2027',
      eventId: freshersUiSprint.id,
      captainId: student6.id,
    },
  });
  await prisma.teamMember.create({ data: { teamId: teamUi2.id, userId: student6.id } });

  const teamNCPC = await prisma.team.create({
    data: {
      name: 'CodeWarriors',
      inviteCode: 'WARRIOR-26',
      eventId: ncpc.id,
      captainId: student2.id,
    },
  });
  await prisma.teamMember.create({ data: { teamId: teamNCPC.id, userId: student2.id } });

  const teamRobo = await prisma.team.create({
    data: {
      name: 'RoboRangers',
      inviteCode: 'RANGER-2026',
      eventId: robotics.id,
      captainId: student3.id,
    },
  });
  await prisma.teamMember.create({ data: { teamId: teamRobo.id, userId: student3.id } });

  const teamGaming1 = await prisma.team.create({
    data: { name: 'ViperSquad', inviteCode: 'VIP-01', eventId: gaming.id, captainId: student.id },
  });
  const teamGaming2 = await prisma.team.create({
    data: { name: 'PhantomForce', inviteCode: 'PHA-02', eventId: gaming.id, captainId: student2.id },
  });
  const teamGaming3 = await prisma.team.create({
    data: { name: 'ApexStrikers', inviteCode: 'APX-03', eventId: gaming.id, captainId: student3.id },
  });

  // 12. Seed Registrations & Passes
  await prisma.registration.create({
    data: {
      eventId: aiWebDev.id,
      userId: student.id,
      teamId: teamAlpha.id,
      status: RegistrationStatus.CONFIRMED,
      ticketCode: 'TKT-DRMC-2026-0089',
      qrCodeData: JSON.stringify({
        ticketCode: 'TKT-DRMC-2026-0089',
        eventName: 'AI Web Development Contest',
        attendeeName: 'Tanvir Hasan',
        seat: 'Lab-A-12',
      }),
      responses: {
        tshirt: 'L',
        github: 'https://github.com/litlua/event_management',
        deploy: 'https://clubsphere.drmc.edu',
      },
    },
  });

  await prisma.registration.create({
    data: {
      eventId: aiWebDev.id,
      userId: student4.id,
      teamId: teamDevDynasty.id,
      status: RegistrationStatus.CONFIRMED,
      ticketCode: 'TKT-DRMC-2026-0092',
      qrCodeData: JSON.stringify({
        ticketCode: 'TKT-DRMC-2026-0092',
        eventName: 'AI Web Development Contest',
        attendeeName: 'Tasnim Anjum',
        seat: 'Lab-A-14',
      }),
      responses: {
        tshirt: 'M',
        github: 'https://github.com/buet-devs/aura-campus',
        deploy: 'https://aura-campus.vercel.app',
      },
    },
  });

  await prisma.registration.create({
    data: {
      eventId: aiWebDev.id,
      userId: student5.id,
      teamId: teamCodeCrafters.id,
      status: RegistrationStatus.CONFIRMED,
      ticketCode: 'TKT-DRMC-2026-0093',
      qrCodeData: JSON.stringify({
        ticketCode: 'TKT-DRMC-2026-0093',
        eventName: 'AI Web Development Contest',
        attendeeName: 'Asif Mahmud',
        seat: 'Lab-A-16',
      }),
      responses: {
        tshirt: 'XL',
        github: 'https://github.com/du-cs/nexus-fest',
        deploy: 'https://nexusfest.live',
      },
    },
  });

  await prisma.registration.create({
    data: {
      eventId: freshersUiSprint.id,
      userId: student2.id,
      teamId: teamUi1.id,
      status: RegistrationStatus.CONFIRMED,
      ticketCode: 'TKT-DRMC-2027-0101',
      qrCodeData: JSON.stringify({
        ticketCode: 'TKT-DRMC-2027-0101',
        eventName: 'Freshers UI/UX Design Sprint',
        attendeeName: 'Sadia Sultana',
        seat: 'Design-Studio-02',
      }),
      responses: {
        experience: 'Intermediate Figma UI designer',
      },
    },
  });

  await prisma.registration.create({
    data: {
      eventId: freshersUiSprint.id,
      userId: student6.id,
      teamId: teamUi2.id,
      status: RegistrationStatus.CONFIRMED,
      ticketCode: 'TKT-DRMC-2027-0102',
      qrCodeData: JSON.stringify({
        ticketCode: 'TKT-DRMC-2027-0102',
        eventName: 'Freshers UI/UX Design Sprint',
        attendeeName: 'Nabila Zannat',
        seat: 'Design-Studio-04',
      }),
      responses: {
        experience: 'Figma Auto-layout & Design Systems',
      },
    },
  });

  await prisma.registration.create({
    data: {
      eventId: ncpc.id,
      userId: student2.id,
      teamId: teamNCPC.id,
      status: RegistrationStatus.CONFIRMED,
      ticketCode: 'TKT-DRMC-2026-0090',
      qrCodeData: JSON.stringify({
        ticketCode: 'TKT-DRMC-2026-0090',
        eventName: 'National Collegiate Programming Contest',
        attendeeName: 'Sadia Sultana',
        seat: 'Lab-B-04',
      }),
      responses: {
        coach: 'Prof. Mohammad Shafiul Islam',
        language: 'C++',
      },
    },
  });

  await prisma.registration.create({
    data: {
      eventId: robotics.id,
      userId: student3.id,
      teamId: teamRobo.id,
      status: RegistrationStatus.CONFIRMED,
      ticketCode: 'TKT-DRMC-2026-0091',
      qrCodeData: JSON.stringify({
        ticketCode: 'TKT-DRMC-2026-0091',
        eventName: 'Autonomous Robotics Challenge',
        attendeeName: 'Rahim Chowdhury',
        seat: 'Arena-C-18',
      }),
      responses: {
        mcu: 'ESP32',
        weight: '1850',
      },
    },
  });

  await prisma.registration.create({
    data: {
      eventId: chess.id,
      userId: student3.id,
      status: RegistrationStatus.CONFIRMED,
      ticketCode: 'TKT-DRMC-2026-0094',
      qrCodeData: JSON.stringify({
        ticketCode: 'TKT-DRMC-2026-0094',
        eventName: 'Grandmaster Speed Chess Championship',
        attendeeName: 'Rahim Chowdhury',
        seat: 'Table-07',
      }),
      responses: {
        fideRating: '1985',
      },
    },
  });

  await prisma.registration.create({
    data: {
      eventId: gaming.id,
      userId: student.id,
      teamId: teamGaming1.id,
      status: RegistrationStatus.CONFIRMED,
      ticketCode: 'TKT-DRMC-2026-0095',
      qrCodeData: JSON.stringify({
        ticketCode: 'TKT-DRMC-2026-0095',
        eventName: 'Valorant Champions Invitational',
        attendeeName: 'Tanvir Hasan',
        seat: 'Stage-PC-01',
      }),
      responses: {
        igl: 'Tanvir#DRMC',
      },
    },
  });

  // 13. Seed Submissions & Judge Scoring
  // --- AI Web Dev Submissions ---

  // Submission 1 in AI Web Dev: CLAIMED by Dr. Tahmid Rahman, READY TO BE EVALUATED / SCORED by judge!
  await prisma.submission.create({
    data: {
      eventId: aiWebDev.id,
      teamId: teamAlpha.id,
      userId: student.id,
      title: 'ClubSphere — Smart Collegiate Club Operations & Competition Management Platform',
      repoUrl: 'https://github.com/litlua/event_management',
      liveDemoUrl: 'https://clubsphere.drmc.edu',
      videoUrl: 'https://youtu.be/drmc-clubsphere-demo',
      description: 'Production-ready platform replacing Google Forms for collegiate tech clubs. Features Next.js 15 App Router, zero UI bloat, PostgreSQL concurrency control, Redis waitlists, verifiable ticketing passes, and realtime gate QR check-ins.',
      claimedByJudgeId: judge.id,
      claimedAt: new Date(Date.now() - 3600000),
      revisionNumber: 2,
    },
  });

  // Submission 2 in AI Web Dev: UNCLAIMED (Ready for the judge to claim and score from scratch!)
  await prisma.submission.create({
    data: {
      eventId: aiWebDev.id,
      teamId: teamDevDynasty.id,
      userId: student4.id,
      title: 'AuraCampus — Event Orchestration & Cryptographic Certificate Delivery',
      repoUrl: 'https://github.com/buet-devs/aura-campus',
      liveDemoUrl: 'https://aura-campus.vercel.app',
      videoUrl: 'https://youtu.be/aura-campus-demo',
      description: 'Serverless event lifecycle engine featuring cryptographic SHA-256 certificate verification badges, automated team join codes, and dynamic multi-category schedule timelines.',
      claimedByJudgeId: null,
      revisionNumber: 1,
    },
  });

  // Submission 3 in AI Web Dev: ALREADY EVALUATED by Judge 2 (Engr. Farhana Yasmin) so the judge can view graded scorecards!
  const scoredSubmission = await prisma.submission.create({
    data: {
      eventId: aiWebDev.id,
      teamId: teamCodeCrafters.id,
      userId: student5.id,
      title: 'NexusFest — Real-Time Collegiate Hackathon Portal',
      repoUrl: 'https://github.com/du-cs/nexus-fest',
      liveDemoUrl: 'https://nexusfest.live',
      videoUrl: 'https://youtu.be/nexusfest-video',
      description: 'React 19 & Prisma event hub with dynamic multi-tier ticketing, websocket live scoreboards, and dark-mode first design tokens.',
      claimedByJudgeId: judge2.id,
      claimedAt: new Date(Date.now() - 7200000),
      revisionNumber: 1,
    },
  });

  await prisma.judgeScore.create({
    data: {
      submissionId: scoredSubmission.id,
      judgeId: judge2.id,
      criteriaBreakdown: {
        festDirectoryUX: 28,
        registrationSystem: 29,
        organizerManagement: 27,
        bonusSolutions: 28,
      },
      totalScore: 112,
      feedback: 'Excellent work! The responsive navigation and high-density dashboard layouts feel genuinely human-designed. The ticketing pass with QR validation is very smooth.',
    },
  });

  // --- Freshers UI/UX Design Sprint Submissions ---

  // Submission 1 in UI/UX Sprint: UNCLAIMED (Ready for judge to claim and score!)
  await prisma.submission.create({
    data: {
      eventId: freshersUiSprint.id,
      teamId: teamUi1.id,
      userId: student2.id,
      title: 'GovPass — Next-Gen Accessible Citizen Public Transit Portal',
      repoUrl: 'https://github.com/pixel-pioneers/govpass-design',
      liveDemoUrl: 'https://figma.com/@pixelpioneers/govpass-prototype',
      videoUrl: 'https://vimeo.com/govpass-walkthrough',
      description: 'Figma Community award-winning mobile-first design system with WCAG AAA typography scale, accessible tactile affordances, component variant states, and zero decorative noise.',
      claimedByJudgeId: null,
      revisionNumber: 1,
    },
  });

  // Submission 2 in UI/UX Sprint: CLAIMED by Dr. Tahmid Rahman (Ready for immediate scoring!)
  await prisma.submission.create({
    data: {
      eventId: freshersUiSprint.id,
      teamId: teamUi2.id,
      userId: student6.id,
      title: 'CampusPulse — Student Healthcare & Wellness Booking Flow',
      repoUrl: 'https://github.com/studionova/campus-pulse-figma',
      liveDemoUrl: 'https://figma.com/@studionova/campuspulse-interactive',
      videoUrl: 'https://vimeo.com/campuspulse-demo',
      description: 'Calm, stress-free clinical booking flow designed for first-year college students with biometric verification cues, clean schedule cards, and high-contrast color tokens.',
      claimedByJudgeId: judge.id,
      claimedAt: new Date(Date.now() - 1800000),
      revisionNumber: 1,
    },
  });

  // --- Other Competition Submissions ---

  // NCPC Submission: UNCLAIMED
  await prisma.submission.create({
    data: {
      eventId: ncpc.id,
      teamId: teamNCPC.id,
      userId: student2.id,
      title: 'Optimal Graph Flow & Segment Tree Solvers',
      repoUrl: 'https://github.com/ndc-cs/ncpc-2026-solutions',
      liveDemoUrl: 'https://cf-analyzer.dev',
      description: 'Complete verified algorithmic source codes with sub-second execution across all 10 problem sets.',
      claimedByJudgeId: null,
      revisionNumber: 1,
    },
  });

  // Robotics Submission: CLAIMED by Dr. Tahmid Rahman (Ready for evaluation!)
  await prisma.submission.create({
    data: {
      eventId: robotics.id,
      teamId: teamRobo.id,
      userId: student3.id,
      title: 'ApexLine Rover v2 Dual-PID Line Tracker',
      repoUrl: 'https://github.com/stjoseph-robotics/apex-rover-v2',
      liveDemoUrl: 'https://apexrover.io',
      description: 'Custom ESP32 firmware with optical surface sensor array and PID closed-loop steering.',
      claimedByJudgeId: judge.id,
      claimedAt: new Date(Date.now() - 900000),
      revisionNumber: 1,
    },
  });

  // Valorant Submission: UNCLAIMED
  await prisma.submission.create({
    data: {
      eventId: gaming.id,
      teamId: teamGaming1.id,
      userId: student.id,
      title: 'Tactical Playbook & Match VOD Analysis',
      repoUrl: 'https://github.com/vipersquad/valorant-strats',
      liveDemoUrl: 'https://tracker.gg/valorant/profile/vipersquad',
      description: 'Comprehensive defensive setup breakdowns, execute lineups, and coordinated utility timings.',
      claimedByJudgeId: null,
      revisionNumber: 1,
    },
  });

  // Chess Submission: UNCLAIMED
  await prisma.submission.create({
    data: {
      eventId: chess.id,
      userId: student3.id,
      title: 'Sicilian Defense Najdorf Variation Engine Preparation',
      repoUrl: 'https://github.com/rahim/chess-analysis',
      liveDemoUrl: 'https://lichess.org/study/najdorf-mastery',
      description: 'Deep engine-assisted opening preparation and endgame conversion trees for 7 tournament rounds.',
      claimedByJudgeId: null,
      revisionNumber: 1,
    },
  });

  // 14. Seed Support Ticket & Discussion Thread
  const ticket1 = await prisma.supportTicket.create({
    data: {
      userId: student.id,
      eventId: aiWebDev.id,
      subject: 'Inquiry regarding teammate replacement before deadline',
      category: SupportCategory.TEAM_ISSUES,
      priority: SupportPriority.NORMAL,
      status: TicketStatus.IN_PROGRESS,
      assignedToId: organizer.id,
    },
  });

  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket1.id,
      senderId: student.id,
      message: 'Hello organizers! One of our team members has an exam conflict. Can we substitute another student using our team invite code?',
    },
  });

  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket1.id,
      senderId: organizer.id,
      message: 'Hi Tanvir, yes! As long as the registration deadline has not passed, you can invite your new teammate directly.',
    },
  });

  // 15. Seed Audit Logs
  await prisma.auditLog.create({
    data: {
      action: 'FEST_PUBLISHED',
      entityType: 'Fest',
      entityId: techCarnival.id,
      actorId: organizer.id,
      metadata: { fest: '9th DRMC International Tech Carnival 2026', status: 'ONGOING' },
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'EVENT_CREATED',
      entityType: 'Event',
      entityId: aiWebDev.id,
      actorId: organizer.id,
      metadata: { event: 'AI Web Development Contest', capacity: 50 },
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'SCORE_SUBMITTED',
      entityType: 'Submission',
      entityId: scoredSubmission.id,
      actorId: judge2.id,
      metadata: { totalScore: 112, submissionTitle: 'NexusFest' },
    },
  });

  // 16. Seed Verified Certificate
  await prisma.certificate.create({
    data: {
      code: 'CERT-DRMC-2026-0089',
      recipientName: 'Tanvir Hasan',
      recipientEmail: 'student@drmc.edu',
      eventName: 'AI Web Development Contest',
      festName: '9th DRMC International Tech Carnival 2026',
      issueDate: new Date('2026-10-09T20:00:00Z'),
      verificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
  });

  console.log('✅ Fresh database seed completed successfully!');
  console.log('🖼️  Generated Cover Images Attached:');
  console.log('   - 9th Tech Carnival:   /images/fests/tech-carnival-fest.jpg');
  console.log('   - Winter Tech Fest:    /images/fests/winter-tech-fest.jpg');
  console.log('   - Freshers Tech Fest:  /images/fests/freshers-tech-fest.jpg');
  console.log('   - AI Web Dev:          /images/events/ai-web-dev.jpg');
  console.log('   - UI/UX Design Sprint: /images/events/ui-ux-design-sprint.jpg');
  console.log('   - Programming Contest: /images/events/programming-contest.jpg');
  console.log('   - Robotics Challenge:  /images/events/robotics-challenge.jpg');
  console.log('   - Esports Valorant:    /images/events/valorant-champions.jpg');
  console.log('   - Speed Chess:         /images/events/speed-chess.jpg');
  console.log('🔑 Demo credentials:');
  console.log('   - Organizer: organizer@drmc.edu / Admin@123');
  console.log('   - Chief Judge: judge@drmc.edu / Judge@123');
  console.log('   - Industry Judge: judge2@drmc.edu / Judge@123');
  console.log('   - Student:   student@drmc.edu / Student@123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
