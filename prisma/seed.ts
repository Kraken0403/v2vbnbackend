import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

async function main() {
  /* =========================
     CHAPTER
  ========================= */
  const chapter = await prisma.chapter.upsert({
    where: { slug: 'shrinathji' },
    update: {},
    create: {
      name: 'Shrinathji',
      slug: 'shrinathji',
      city: 'Ahmedabad',
      qr_rotation: {
        create: { secret_version: 1 },
      },
    },
  })

  /* =========================
     GLOBAL ADMIN USER
  ========================= */
  const adminPassword = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@v2vbn.com' },
    update: {},
    create: {
      name: 'System Admin',
      phone: '9999999999',
      email: 'admin@v2vbn.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  /* =========================
     MEMBERS (WITH USERS)
  ========================= */

  const membersData = [
    {
      name: 'Chapter President',
      email: 'president@v2vbn.com',
      phone: '8888888888',
      role: 'PRESIDENT',
    },
    {
      name: 'Vice President',
      email: 'vp@v2vbn.com',
      phone: '7777777777',
      role: 'VP',
    },
    {
      name: 'Secretary Treasurer',
      email: 'st@v2vbn.com',
      phone: '6666666666',
      role: 'ST',
    },
  ]

  for (const m of membersData) {
    const passwordHash = await bcrypt.hash('member123', 10)

    // 1️⃣ Create USER
    const user = await prisma.user.create({
      data: {
        name: m.name,
        email: m.email,
        phone: m.phone,
        password: passwordHash,
        role: 'STAFF', // member login
      },
    })

    // 2️⃣ Create MEMBER linked to USER
    const member = await prisma.member.create({
      data: {
        full_name: m.name,
        slug: slugify(m.name),
        phone: m.phone,
        email: m.email,
        company_name: 'V2VBN',
        designation: m.role,
        user_id: user.id, // ✅ THIS IS THE KEY
      },
    })

    // 3️⃣ Assign MEMBER to CHAPTER with ROLE
    await prisma.member_chapter.create({
      data: {
        member_id: member.id,
        chapter_id: chapter.id,
        roles: {
          create: [{ role: m.role as any }],
        },
      },
    })
  }

  console.log('✅ Seed complete')
  console.log('Chapter:', chapter.slug)
  console.log('Admin Login → admin@v2vbn.com / admin123')
  console.log('Member Login → president@v2vbn.com / member123')
  console.log('Member Login → vp@v2vbn.com / member123')
  console.log('Member Login → st@v2vbn.com / member123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
