import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    UseGuards,
  } from '@nestjs/common'
  import { MemberContactService } from './member-contact.service'
  import { UpdateMemberContactDto } from './dto/update-member-contact.dto'
  import { AuthGuard } from '@nestjs/passport'
  
  @Controller('members/:memberId/contact')
  @UseGuards(AuthGuard('jwt'))
  export class MemberContactController {
    constructor(private readonly service: MemberContactService) {}
  
    @Get()
    getContact(@Param('memberId') memberId: string) {
      return this.service.getContact(+memberId)
    }
  
    @Patch()
    updateContact(
      @Param('memberId') memberId: string,
      @Body() dto: UpdateMemberContactDto,
    ) {
      return this.service.upsertContact(+memberId, dto)
    }
  }
  