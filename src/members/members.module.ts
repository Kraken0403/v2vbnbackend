import { Module, forwardRef } from '@nestjs/common'
import { MembersController } from './members.controller'
import { MembersService } from './members.service'
import { PrismaModule } from '../prisma/prisma.module'
import { MemberProfileModule } from './profile/member-profile.module'
import { MemberContactModule } from './contact/member-contact.module'

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => MemberProfileModule), // ✅ FIX
    MemberContactModule,
  ],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService], // IMPORTANT
})
export class MembersModule {}
