import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    UseGuards,
  } from '@nestjs/common'
  import { AuthGuard } from '@nestjs/passport'
  import { RolesGuard } from '../auth/roles.guard'
  import { Roles } from '../auth/roles.decorator'
  import { global_role } from '@prisma/client'
  import { MembersService } from './members.service'
  import { CreateMemberDto } from './dto/create-member.dto'
  import { UpdateMemberDto } from './dto/update-member.dto'
  import { AssignMemberDto } from './dto/assign-member.dto'
  import { LinkUserDto } from './dto/link-user.dto'
  import { AssignChapterRoleDto } from './dto/assign-chapter-role.dto'
  @Controller('members')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  export class MembersController {
    constructor(private readonly service: MembersService) {}
  
    @Get()
    findAll() {
      return this.service.findAll()
    }
  
    @Get('chapter/:chapterId')
    findByChapter(@Param('chapterId') chapterId: string) {
      return this.service.findByChapter(Number(chapterId))
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.service.findOne(Number(id))
    }
  
    @Post()
    @Roles(global_role.ADMIN, global_role.SUPER_ADMIN, global_role.STAFF)
    create(@Body() body: CreateMemberDto) {
      return this.service.create(body)
    }
  
    @Patch(':id')
    @Roles(global_role.ADMIN, global_role.SUPER_ADMIN, global_role.STAFF)
    update(@Param('id') id: string, @Body() body: UpdateMemberDto) {
      return this.service.update(Number(id), body)
    }
  
    @Post(':id/assign')
    @Roles(global_role.ADMIN, global_role.SUPER_ADMIN, global_role.STAFF)
    assign(@Param('id') id: string, @Body() body: AssignMemberDto) {
      return this.service.assignToChapter(Number(id), body)
    }
  
    @Post(':id/link-user')
    @Roles(global_role.ADMIN, global_role.SUPER_ADMIN)
    linkUser(@Param('id') id: string, @Body() body: LinkUserDto) {
      return this.service.linkUser(Number(id), body)
    }

    @Post(':id/chapter-roles')
    @Roles(global_role.ADMIN, global_role.SUPER_ADMIN, global_role.STAFF)
    assignChapterRole(
      @Param('id') id: string,
      @Body() body: AssignChapterRoleDto,
    ) {
      return this.service.assignChapterRole(Number(id), body)
    }
  
    // 🎂 birthdays
    @Get('birthdays/today')
    birthdaysToday() {
      return this.service.birthdaysToday()
    }
  
    @Get('birthdays/month')
    birthdaysMonth() {
      return this.service.birthdaysMonth()
    }
  
    @Get('chapters/:chapterId/birthdays')
    birthdaysByChapter(@Param('chapterId') chapterId: string) {
      return this.service.birthdaysByChapter(Number(chapterId))
    }
  }
  