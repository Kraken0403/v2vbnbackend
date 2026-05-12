import { PrismaClient } from '@prisma/client'
import {
  SHRINATHJI_CHAPTER_NAME,
  SHRINATHJI_CHAPTER_SLUG,
  SHRINATHJI_ROSTER,
  ShrinathjiRosterMember,
} from './shrinathji-roster.data'

const prisma = new PrismaClient()

type SyncOptions = {
  dryRun?: boolean
  deactivateMissing?: boolean
  protectRoleLinks?: boolean
}

const options: Required<SyncOptions> = {
  dryRun: process.argv.includes('--dry-run'),
  deactivateMissing: !process.argv.includes('--keep-missing'),
  protectRoleLinks: !process.argv.includes('--strict-ppt'),
}

function normalizeName(value?: string | null) {
  return (value || '')
    .toLowerCase()
    .replace(/dr\.?\s+/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function slugBase(value: string) {
  return normalizeName(value).replace(/\s+/g, '-') || 'member'
}

async function uniqueSlug(name: string, existingMemberId?: number) {
  const base = slugBase(name)
  let slug = base
  let counter = 2

  while (true) {
    const existing = await prisma.member.findUnique({ where: { slug } })

    if (!existing || existing.id === existingMemberId) {
      return slug
    }

    slug = `${base}-${counter}`
    counter++
  }
}

function rosterKeys(row: ShrinathjiRosterMember) {
  return [row.fullName, ...(row.aliases || [])]
    .map((name) => normalizeName(name))
    .filter(Boolean)
}

function nullable(value?: string | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function runShrinathjiRosterSync(syncOptions: SyncOptions = {}) {
  const finalOptions = { ...options, ...syncOptions }

  console.log('🚀 Starting Shrinathji roster sync')
  console.log(`📌 Source roster members from PPT: ${SHRINATHJI_ROSTER.length}`)

  const duplicateNames = new Set<string>()
  const seenNames = new Set<string>()

  for (const row of SHRINATHJI_ROSTER) {
    const key = normalizeName(row.fullName)
    if (seenNames.has(key)) duplicateNames.add(row.fullName)
    seenNames.add(key)
  }

  if (duplicateNames.size) {
    throw new Error(`Duplicate roster names found: ${Array.from(duplicateNames).join(', ')}`)
  }

  const chapter = await prisma.chapter.findFirst({
    where: {
      OR: [{ slug: SHRINATHJI_CHAPTER_SLUG }, { name: SHRINATHJI_CHAPTER_NAME }],
    },
  })

  if (!chapter) {
    throw new Error(`Chapter not found: ${SHRINATHJI_CHAPTER_NAME}`)
  }

  const existingLinks = await prisma.member_chapter.findMany({
    where: { chapter_id: chapter.id },
    include: {
      member: true,
      roles: true,
    },
  })

  type ExistingChapterLink = (typeof existingLinks)[number]

  const linkByName = new Map<string, ExistingChapterLink>()
  const linkByMemberId = new Map<number, ExistingChapterLink>()

  for (const link of existingLinks) {
    linkByName.set(normalizeName(link.member.full_name), link)
    linkByMemberId.set(link.member_id, link)
  }

  const touchedLinkIds = new Set<number>()

  const stats = {
    created: 0,
    updated: 0,
    reactivated: 0,
    linked: 0,
    deactivated: 0,
    protectedRoleLinks: 0,
  }

  for (const row of SHRINATHJI_ROSTER) {
    const keys = rosterKeys(row)

    let existingLink: ExistingChapterLink | null =
      keys.map((key) => linkByName.get(key)).find((link): link is ExistingChapterLink => Boolean(link)) ?? null

    let member = existingLink?.member ?? null

    if (!member && row.email) {
      member = await prisma.member.findFirst({ where: { email: row.email } })
      if (member) existingLink = linkByMemberId.get(member.id) ?? null
    }

    const memberData: {
      full_name: string
      slug: string
      email?: string | null
      company_name: string | null
      category: string | null
      is_active: boolean
    } = {
      full_name: row.fullName,
      slug: await uniqueSlug(row.fullName, member?.id),
      company_name: nullable(row.companyName),
      category: nullable(row.category),
      is_active: true,
    }

    // PPT does not contain emails. We only write email when supplied.
    if (nullable(row.email)) {
      memberData.email = nullable(row.email)
    }

    if (member) {
      console.log(`🔁 Updating member: ${row.fullName}`)

      if (!finalOptions.dryRun) {
        member = await prisma.member.update({
          where: { id: member.id },
          data: memberData,
        })
      }

      stats.updated++
    } else {
      console.log(`➕ Creating member: ${row.fullName}`)

      if (!finalOptions.dryRun) {
        member = await prisma.member.create({ data: memberData })
      } else {
        member = { id: -row.slide, ...memberData, user_id: null } as any
      }

      stats.created++
    }

    if (!member) {
      throw new Error(`Unable to resolve member record for roster row: ${row.fullName}`)
    }

    if (!existingLink && member.id > 0) {
      existingLink = await prisma.member_chapter.findFirst({
        where: { chapter_id: chapter.id, member_id: member.id },
        include: { member: true, roles: true },
      })
    }

    if (existingLink) {
      touchedLinkIds.add(existingLink.id)

      if (!existingLink.is_active) {
        console.log(`✅ Re-activating chapter link: ${row.fullName}`)

        if (!finalOptions.dryRun) {
          await prisma.member_chapter.update({
            where: { id: existingLink.id },
            data: { is_active: true },
          })
        }

        stats.reactivated++
      }
    } else if (member.id > 0) {
      console.log(`🔗 Linking member to ${chapter.name}: ${row.fullName}`)

      if (!finalOptions.dryRun) {
        const newLink = await prisma.member_chapter.create({
          data: {
            chapter_id: chapter.id,
            member_id: member.id,
            is_active: true,
          },
        })

        touchedLinkIds.add(newLink.id)
      }

      stats.linked++
    }
  }

  if (finalOptions.deactivateMissing) {
    for (const link of existingLinks) {
      if (touchedLinkIds.has(link.id)) continue
      if (!link.is_active) continue

      const hasCoordinatorOrLeadershipRole = link.roles.length > 0

      if (finalOptions.protectRoleLinks && hasCoordinatorOrLeadershipRole) {
        console.warn(
          `🛡️ Skipping non-PPT member because the chapter link has roles: ${link.member.full_name}`,
        )

        stats.protectedRoleLinks++
        continue
      }

      console.log(`🚫 Deactivating non-PPT chapter link: ${link.member.full_name}`)

      if (!finalOptions.dryRun) {
        await prisma.member_chapter.update({
          where: { id: link.id },
          data: { is_active: false },
        })
      }

      stats.deactivated++
    }
  }

  console.log('✅ Shrinathji roster sync completed')
  console.table(stats)

  if (finalOptions.dryRun) {
    console.log('ℹ️ Dry run only. No database changes were written.')
  }

  if (finalOptions.protectRoleLinks) {
    console.log(
      'ℹ️ Coordinator/leadership role links were protected. Use --strict-ppt only if you deliberately want every non-PPT chapter link deactivated.',
    )
  }
}

export async function disconnectShrinathjiRosterSync() {
  await prisma.$disconnect()
}

if (require.main === module) {
  runShrinathjiRosterSync()
    .catch((error) => {
      console.error('❌ Roster sync failed:', error)
      process.exitCode = 1
    })
    .finally(disconnectShrinathjiRosterSync)
}