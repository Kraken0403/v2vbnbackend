import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { SeatingMemberDto } from './dto/seating-member.dto'
import { global_role } from '@prisma/client'

type Editor = {
  userId: number
  role: global_role
  memberId: number | null
}

@Injectable()
export class MeetingSeatingService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // ACCESS CHECK
  // =========================
  private async ensureChapterAccess(meetingId: number, editor: Editor) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { id: true, chapter_id: true },
    })

    if (!meeting) throw new NotFoundException('Meeting not found')

    // ✅ Admin/Super Admin can manage seating for any chapter
    if (editor.role === 'ADMIN' || editor.role === 'SUPER_ADMIN') {
      return meeting
    }

    // ✅ Otherwise must be a chapter member
    const memberId = editor.memberId
    if (!memberId) throw new ForbiddenException('memberId missing in JWT')

    const link = await this.prisma.member_chapter.findFirst({
      where: {
        member_id: memberId,
        chapter_id: meeting.chapter_id,
        is_active: true,
      },
      select: { id: true },
    })

    if (!link) {
      throw new ForbiddenException('You are not a member of this chapter')
    }

    return meeting
  }

  // =========================
  // CANDIDATES
  // =========================
  async candidates(meetingId: number, editor: Editor) {
    const meeting = await this.ensureChapterAccess(meetingId, editor)

    return this.prisma.member.findMany({
      where: {
        is_active: true,
        chapters: {
          some: {
            chapter_id: meeting.chapter_id,
            is_active: true,
          },
        },
      },
      orderBy: { full_name: 'asc' },
      select: {
        id: true,
        full_name: true,
        slug: true,
        designation: true,
        company_name: true,
        phone: true,
        email: true,
        profile: { select: { photo_url: true } },
      },
    })
  }

  // =========================
  // GET CURRENT SEATING
  // =========================
  async get(meetingId: number, editor: Editor) {
    await this.ensureChapterAccess(meetingId, editor)

    const seating = await this.prisma.meeting_seating.findUnique({
      where: { meeting_id: meetingId },
      include: {
        members: {
          orderBy: { sequence_number: 'asc' },
          include: {
            member: {
              select: {
                id: true,
                full_name: true,
                slug: true,
                designation: true,
                company_name: true,
                profile: { select: { photo_url: true } },
              },
            },
          },
        },
      },
    })

    if (!seating) {
      return { meeting_id: meetingId, members: [] }
    }

    return {
      meeting_id: meetingId,
      seating_id: seating.id,
      uploaded_by: seating.uploaded_by, // (member id if saved by member, null if admin)
      created_at: seating.created_at,
      members: seating.members.map((m) => ({
        member_id: m.member_id,
        sequence_number: m.sequence_number,
        member: m.member,
      })),
    }
  }

  // =========================
  // SAVE / REPLACE SEATING
  // =========================
  async save(meetingId: number, editor: Editor, members: SeatingMemberDto[]) {
    const meeting = await this.ensureChapterAccess(meetingId, editor)

    if (!members?.length) {
      throw new BadRequestException('members array cannot be empty')
    }

    // 🔒 Duplicate member check
    const memberIds = members.map((m) => m.member_id)
    if (new Set(memberIds).size !== memberIds.length) {
      throw new BadRequestException('Duplicate members in seating')
    }

    // 🔒 Duplicate sequence check
    const sequences = members.map((m) => m.sequence)
    if (new Set(sequences).size !== sequences.length) {
      throw new BadRequestException('Duplicate sequence numbers')
    }

    // 🔒 Validate members belong to chapter
    const found = await this.prisma.member.findMany({
      where: {
        id: { in: memberIds },
        is_active: true,
        chapters: {
          some: {
            chapter_id: meeting.chapter_id,
            is_active: true,
          },
        },
      },
      select: { id: true },
    })

    if (found.length !== memberIds.length) {
      throw new BadRequestException(
        'One or more members do not belong to this chapter',
      )
    }

    // ✅ Store uploader as member id if available, else null (admin)
    const uploadedByMemberId = editor.memberId ?? null

    // 🪑 Upsert seating header
    const seating = await this.prisma.meeting_seating.upsert({
      where: { meeting_id: meetingId },
      update: { uploaded_by: uploadedByMemberId },
      create: {
        meeting_id: meetingId,
        uploaded_by: uploadedByMemberId,
      },
      select: { id: true },
    })

    // 🔁 Replace seating rows
    await this.prisma.$transaction([
      this.prisma.meeting_seating_member.deleteMany({
        where: { meeting_seating_id: seating.id },
      }),
      this.prisma.meeting_seating_member.createMany({
        data: members.map((m) => ({
          meeting_seating_id: seating.id,
          member_id: m.member_id,
          sequence_number: m.sequence,
        })),
      }),
    ])

    return this.get(meetingId, editor)
  }

  // =========================
  // USE LAST SEATING
  // =========================
  async useLast(meetingId: number, editor: Editor) {
    const meeting = await this.ensureChapterAccess(meetingId, editor)

    const prev = await this.prisma.meeting_seating.findFirst({
      where: {
        meeting: {
          chapter_id: meeting.chapter_id,
          id: { not: meetingId },
        },
      },
      orderBy: { created_at: 'desc' },
      include: {
        members: {
          orderBy: { sequence_number: 'asc' },
        },
      },
    })

    if (!prev) {
      throw new NotFoundException('No previous seating found for this chapter')
    }

    // ✅ Convert previous seating → SeatingMemberDto[]
    const members: SeatingMemberDto[] = prev.members.map((m) => ({
      member_id: m.member_id,
      sequence: m.sequence_number,
    }))

    return this.save(meetingId, editor, members)
  }
}
