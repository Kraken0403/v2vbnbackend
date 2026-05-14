import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const chapter = await prisma.chapter.findFirst({
    where: {
      OR: [
        { slug: 'shrinathji' },
        { name: { contains: 'Shrinathji' } },
      ],
    },
  })

  if (!chapter) {
    throw new Error('Shrinathji chapter not found')
  }

  const links = await prisma.member_chapter.findMany({
    where: {
      chapter_id: chapter.id,
      is_active: true,
    },
    include: {
      member: true,
    },
    orderBy: {
      member: {
        full_name: 'asc',
      },
    },
  })

  console.log(`\nShrinathji active members: ${links.length}\n`)

  console.table(
    links.map((link) => ({
      memberId: link.member.id,
      memberChapterId: link.id,
      name: link.member.full_name,
      category: link.member.category,
      company: link.member.company_name,
      email: link.member.email,
      phone: link.member.phone,
    })),
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
