import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  BulkUpdateAttendanceDto,
  UpdateAttendanceDto,
} from './dto/update-attendance.dto'
import {
  attendance_status,
  chapter_role_type,
  meeting_status,
} from '@prisma/client'

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // ACCESS CHECK
  // =========================
  private async ensureAttendanceEditor(
    meetingId: number,
    memberId: number | null,
    userRole?: string,
  ) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { id: true, chapter_id: true, status: true },
    })

    if (!meeting) {
      throw new NotFoundException('Meeting not found')
    }

    if (meeting.status === meeting_status.CLOSED) {
      throw new ForbiddenException('Meeting is closed')
    }

    // =========================
    // GLOBAL ADMIN ACCESS
    // =========================
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      return {
        meeting,
        editorRole: null as chapter_role_type | null,
        editorMemberIdForAudit: null,
      }
    }

    // =========================
    // MEMBER / LT ACCESS
    // =========================
    if (!memberId) {
      throw new ForbiddenException('memberId missing in JWT')
    }

    const memberChapter = await this.prisma.member_chapter.findFirst({
      where: {
        member_id: memberId,
        chapter_id: meeting.chapter_id,
        is_active: true,
        roles: {
          some: {
            role: {
              in: [
                chapter_role_type.PRESIDENT,
                chapter_role_type.VP,
                chapter_role_type.ST,
                chapter_role_type.ATTENDANCE_COORDINATOR,
              ],
            },
          },
        },
      },
      include: { roles: true },
    })

    if (!memberChapter) {
      throw new ForbiddenException(
        'You are not allowed to manage attendance',
      )
    }

    const rolePriority: chapter_role_type[] = [
      chapter_role_type.PRESIDENT,
      chapter_role_type.VP,
      chapter_role_type.ST,
      chapter_role_type.ATTENDANCE_COORDINATOR,
      chapter_role_type.MENTOR,
      chapter_role_type.CORE,
    ]

    const roles = memberChapter.roles.map((r) => r.role)
    const pickedRole =
      rolePriority.find((r) => roles.includes(r)) ?? null

    return {
      meeting,
      editorRole: pickedRole,
      editorMemberIdForAudit: memberId,
    }
  }

  // =========================
  // SEED ATTENDANCE ROWS
  // =========================
  private async seedAttendanceRows(meetingId: number) {
    const seating = await this.prisma.meeting_seating.findUnique({
      where: { meeting_id: meetingId },
      include: { members: true },
    })

    if (!seating) return

    const memberIds = seating.members.map((m) => m.member_id)

    const existing = await this.prisma.meeting_member_row.findMany({
      where: { meeting_id: meetingId },
      select: { member_id: true },
    })

    const existingIds = new Set(existing.map((r) => r.member_id))
    const toCreate = memberIds.filter((id) => !existingIds.has(id))

    if (!toCreate.length) return

    await this.prisma.meeting_member_row.createMany({
      data: toCreate.map((member_id) => ({
        meeting_id: meetingId,
        member_id,
        status: attendance_status.PRESENT,
        substitute_name: null,
        is_auto_generated: true,
        marked_by_member_id: null,
        marked_by_role: null,
        marked_at: null,
      })),
    })
  }

  // =========================
  // GET ATTENDANCE
  // =========================
  async list(
    meetingId: number,
    memberId: number | null,
    userRole?: string,
  ) {
    await this.ensureAttendanceEditor(meetingId, memberId, userRole)
    await this.seedAttendanceRows(meetingId)

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
                company_name: true,
                designation: true,
                category: true,
                profile: { select: { photo_url: true } },
              },
            },
          },
        },
      },
    })

    if (!seating) {
      return {
        meeting_id: meetingId,
        seating_missing: true,
        rows: [],
      }
    }

    const rows = await this.prisma.meeting_member_row.findMany({
      where: { meeting_id: meetingId },
    })

    const rowMap = new Map(rows.map((r) => [r.member_id, r]))

    return {
      meeting_id: meetingId,
      seating_missing: false,
      rows: seating.members.map((s) => {
        const r = rowMap.get(s.member_id)
        return {
          sequence_number: s.sequence_number,
          member: s.member,
          status: r?.status ?? attendance_status.PRESENT,
          substitute_name: r?.substitute_name ?? null,
          is_auto_generated: r?.is_auto_generated ?? true,
          marked_by_member_id: r?.marked_by_member_id ?? null,
          marked_by_role: r?.marked_by_role ?? null,
          marked_at: r?.marked_at ?? null,
        }
      }),
    }
  }

  // =========================
  // UPDATE SINGLE
  // =========================
  async update(
    meetingId: number,
    targetMemberId: number,
    dto: UpdateAttendanceDto,
    editorMemberId: number | null,
    userRole?: string,
  ) {
    const { editorRole, editorMemberIdForAudit } =
      await this.ensureAttendanceEditor(
        meetingId,
        editorMemberId,
        userRole,
      )

    await this.seedAttendanceRows(meetingId)

    return this.prisma.meeting_member_row.update({
      where: {
        meeting_id_member_id: {
          meeting_id: meetingId,
          member_id: targetMemberId,
        },
      },
      data: {
        status: dto.status,
        substitute_name:
          dto.status === attendance_status.SUBSTITUTE
            ? dto.substitute_name ?? null
            : null,

        is_auto_generated: false,
        marked_by_member_id: editorMemberIdForAudit,
        marked_by_role: editorRole,
        marked_at: new Date(),
      },
    })
  }

  // =========================
  // BULK UPDATE
  // =========================
  async bulkUpdate(
    meetingId: number,
    dto: BulkUpdateAttendanceDto,
    editorMemberId: number | null,
    userRole?: string,
  ) {
    const { editorRole, editorMemberIdForAudit } =
      await this.ensureAttendanceEditor(
        meetingId,
        editorMemberId,
        userRole,
      )

    await this.seedAttendanceRows(meetingId)

    if (!dto.rows?.length) {
      return { success: true, updated: 0 }
    }

    await this.prisma.$transaction(
      dto.rows.map((r) =>
        this.prisma.meeting_member_row.update({
          where: {
            meeting_id_member_id: {
              meeting_id: meetingId,
              member_id: r.member_id,
            },
          },
          data: {
            status: r.status,
            substitute_name:
              r.status === attendance_status.SUBSTITUTE
                ? r.substitute_name ?? null
                : null,

            is_auto_generated: false,
            marked_by_member_id: editorMemberIdForAudit,
            marked_by_role: editorRole,
            marked_at: new Date(),
          },
        }),
      ),
    )

    return { success: true, updated: dto.rows.length }
  }
}
