import { Injectable, NotFoundException, ForbiddenException, BadRequestException, } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateMemberDto } from './dto/create-member.dto'
import { AssignMemberDto } from './dto/assign-member.dto'
import { UpdateMemberDto } from './dto/update-member.dto'
import { LinkUserDto } from './dto/link-user.dto'
import { slugify } from '../common/slugify'
import { AssignChapterRoleDto } from './dto/assign-chapter-role.dto'
@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMemberDto) {
    const slug = data.slug?.trim() ? data.slug.trim() : slugify(data.full_name)

    return this.prisma.member.create({
      data: {
        ...data,
        slug,
        birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
      },
    })
  }

  async findAll() {
    return this.prisma.member.findMany({
      where: { is_active: true },
      orderBy: { full_name: 'asc' },
      include: {
        profile: true,
      },
    })
  }

  async findByChapter(chapterId: number) {
    return this.prisma.member.findMany({
      where: {
        chapters: {
          some: {
            chapter_id: chapterId,
            is_active: true,
          },
        },
      },
      include: {
        profile: true,
        chapters: {
          where: { chapter_id: chapterId },
          include: { roles: true },
        },
      },
      orderBy: { full_name: 'asc' },
    })
  }

  async assignChapterRole(
    memberId: number,
    data: AssignChapterRoleDto,
  ) {
    // 1️⃣ Ensure member exists
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    })
    if (!member) {
      throw new NotFoundException('Member not found')
    }
  
    // 2️⃣ Ensure member is in chapter
    const memberChapter =
      await this.prisma.member_chapter.findFirst({
        where: {
          member_id: memberId,
          chapter_id: data.chapter_id,
          is_active: true,
        },
      })
  
    if (!memberChapter) {
      throw new BadRequestException(
        'Member is not assigned to this chapter',
      )
    }
  
    // 3️⃣ Prevent duplicate role
    const existingRole =
      await this.prisma.chapter_role.findFirst({
        where: {
          member_chapter_id: memberChapter.id,
          role: data.role,
        },
      })
  
    if (existingRole) {
      throw new BadRequestException(
        `Role ${data.role} already assigned`,
      )
    }
  
    // 4️⃣ Assign role
    return this.prisma.chapter_role.create({
      data: {
        member_chapter_id: memberChapter.id,
        role: data.role,
      },
    })
  }
  

  async findOne(id: number) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true, is_active: true } },
        profile: true,
        contact: true,
        chapters: {
          include: {
            chapter: true,
            roles: true,
          },
        },
      },
    })

    if (!member) throw new NotFoundException('Member not found')
    return member
  }

  async update(id: number, data: UpdateMemberDto) {
    const member = await this.prisma.member.findUnique({ where: { id } })
    if (!member) throw new NotFoundException('Member not found')

    return this.prisma.member.update({
      where: { id },
      data: {
        ...data,
        birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
      },
    })
  }

  async assignToChapter(memberId: number, data: AssignMemberDto) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } })
    if (!member) throw new NotFoundException('Member not found')

    return this.prisma.member_chapter.create({
      data: {
        member_id: memberId,
        chapter_id: data.chapter_id,
        roles: data.roles
          ? { create: data.roles.map((r) => ({ role: r })) }
          : undefined,
      },
    })
  }

  // ✅ Link login user -> member
  async linkUser(memberId: number, dto: LinkUserDto) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } })
    if (!member) throw new NotFoundException('Member not found')

    // ensure user exists
    const user = await this.prisma.user.findUnique({ where: { id: dto.user_id } })
    if (!user) throw new NotFoundException('User not found')

    return this.prisma.member.update({
      where: { id: memberId },
      data: { user_id: dto.user_id },
      include: { user: true },
    })
  }

  // ✅ Ownership check helper
  ensureOwnerOrAdmin(requestUser: any, memberId: number) {
    const role = requestUser?.role
    const userMemberId = requestUser?.memberId

    // Admin/Staff can do anything
    if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'STAFF') return

    // Member can only touch self
    if (!userMemberId || userMemberId !== memberId) {
      throw new ForbiddenException('Not allowed')
    }
  }

  // ✅ Birthdays: today
  async birthdaysToday() {
    // MySQL: MONTH(birth_date) & DAY(birth_date)
    return this.prisma.member.findMany({
      where: {
        is_active: true,
        birth_date: { not: null },
      },
      select: {
        id: true,
        full_name: true,
        birth_date: true,
        slug: true,
        profile: { select: { photo_url: true } },
      },
    }).then((rows) => {
      const now = new Date()
      const m = now.getMonth() + 1
      const d = now.getDate()
      return rows.filter((r) => {
        const bd = r.birth_date ? new Date(r.birth_date) : null
        return bd && bd.getMonth() + 1 === m && bd.getDate() === d
      })
    })
  }

  // ✅ Birthdays: month
  async birthdaysMonth() {
    return this.prisma.member.findMany({
      where: {
        is_active: true,
        birth_date: { not: null },
      },
      select: {
        id: true,
        full_name: true,
        birth_date: true,
        slug: true,
        profile: { select: { photo_url: true } },
      },
    }).then((rows) => {
      const now = new Date()
      const m = now.getMonth() + 1
      return rows
        .filter((r) => {
          const bd = r.birth_date ? new Date(r.birth_date) : null
          return bd && bd.getMonth() + 1 === m
        })
        .sort((a, b) => {
          const da = new Date(a.birth_date!).getDate()
          const db = new Date(b.birth_date!).getDate()
          return da - db
        })
    })
  }

  async birthdaysByChapter(chapterId: number) {
    const rows = await this.findByChapter(chapterId)
    const now = new Date()
    const m = now.getMonth() + 1
    return rows
      .filter((r: any) => r.birth_date && new Date(r.birth_date).getMonth() + 1 === m)
      .sort((a: any, b: any) => new Date(a.birth_date).getDate() - new Date(b.birth_date).getDate())
  }
}
