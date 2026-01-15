import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { MeetingsService } from './meetings.service'
import { CreateMeetingDto } from './dto/create-meeting.dto'
import { UpdateMeetingDto } from './dto/update-meeting.dto'

@Controller('meetings')
@UseGuards(AuthGuard('jwt'))
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  /**
   * Create meeting
   * POST /meetings
   * ADMIN + MEMBER
   */
  @Post()
  create(@Body() dto: CreateMeetingDto, @Req() req: any) {
    return this.meetingsService.createMeeting(
      dto,
      req.user?.memberId,
      req.user,
    )
  }

  /**
   * List meetings by chapter
   * GET /meetings/chapter/:chapterId
   */
  @Get('chapter/:chapterId')
  list(@Param('chapterId') chapterId: string) {
    return this.meetingsService.listMeetings(Number(chapterId))
  }

  /**
   * Get single meeting
   * GET /meetings/:id
   */
  @Get(':id')
  get(@Param('id') id: string) {
    return this.meetingsService.getMeeting(Number(id))
  }

  /**
   * Close meeting
   * POST /meetings/:id/close
   * ADMIN + CREATOR
   */
  @Post(':id/close')
  close(@Param('id') id: string, @Req() req: any) {
    return this.meetingsService.closeMeeting(
      Number(id),
      req.user?.memberId,
      req.user,
    )
  }

  /**
   * Update meeting
   * PATCH /meetings/:id
   * ADMIN + CREATOR
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMeetingDto,
    @Req() req: any,
  ) {
    return this.meetingsService.updateMeeting(
      Number(id),
      dto,
      req.user?.memberId,
      req.user,
    )
  }
}
