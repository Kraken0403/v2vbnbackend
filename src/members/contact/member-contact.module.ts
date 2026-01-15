import { Module } from '@nestjs/common'
import { MemberContactController } from './member-contact.controller'
import { MemberContactService } from './member-contact.service'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [MemberContactController],
  providers: [MemberContactService],
})
export class MemberContactModule {}
