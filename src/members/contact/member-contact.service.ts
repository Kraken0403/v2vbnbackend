import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { UpdateMemberContactDto } from './dto/update-member-contact.dto'

@Injectable()
export class MemberContactService {
  constructor(private prisma: PrismaService) {}

  async getContact(memberId: number) {
    return this.prisma.member_contact.findUnique({
      where: { member_id: memberId },
    })
  }

  async upsertContact(memberId: number, data: UpdateMemberContactDto) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    })

    if (!member) throw new NotFoundException('Member not found')

    return this.prisma.member_contact.upsert({
      where: { member_id: memberId },
      update: data,
      create: {
        member_id: memberId,
        ...data,
      },
    })
  }
}
