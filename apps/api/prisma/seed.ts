import { PrismaClient, Role } from '@prisma/client';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

function normalizeLogin(login: string): string {
  return login.trim().toLowerCase().normalize('NFKC');
}

function computeLoginHash(login: string, hmacKey: string): string {
  return crypto
    .createHmac('sha256', hmacKey)
    .update(normalizeLogin(login))
    .digest('hex');
}

function encryptLogin(login: string, encKey: Buffer): string {
  const normalized = normalizeLogin(login);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encKey, iv);

  let encrypted = cipher.update(normalized, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

async function hashPassword(password: string, pepper: string): Promise<string> {
  const peppered = crypto.createHmac('sha256', pepper).update(password).digest('hex');
  return argon2.hash(peppered, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MiB
    timeCost: 3,
    parallelism: 1,
  });
}

async function main() {
  console.log('🌱 Starting NEOM School secure database seeding...');

  const directorPassword = process.env.SEED_DIRECTOR_PASSWORD;
  const zavuchPassword = process.env.SEED_ZAVUCH_PASSWORD;
  const teacherPassword = process.env.SEED_TEACHER_PASSWORD;

  const pepper = process.env.PASSWORD_PEPPER || 'd6f78e9b1c2a3f4e5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f';
  const loginHmacKey = process.env.LOGIN_HMAC_KEY || 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90';
  const encKeyRaw = process.env.LOGIN_ENC_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  const loginEncKey =
    encKeyRaw.length === 64
      ? Buffer.from(encKeyRaw, 'hex')
      : crypto.createHash('sha256').update(encKeyRaw).digest();

  if (!directorPassword || !zavuchPassword || !teacherPassword) {
    throw new Error(
      'SEED passwords missing! Please set SEED_DIRECTOR_PASSWORD, SEED_ZAVUCH_PASSWORD, SEED_TEACHER_PASSWORD in .env',
    );
  }

  const directorHash = await hashPassword(directorPassword, pepper);
  const zavuchHash = await hashPassword(zavuchPassword, pepper);
  const teacherHash = await hashPassword(teacherPassword, pepper);

  // 1. Academic Year 2026-2027
  const academicYear = await prisma.academicYear.upsert({
    where: { name: '2026-2027' },
    update: { isCurrent: true },
    create: {
      name: '2026-2027',
      startDate: new Date('2026-09-01T00:00:00.000Z'),
      endDate: new Date('2027-05-25T23:59:59.000Z'),
      isCurrent: true,
    },
  });
  console.log(`✅ Academic year created: ${academicYear.name}`);

  // Helper for seeding users with loginHash and loginEnc
  async function seedUser(login: string, fullName: string, role: Role, passwordHash: string, mustChangePassword = false) {
    const loginHash = computeLoginHash(login, loginHmacKey);
    const loginEnc = encryptLogin(login, loginEncKey);

    return prisma.user.upsert({
      where: { loginHash },
      update: {
        loginEnc,
        passwordHash,
        role,
        mustChangePassword,
      },
      create: {
        loginHash,
        loginEnc,
        fullName,
        passwordHash,
        role,
        isActive: true,
        mustChangePassword,
      },
    });
  }

  // 2. Users: Direktor (admin1), Zamdirektor (admin2), O'qituvchi (admin3)
  const admin1 = await seedUser('admin1', 'Rustamov Shavkat Akbarovich', Role.DIRECTOR, directorHash, false);
  const admin2 = await seedUser('admin2', 'Nodirova Dilnoza Alisherovna', Role.ZAVUCH, zavuchHash, false);
  const admin3 = await seedUser('admin3', 'Qodirov Jamshid Baxromovich', Role.TEACHER, teacherHash, false);
  const director = await seedUser('director', 'Rustamov Shavkat Akbarovich', Role.DIRECTOR, directorHash, false);
  const direktor = await seedUser('direktor', 'Rustamov Shavkat Akbarovich', Role.DIRECTOR, directorHash, false);
  const zavuch = await seedUser('zavuch', 'Nodirova Dilnoza Alisherovna', Role.ZAVUCH, zavuchHash, false);
  const zamdrektor = await seedUser('zamdrektor', 'Nodirova Dilnoza Alisherovna', Role.ZAVUCH, zavuchHash, false);
  const zamdirektor = await seedUser('zamdirektor', 'Nodirova Dilnoza Alisherovna', Role.ZAVUCH, zavuchHash, false);
  const oqituvchi = await seedUser("o'qituvchi", 'Qodirov Jamshid Baxromovich', Role.TEACHER, teacherHash, false);
  const oqituvchiPlain = await seedUser("oqituvchi", 'Qodirov Jamshid Baxromovich', Role.TEACHER, teacherHash, false);
  const teacher1 = await seedUser('teacher1', 'Qodirov Jamshid Baxromovich', Role.TEACHER, teacherHash, false);
  const teacher2 = await seedUser('teacher2', 'Ahmedova Nilufar Shuxratovna', Role.TEACHER, teacherHash, false);
  const teacher3 = await seedUser('teacher3', 'Usmonov Otabek Mirzohidovich', Role.TEACHER, teacherHash, false);

  console.log('✅ Staff users created (Argon2id + pepper + loginHash + loginEnc, mustChangePassword=false)');

  // 3. Classes: 1-A, 1-D, 2-A, 2-B, 3-A, 3-D, 11-A, 11-B, 11-D
  const classesData = [
    { grade: 1, letter: 'A', teacherId: oqituvchi.id },
    { grade: 1, letter: 'D', teacherId: null },
    { grade: 2, letter: 'A', teacherId: teacher2.id },
    { grade: 2, letter: 'B', teacherId: null },
    { grade: 3, letter: 'A', teacherId: null },
    { grade: 3, letter: 'D', teacherId: null },
    { grade: 11, letter: 'A', teacherId: teacher3.id },
    { grade: 11, letter: 'B', teacherId: null },
    { grade: 11, letter: 'D', teacherId: null },
  ];

  const createdClasses: Record<string, string> = {};

  for (const item of classesData) {
    const cls = await prisma.class.upsert({
      where: {
        grade_letter_academicYear_unique: {
          grade: item.grade,
          letter: item.letter,
          academicYearId: academicYear.id,
        },
      },
      update: {
        homeroomTeacherId: item.teacherId,
      },
      create: {
        grade: item.grade,
        letter: item.letter,
        academicYearId: academicYear.id,
        homeroomTeacherId: item.teacherId,
      },
    });
    createdClasses[`${item.grade}-${item.letter}`] = cls.id;
  }
  console.log(`✅ ${classesData.length} classes seeded`);

  // 4. Sample Students in class 1-A
  const sampleStudents = [
    'Aliyev Anvar Dilshod o‘g‘li',
    'Karimova Malika Rustam qizi',
    'Hasanov Ali Boburovich',
    'Saidova Madina Anvar qizi',
    'Toshmatov Jasur Erkinovich',
    'Yusupova Rayhona Shavkat qizi',
  ];

  const class1AId = createdClasses['1-A'];
  if (class1AId) {
    for (const fullName of sampleStudents) {
      const existing = await prisma.student.findFirst({
        where: { fullName, classId: class1AId },
      });
      if (!existing) {
        await prisma.student.create({
          data: {
            fullName,
            classId: class1AId,
            isActive: true,
          },
        });
      }
    }
  }

  // 5. Site settings: bo'sh qiymatlar (stats null bo'lsa, frontend [00] ko'rsatadi)
  await prisma.siteSetting.upsert({
    where: { key: 'site_settings' },
    update: {
      value: {
        stats: {
          teachers: null,
          students: null,
          classrooms: null,
          graduatesRate: null,
        },
        address: null,
        phone: null,
        workHours: null,
      },
    },
    create: {
      key: 'site_settings',
      value: {
        stats: {
          teachers: null,
          students: null,
          classrooms: null,
          graduatesRate: null,
        },
        address: null,
        phone: null,
        workHours: null,
      },
    },
  });

  // 6. 3 ta namuna Post (NEWS, EVENT, PLAN) placeholder bilan va 1 ta DRAFT post
  const postsData = [
    {
      type: 'Tadbir' as const,
      postType: 'EVENT' as const,
      title: '[Sarlavha]',
      body: '[Sana · qisqa matn] Ilm-fan haftaligi va loyihalar ko‘rgazmasi',
      eventDate: new Date('2026-10-24T10:00:00Z'),
      thumbUrl: null,
      imageUrl: null,
      isPublished: true,
      publishedAt: new Date('2026-10-20T10:00:00Z'),
    },
    {
      type: 'Yangilik' as const,
      postType: 'NEWS' as const,
      title: '[Sarlavha]',
      body: '[Sana · qisqa matn] Yangi o‘quv binosi va IT laboratoriyasi foydalanishga topshirildi',
      eventDate: null,
      thumbUrl: null,
      imageUrl: null,
      isPublished: true,
      publishedAt: new Date('2026-10-19T14:30:00Z'),
    },
    {
      type: 'Reja' as const,
      postType: 'PLAN' as const,
      title: '[Sarlavha]',
      body: '[Sana · qisqa matn] 1-chorak yakuniy monitoring imtihonlari jadvali',
      eventDate: null,
      thumbUrl: null,
      imageUrl: null,
      isPublished: true,
      publishedAt: new Date('2026-10-18T09:00:00Z'),
    },
  ];

  for (const item of postsData) {
    const existing = await prisma.post.findFirst({
      where: {
        type: item.postType,
        title: item.title,
      },
    });

    if (!existing) {
      await prisma.post.create({
        data: {
          type: item.postType,
          title: item.title,
          body: item.body,
          eventDate: item.eventDate,
          thumbUrl: item.thumbUrl,
          imageUrl: item.imageUrl,
          isPublished: item.isPublished,
          publishedAt: item.publishedAt,
          createdById: zavuch.id,
        },
      });
    }
  }

  // 1 ta qoralama (DRAFT) post - ochiq API'da ko'rinmasligini tekshirish uchun
  const draftPost = await prisma.post.findFirst({
    where: { title: '[Qoralama eʼlon]' },
  });
  if (!draftPost) {
    await prisma.post.create({
      data: {
        type: 'NEWS',
        title: '[Qoralama eʼlon]',
        body: 'Bu qoralama post, ochiq saytda va ochiq API da chiqmasligi kerak.',
        isPublished: false,
        createdById: zavuch.id,
      },
    });
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
