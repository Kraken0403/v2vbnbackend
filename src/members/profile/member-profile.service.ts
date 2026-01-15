import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { UpdateMemberProfileDto } from './dto/update-member-profile.dto'

@Injectable()
export class MemberProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(memberId: number) {
    return this.prisma.member_profile.findUnique({
      where: { member_id: memberId },
    })
  }

  async upsertProfile(memberId: number, data: UpdateMemberProfileDto) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    })

    if (!member) throw new NotFoundException('Member not found')

    return this.prisma.member_profile.upsert({
      where: { member_id: memberId },
      update: data,
      create: {
        member_id: memberId,
        ...data,
      },
    })
  }
}
