import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateMeetingDto } from './dto/create-meeting.dto'
import { UpdateMeetingDto } from './dto/update-meeting.dto'

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  /* ============================
     CREATE MEETING
     ============================ */
  async createMeeting(
    dto: CreateMeetingDto,
    memberId: number | undefined,
    user: any,
  ) {
    // ✅ ADMIN CAN CREATE
    if (user.role === 'ADMIN') {
      return this.prisma.meeting.create({
        data: {
          chapter_id: dto.chapter_id,
          title: dto.title,
          meeting_at: new Date(dto.meeting_at),
          created_by: null,
          status: 'OPEN',
        },
      })
    }

    // ❌ MEMBER REQUIRED
    if (!memberId) {
      throw new ForbiddenException('Member login required')
    }

    // ✅ MEMBER MUST BELONG TO CHAPTER
    const memberChapter =
      await this.prisma.member_chapter.findFirst({
        where: {
          member_id: memberId,
          chapter_id: dto.chapter_id,
          is_active: true,
        },
      })

    if (!memberChapter) {
      throw new ForbiddenException(
        'You are not a member of this chapter',
      )
    }

    return this.prisma.meeting.create({
      data: {
        chapter_id: dto.chapter_id,
        title: dto.title,
        meeting_at: new Date(dto.meeting_at),
        created_by: memberId,
        status: 'OPEN',
      },
    })
  }

  /* ============================
     LIST MEETINGS
     ============================ */
  async listMeetings(chapterId: number) {
    return this.prisma.meeting.findMany({
      where: { chapter_id: chapterId },
      orderBy: { meeting_at: 'desc' },
    })
  }

  /* ============================
     GET MEETING
     ============================ */
  async getMeeting(id: number) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
    })

    if (!meeting) {
      throw new NotFoundException('Meeting not found')
    }

    return meeting
  }

  /* ============================
     CLOSE MEETING
     ============================ */
  async closeMeeting(
    meetingId: number,
    memberId: number | undefined,
    user: any,
  ) {
    const meeting = await this.getMeeting(meetingId)

    // ❌ Already closed
    if (meeting.status === 'CLOSED') {
      throw new ForbiddenException('Meeting already closed')
    }

    // ✅ ADMIN CAN CLOSE
    if (user.role === 'ADMIN') {
      return this.prisma.meeting.update({
        where: { id: meetingId },
        data: { status: 'CLOSED' },
      })
    }

    if (!memberId) {
      throw new ForbiddenException('Member login required')
    }

    if (meeting.created_by !== memberId) {
      throw new ForbiddenException(
        'Only creator can close the meeting',
      )
    }

    return this.prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'CLOSED' },
    })
  }

  /* ============================
     UPDATE MEETING
     ============================ */
  async updateMeeting(
    meetingId: number,
    dto: UpdateMeetingDto,
    memberId: number | undefined,
    user: any,
  ) {
    const meeting = await this.getMeeting(meetingId)

    // ❌ Closed meetings cannot be edited
    if (meeting.status === 'CLOSED') {
      throw new ForbiddenException(
        'Closed meetings cannot be updated',
      )
    }

    // ✅ ADMIN CAN UPDATE
    if (user.role === 'ADMIN') {
      return this.prisma.meeting.update({
        where: { id: meetingId },
        data: {
          title: dto.title,
          meeting_at: dto.meeting_at
            ? new Date(dto.meeting_at)
            : undefined,
        },
      })
    }

    if (!memberId) {
      throw new ForbiddenException('Member login required')
    }

    if (meeting.created_by !== memberId) {
      throw new ForbiddenException(
        'Only creator can update meeting',
      )
    }

    return this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        title: dto.title,
        meeting_at: dto.meeting_at
          ? new Date(dto.meeting_at)
          : undefined,
      },
    })
  }
}
