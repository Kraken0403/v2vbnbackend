import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    UseGuards,
  } from '@nestjs/common'
  import { AuthGuard } from '@nestjs/passport'
  
  import { MemberProfileService } from './member-profile.service'
  import { UpdateMemberProfileDto } from './dto/update-member-profile.dto'
  import { MembersService } from '../members.service'
  import { CurrentUser } from '../../auth/current-user.decorator'
  import { RolesGuard } from '../../auth/roles.guard'
  
  @Controller('members/:memberId/profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  export class MemberProfileController {
    constructor(
      private readonly profileService: MemberProfileService,
      private readonly membersService: MembersService,
    ) {}
  
    @Get()
    async getProfile(
      @Param('memberId') memberId: string,
      @CurrentUser() user: any,
    ) {
      const id = Number(memberId)
  
      // ✅ security check
      this.membersService.ensureOwnerOrAdmin(user, id)
  
      return this.profileService.getProfile(id)
    }
  
    @Patch()
    async updateProfile(
      @Param('memberId') memberId: string,
      @Body() dto: UpdateMemberProfileDto,
      @CurrentUser() user: any,
    ) {
      const id = Number(memberId)
  
      // ✅ security check
      this.membersService.ensureOwnerOrAdmin(user, id)
  
      return this.profileService.upsertProfile(id, dto)
    }
  }
  