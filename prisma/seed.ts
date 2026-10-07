import { PrismaClient, Role, FestStatus, EventCategory, SupportCategory, SupportPriority, TicketStatus, BracketRound } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for DRMC IT Club...');

  // 1. Clean existing records in safe order
  await prisma.auditLog.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.bracketMatch.deleteMany();
  await prisma.judgeScore.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.team.deleteMany();
  await prisma.event.deleteMany();
  await prisma.fest.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

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

  // 4. Seed Organization
  const org = await prisma.organization.create({
    data: {
      slug: 'drmc-it-club',
      name: 'DRMC Information Technology Club',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200',
      description: 'Dhaka Residential Model College Information Technology Club — Championing competitive programming, robotics, AI, and smart club operations since 2012.',
      website: 'https://drmcitclub.org',
    },
  });

  // 5. Seed Fests
  const techCarnival = await prisma.fest.create({
    data: {
      slug: 'tech-carnival-2026',
      title: '9th DRMC International Tech Carnival 2026',
      description: 'The nation’s most prestigious collegiate tech festival featuring hackathons, AI web development, programming contests, robotics combat, and esports.',
      bannerUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
      startDate: new Date('2026-10-04T09:00:00Z'),
      endDate: new Date('2026-10-09T23:59:59Z'),
      location: 'DRMC Main Auditorium & Computing Labs, Dhaka',
      status: FestStatus.ONGOING,
      organizationId: org.id,
    },
  });

  await prisma.fest.create({
    data: {
      slug: 'winter-tech-fest-2026',
      title: 'DRMC Winter Tech Fest 2026',
      description: 'Annual winter innovation bootcamp and sprint series for junior programmers and robotics engineers.',
      bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
      startDate: new Date('2026-11-20T10:00:00Z'),
      endDate: new Date('2026-11-24T18:00:00Z'),
      location: 'DRMC IT Center, Dhaka',
      status: FestStatus.UPCOMING,
      organizationId: org.id,
    },
  });

  await prisma.fest.create({
    data: {
      slug: 'freshers-tech-fest-2027',
      title: 'DRMC Freshers Tech Fest 2027',
      description: 'Flagship welcoming festival introducing incoming students to computer science, web design, and tech leadership.',
      bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200',
      startDate: new Date('2027-01-15T09:00:00Z'),
      endDate: new Date('2027-01-17T17:00:00Z'),
      location: 'DRMC Campus Grounds, Dhaka',
      status: FestStatus.UPCOMING,
      organizationId: org.id,
    },
  });

  // 6. Seed Events under Tech Carnival 2026
  const aiWebDev = await prisma.event.create({
    data: {
      slug: 'ai-web-development-contest',
      title: 'AI Web Development Contest',
      createdById: organizer.id,
      description: 'Theme: Smart Club Operations. Build a production-ready web platform eliminating Google Forms for student clubs with dynamic registration, ticketing, and live competition judging.',
      rules: '1. MIT License required. 2. Must be fully responsive across mobile, tablet, and desktop. 3. Working live deployment required for judges. 4. Pre-seeded demo data required.',
      category: EventCategory.HACKATHON,
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
      bannerUrl: '/images/events/ai-web-development.png',
    },
  });

  await prisma.event.create({
    data: {
      slug: 'national-programming-contest',
      title: 'National Collegiate Programming Contest',
      createdById: organizer.id,
      description: 'ICPC-format algorithmic programming contest featuring 10 rigorous algorithmic challenges over 5 intense hours.',
      rules: 'ICPC scoring rules apply. 1 PC per team of 3 contestants. Internet access restricted to contest environment.',
      category: EventCategory.CONTEST,
      festId: techCarnival.id,
      venue: 'DRMC Central Lab 1 & 2',
      eventDate: new Date('2026-10-08T10:00:00Z'),
      registrationDeadline: new Date('2026-10-07T23:59:59Z'),
      capacity: 40,
      fee: 500,
      isTeamEvent: true,
      minTeamSize: 3,
      maxTeamSize: 3,
      isScoreboardFrozen: false,
    },
  });

  await prisma.event.create({
    data: {
      slug: 'autonomous-robotics-challenge',
      title: 'Autonomous Robotics Challenge (Line Follower & Maze)',
      createdById: organizer.id,
      description: 'Precision robotics competition where autonomous rovers navigate dynamic obstacle grids and line mazes against the clock.',
      rules: 'Rover dimensions must not exceed 25cm x 25cm x 20cm. Max weight 2.5kg.',
      category: EventCategory.ROBOTICS,
      festId: techCarnival.id,
      venue: 'Indoor Gymnasium Arena',
      eventDate: new Date('2026-10-07T14:00:00Z'),
      registrationDeadline: new Date('2026-10-06T20:00:00Z'),
      capacity: 32,
      fee: 800,
      isTeamEvent: true,
      minTeamSize: 2,
      maxTeamSize: 4,
      isScoreboardFrozen: false,
    },
  });

  const gaming = await prisma.event.create({
    data: {
      slug: 'valorant-champions-cup',
      title: 'Valorant Champions Invitational',
      createdById: organizer.id,
      description: '5v5 tactical shooter tournament on LAN. Single-elimination knockout bracket with live casting on arena projectors.',
      rules: 'Standard Riot competitive rulebook. Tournament bracket progression.',
      category: EventCategory.GAMING,
      festId: techCarnival.id,
      venue: 'Auditorium Esports Stage',
      eventDate: new Date('2026-10-08T15:00:00Z'),
      registrationDeadline: new Date('2026-10-06T18:00:00Z'),
      capacity: 16,
      fee: 1000,
      isTeamEvent: true,
      minTeamSize: 5,
      maxTeamSize: 5,
      isScoreboardFrozen: false,
    },
  });

  // 7. Seed Sample Teams (Events start with 0 registrations for clean evaluation)
  const teamAlpha = await prisma.team.create({
    data: {
      name: 'ByteBandits',
      inviteCode: 'BANDIT-2026',
      eventId: aiWebDev.id,
      captainId: student.id,
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: teamAlpha.id,
      userId: student.id,
    },
  });


  // 8. Seed Submissions & Judge Scoring
  const submission1 = await prisma.submission.create({
    data: {
      eventId: aiWebDev.id,
      teamId: teamAlpha.id,
      userId: student.id,
      title: 'ClubSphere — Smart Club Operations & Competition Management Platform',
      repoUrl: 'https://github.com/litlua/event_management',
      liveDemoUrl: 'https://clubsphere.drmc.edu',
      videoUrl: 'https://youtu.be/drmc-clubsphere-demo',
      description: 'End-to-end event registration, ticketing pass with QR scanner, judge rubric scoring panel, tournament brackets, and automated Redis waitlists.',
    },
  });

  await prisma.judgeScore.create({
    data: {
      submissionId: submission1.id,
      judgeId: judge.id,
      criteriaBreakdown: {
        festDirectoryUX: 30,
        registrationSystem: 30,
        organizerManagement: 29,
        bonusSolutions: 30,
      },
      totalScore: 119,
      feedback: 'Outstanding implementation! Solves student club operational bottlenecks with exceptional architectural restraint and zero AI clutter.',
    },
  });

  // 9. Seed Bracket Matches for Gaming Tournament
  const teamGaming1 = await prisma.team.create({
    data: { name: 'ViperSquad', inviteCode: 'VIP-01', eventId: gaming.id, captainId: student.id },
  });
  const teamGaming2 = await prisma.team.create({
    data: { name: 'PhantomForce', inviteCode: 'PHA-02', eventId: gaming.id, captainId: student2.id },
  });
  const teamGaming3 = await prisma.team.create({
    data: { name: 'ApexStrikers', inviteCode: 'APX-03', eventId: gaming.id, captainId: student3.id },
  });
  const teamGaming4 = await prisma.team.create({
    data: { name: 'TitanOmega', inviteCode: 'TIT-04', eventId: gaming.id, captainId: student.id },
  });

  await prisma.bracketMatch.create({
    data: {
      eventId: gaming.id,
      roundName: BracketRound.SEMIFINAL,
      matchNumber: 1,
      team1Id: teamGaming1.id,
      team2Id: teamGaming2.id,
      score1: 13,
      score2: 9,
      winnerId: teamGaming1.id,
    },
  });

  await prisma.bracketMatch.create({
    data: {
      eventId: gaming.id,
      roundName: BracketRound.SEMIFINAL,
      matchNumber: 2,
      team1Id: teamGaming3.id,
      team2Id: teamGaming4.id,
      score1: 11,
      score2: 13,
      winnerId: teamGaming4.id,
    },
  });

  await prisma.bracketMatch.create({
    data: {
      eventId: gaming.id,
      roundName: BracketRound.FINAL,
      matchNumber: 3,
      team1Id: teamGaming1.id,
      team2Id: teamGaming4.id,
      score1: 0,
      score2: 0,
      nextMatchId: null,
    },
  });

  // 10. Seed Support Tickets
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
      message: 'Hi Tanvir, yes! As long as the registration deadline (Oct 9, 11:59 AM) has not passed, you can invite your new teammate directly.',
    },
  });

  // 11. Seed Audit Logs
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
      entityId: submission1.id,
      actorId: judge.id,
      metadata: { totalScore: 119, submissionTitle: 'ClubSphere' },
    },
  });

  // 12. Seed Sample Certificate
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

  console.log('✅ Seeding completed successfully!');
  console.log('🔑 Demo credentials:');
  console.log('   - Organizer: organizer@drmc.edu / Admin@123');
  console.log('   - Judge:     judge@drmc.edu / Judge@123');
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
