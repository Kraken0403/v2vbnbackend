import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateReferralDto } from './dto/create-referral.dto'
import { CreateF2fDto } from './dto/create-f2f.dto'
import { CreateAppreciationDto } from './dto/create-appreciation.dto'
import { activity_type, referral_type } from '@prisma/client'

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // GUARDS
  // =========================
  private async ensureMemberActive(memberId: number) {
    if (!memberId) {
      throw new ForbiddenException(
        'member_id missing in JWT. Activities require member login.',
      )
    }

    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    })

    if (!member || !member.is_active) {
      throw new ForbiddenException('Member is inactive or not found')
    }

    return member
  }

  private async ensureToMemberValid(toMemberId: number) {
    const toMember = await this.prisma.member.findUnique({
      where: { id: toMemberId },
    })

    if (!toMember || !toMember.is_active) {
      throw new BadRequestException('Target member not found or inactive')
    }

    return toMember
  }

  /**
   * ✅ NEW: Validate meeting_id (if provided)
   * Rules:
   * - meeting must exist
   * - fromMember must belong to meeting's chapter
   * Returns meeting_id (same number) if OK, else throws
   */
  private async ensureMeetingValid(meetingId: number, fromMemberId: number) {
    if (!meetingId) return null

    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { id: true, chapter_id: true },
    })

    if (!meeting) {
      throw new BadRequestException('Invalid meeting_id')
    }

    const link = await this.prisma.member_chapter.findFirst({
      where: {
        member_id: fromMemberId,
        chapter_id: meeting.chapter_id,
        is_active: true,
      },
      select: { id: true },
    })

    if (!link) {
      throw new ForbiddenException(
        'You are not a member of this meeting chapter',
      )
    }

    return meeting.id
  }

  // =========================
  // REFERRAL
  // =========================
  async createReferral(fromMemberId: number, dto: CreateReferralDto) {
    await this.ensureMemberActive(fromMemberId)

    // ✅ NEW: meeting_id (optional)
    const meetingId = dto.meeting_id
      ? await this.ensureMeetingValid(dto.meeting_id, fromMemberId)
      : null

    // INSIDE REFERRAL
    if (dto.referral_type === referral_type.INSIDE) {
      if (!dto.to_member_id) {
        throw new BadRequestException(
          'to_member_id is required for INSIDE referral',
        )
      }

      const toMember = await this.ensureToMemberValid(dto.to_member_id)

      return this.prisma.activity.create({
        data: {
          type: activity_type.REFERRAL,
          meeting_id: meetingId, // ✅ NEW
          from_member_id: fromMemberId,
          to_member_id: toMember.id,

          referral_type: referral_type.INSIDE,
          referral_name: toMember.full_name,
          referral_phone: toMember.phone ?? null,
          hotness: dto.hotness,

          amount: null,
          note: dto.note ?? null,
          f2f_location: null,
          f2f_discussion: null,
        },
        include: {
          from_member: true,
          to_member: true,
        },
      })
    }

    // OUTSIDE REFERRAL
    if (!dto.referral_name || !dto.referral_phone) {
      throw new BadRequestException(
        'referral_name and referral_phone are required for OUTSIDE referral',
      )
    }

    return this.prisma.activity.create({
      data: {
        type: activity_type.REFERRAL,
        meeting_id: meetingId, // ✅ NEW
        from_member_id: fromMemberId,
        to_member_id: null,

        referral_type: referral_type.OUTSIDE,
        referral_name: dto.referral_name,
        referral_phone: dto.referral_phone,
        hotness: dto.hotness,

        amount: null,
        note: dto.note ?? null,
        f2f_location: null,
        f2f_discussion: null,
      },
      include: {
        from_member: true,
        to_member: true,
      },
    })
  }

  // =========================
  // F2F
  // =========================
  async createF2f(fromMemberId: number, dto: CreateF2fDto) {
    await this.ensureMemberActive(fromMemberId)
    await this.ensureToMemberValid(dto.to_member_id)

    // ✅ NEW: meeting_id (optional)
    const meetingId = dto.meeting_id
      ? await this.ensureMeetingValid(dto.meeting_id, fromMemberId)
      : null

    return this.prisma.activity.create({
      data: {
        type: activity_type.F2F,
        meeting_id: meetingId, // ✅ NEW
        from_member_id: fromMemberId,
        to_member_id: dto.to_member_id,

        f2f_location: dto.location,
        f2f_discussion: dto.discussion,

        amount: null,
        note: dto.note ?? null,
        referral_type: null,
        referral_name: null,
        referral_phone: null,
        hotness: null,
      },
      include: {
        from_member: true,
        to_member: true,
      },
    })
  }

  // =========================
  // APPRECIATION
  // =========================
  async createAppreciation(fromMemberId: number, dto: CreateAppreciationDto) {
    await this.ensureMemberActive(fromMemberId)
    await this.ensureToMemberValid(dto.to_member_id)

    // ✅ NEW: meeting_id (optional)
    const meetingId = dto.meeting_id
      ? await this.ensureMeetingValid(dto.meeting_id, fromMemberId)
      : null

    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0')
    }

    return this.prisma.activity.create({
      data: {
        type: activity_type.APPRECIATION,
        meeting_id: meetingId, // ✅ NEW
        from_member_id: fromMemberId,
        to_member_id: dto.to_member_id,

        amount: dto.amount.toFixed(2) as any, // keep same behavior (Prisma Decimal accepts string)
        note: dto.note ?? null,

        referral_type: null,
        referral_name: null,
        referral_phone: null,
        hotness: null,
        f2f_location: null,
        f2f_discussion: null,
      },
      include: {
        from_member: true,
        to_member: true,
      },
    })
  }

  // =========================
  // LISTING
  // =========================
  async list(params: {
    type?: string
    from_member_id?: number
    to_member_id?: number
    page: number
    limit: number
  }) {
    const where: any = {}

    if (params.type) where.type = params.type
    if (params.from_member_id) where.from_member_id = params.from_member_id
    if (params.to_member_id !== undefined) where.to_member_id = params.to_member_id

    const skip = (params.page - 1) * params.limit

    const [items, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: params.limit,
        include: {
          from_member: true,
          to_member: true,
        },
      }),
      this.prisma.activity.count({ where }),
    ])

    return {
      page: params.page,
      limit: params.limit,
      total,
      items,
    }
  }

  async listForMember(memberId: number) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    })
    if (!member) throw new NotFoundException('Member not found')

    return this.prisma.activity.findMany({
      where: {
        OR: [{ from_member_id: memberId }, { to_member_id: memberId }],
      },
      orderBy: { created_at: 'desc' },
      include: {
        from_member: true,
        to_member: true,
      },
    })
  }
}
