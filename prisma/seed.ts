/**
 * Idempotent seed: system reading plans, an admin account (from env or a dev
 * default) and – only when SEED_DEMO=1 – a few demo members and sample content
 * so the UI is not empty during development.
 *
 * Run with: npm run db:seed
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { generatePlans } from "../src/lib/plans/generate";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL ist nicht gesetzt.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function seedPlans() {
  const plans = generatePlans();
  for (const plan of plans) {
    const record = await prisma.readingPlan.upsert({
      where: { slug: plan.slug },
      create: {
        slug: plan.slug,
        title: plan.title,
        description: plan.description,
        category: plan.category,
        minutesPerDay: plan.minutesPerDay,
        dayCount: plan.days.length,
        isSystem: true,
      },
      update: {
        title: plan.title,
        description: plan.description,
        category: plan.category,
        minutesPerDay: plan.minutesPerDay,
        dayCount: plan.days.length,
      },
    });
    await prisma.planDay.deleteMany({ where: { planId: record.id } });
    await prisma.planDay.createMany({
      data: plan.days.map((readings, i) => ({ planId: record.id, day: i + 1, readings: JSON.stringify(readings) })),
    });
  }
  console.log(`✓ ${plans.length} Lesepläne`);
}

async function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@bleibe.local").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin-passwort-123";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "ADMIN") await prisma.user.update({ where: { id: existing.id }, data: { role: "ADMIN" } });
    console.log(`✓ Admin vorhanden (${email})`);
    return existing;
  }
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      username: process.env.SEED_ADMIN_USERNAME ?? "admin",
      name: process.env.SEED_ADMIN_NAME ?? "Administrator",
      role: "ADMIN",
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✓ Admin angelegt: ${email} / ${process.env.SEED_ADMIN_PASSWORD ? "(Passwort aus Umgebung)" : password}`);
  return user;
}

async function seedDemo(adminId: string) {
  const demoUsers = [
    { email: "mara@bleibe.local", username: "mara", name: "Mara Weber", location: "Siegen", church: "FeG Siegen" },
    { email: "jonas@bleibe.local", username: "jonas", name: "Jonas Keller", location: "Köln", church: null },
    { email: "elif@bleibe.local", username: "elif", name: "Elif Demir", location: "Berlin", church: "Berlinprojekt" },
  ];
  const hash = await bcrypt.hash("demo-passwort-123", 12);
  const users = [];
  for (const u of demoUsers) {
    users.push(
      await prisma.user.upsert({
        where: { email: u.email },
        create: { ...u, passwordHash: hash, emailVerifiedAt: new Date(), openForPartner: true },
        update: {},
      }),
    );
  }

  const group = await prisma.group.upsert({
    where: { slug: "bibel-lesen-siegen" },
    create: {
      slug: "bibel-lesen-siegen",
      name: "Bibel lesen in Siegen",
      description: "Wir lesen gemeinsam durch das Johannesevangelium und treffen uns alle zwei Wochen vor Ort.",
      kind: "LOCAL",
      city: "Siegen",
      createdById: users[0].id,
      members: { create: [{ userId: users[0].id, role: "OWNER" }, { userId: adminId, role: "MEMBER" }] },
    },
    update: {},
  });
  await prisma.group.upsert({
    where: { slug: "psalmen-online" },
    create: {
      slug: "psalmen-online",
      name: "Psalmen – online beten",
      description: "Offene Online-Gruppe: jeden Tag ein Psalm, kurze Gedanken, füreinander beten.",
      kind: "ONLINE",
      createdById: users[1].id,
      members: { create: [{ userId: users[1].id, role: "OWNER" }, { userId: users[2].id, role: "MEMBER" }] },
    },
    update: {},
  });

  const prayerCount = await prisma.prayerRequest.count();
  if (prayerCount === 0) {
    await prisma.prayerRequest.createMany({
      data: [
        {
          authorId: users[1].id,
          title: "Prüfungen nächste Woche",
          body: "Ich schreibe nächste Woche drei Klausuren und bin ziemlich nervös. Betet bitte für Ruhe und einen klaren Kopf.",
          category: "alltag",
          visibility: "PUBLIC",
        },
        {
          authorId: users[2].id,
          title: "Meine Mutter im Krankenhaus",
          body: "Meine Mutter wird am Donnerstag operiert. Bitte betet für die Ärzte und dass sie gut durchkommt.",
          category: "gesundheit",
          visibility: "MEMBERS",
        },
        {
          authorId: users[0].id,
          groupId: group.id,
          title: "Neue Leute für unsere Gruppe",
          body: "Dass wir offen bleiben für Menschen, die neu dazukommen.",
          category: "gemeinde",
          visibility: "GROUP",
        },
      ],
    });
  }

  const postCount = await prisma.post.count();
  if (postCount === 0) {
    await prisma.post.createMany({
      data: [
        {
          authorId: users[0].id,
          kind: "QUESTION",
          title: "Wie lest ihr die Psalmen?",
          body: "Einen pro Tag? Mehrere? Laut? Ich suche nach einer Form, die im Alltag trägt.",
          visibility: "PUBLIC",
        },
        {
          authorId: users[2].id,
          kind: "POST",
          body: "Heute Morgen Psalm 139 gelesen. „Von allen Seiten umgibst du mich“ – das trägt mich durch den Tag.",
          verseRef: "19:139:5",
          visibility: "PUBLIC",
        },
      ],
    });
  }

  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(19, 30, 0, 0);
    await prisma.event.create({
      data: {
        hostId: users[0].id,
        groupId: group.id,
        title: "Bibelabend: Johannes 15",
        description: "Wir lesen Johannes 15 gemeinsam, tauschen uns aus und beten füreinander. Neue sind willkommen.",
        startsAt: nextWeek,
        location: "Gemeindehaus, Musterstraße 1",
        city: "Siegen",
        visibility: "PUBLIC",
      },
    });
  }
  console.log("✓ Demo-Inhalte");
}

async function main() {
  await seedPlans();
  const admin = await seedAdmin();
  if (process.env.SEED_DEMO === "1") await seedDemo(admin.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
