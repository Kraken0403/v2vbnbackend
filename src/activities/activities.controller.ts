import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Param,
    UseGuards,
    Req,
    ForbiddenException,
  } from '@nestjs/common'
  import { AuthGuard } from '@nestjs/passport'
  import { ActivitiesService } from './activities.service'
  import { CreateReferralDto } from './dto/create-referral.dto'
  import { CreateF2fDto } from './dto/create-f2f.dto'
  import { CreateAppreciationDto } from './dto/create-appreciation.dto'
  
  @Controller('activities')
  @UseGuards(AuthGuard('jwt'))
  export class ActivitiesController {
    constructor(private readonly service: ActivitiesService) {}
  
    // =========================
    // CREATE REFERRAL
    // =========================
    @Post('referral')
    createReferral(@Body() dto: CreateReferralDto, @Req() req: any) {
      const memberId = req.user?.memberId
      if (!memberId) {
        throw new ForbiddenException(
          'member_id missing in JWT. Activities require member login.',
        )
      }
      return this.service.createReferral(memberId, dto)
    }
  
    // =========================
    // CREATE F2F
    // =========================
    @Post('f2f')
    createF2f(@Body() dto: CreateF2fDto, @Req() req: any) {
      const memberId = req.user?.memberId
      if (!memberId) {
        throw new ForbiddenException(
          'member_id missing in JWT. Activities require member login.',
        )
      }
      return this.service.createF2f(memberId, dto)
    }
  
    // =========================
    // CREATE APPRECIATION
    // =========================
    @Post('appreciation')
    createAppreciation(@Body() dto: CreateAppreciationDto, @Req() req: any) {
      const memberId = req.user?.memberId
      if (!memberId) {
        throw new ForbiddenException(
          'member_id missing in JWT. Activities require member login.',
        )
      }
      return this.service.createAppreciation(memberId, dto)
    }
  
    // =========================
    // LIST ACTIVITIES (FILTERED)
    // =========================
    @Get()
    list(
      @Query('type') type?: string,
      @Query('from_member_id') fromMemberId?: string,
      @Query('to_member_id') toMemberId?: string,
      @Query('page') page = '1',
      @Query('limit') limit = '20',
    ) {
      return this.service.list({
        type,
        from_member_id: fromMemberId ? Number(fromMemberId) : undefined,
        to_member_id: toMemberId ? Number(toMemberId) : undefined,
        page: Number(page),
        limit: Number(limit),
      })
    }
  
    // =========================
    // MEMBER TIMELINE
    // =========================
    @Get('member/:memberId')
    listForMember(@Param('memberId') memberId: string) {
      return this.service.listForMember(Number(memberId))
    }
  }
  