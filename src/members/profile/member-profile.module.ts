import { Module, forwardRef } from '@nestjs/common'
import { MemberProfileController } from './member-profile.controller'
import { MemberPhotoController } from './member-photo.controller'
import { MemberProfileService } from './member-profile.service'
import { MembersModule } from '../members.module'

@Module({
  imports: [
    forwardRef(() => MembersModule), // ✅ FIX
  ],
  controllers: [
    MemberProfileController,
    MemberPhotoController,
  ],
  providers: [MemberProfileService],
  exports: [MemberProfileService],
})
export class MemberProfileModule {}
