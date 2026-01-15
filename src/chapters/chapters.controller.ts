import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    UseGuards,
  } from '@nestjs/common'
  import { ChaptersService } from './chapters.service'
  import { AuthGuard } from '@nestjs/passport'
  import { RolesGuard } from '../auth/roles.guard'
  import { Roles } from '../auth/roles.decorator'
  import { global_role } from '@prisma/client'
  
  @Controller('chapters')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  export class ChaptersController {
    constructor(private readonly service: ChaptersService) {}
  
    @Get()
    findAll() {
      return this.service.findAll()
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.service.findOne(Number(id))
    }
  
    @Post()
    @Roles(global_role.ADMIN, global_role.SUPER_ADMIN)
    create(@Body() body: { name: string; slug: string; city?: string }) {
      return this.service.create(body)
    }
  
    @Patch(':id')
    @Roles(global_role.ADMIN, global_role.SUPER_ADMIN)
    update(
      @Param('id') id: string,
      @Body() body: { name?: string; city?: string },
    ) {
      return this.service.update(Number(id), body)
    }
  }
  