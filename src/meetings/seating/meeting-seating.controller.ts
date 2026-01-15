import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { MeetingSeatingService } from './meeting-seating.service'
import { SaveSeatingDto } from './dto/save-seating.dto'
import { global_role } from '@prisma/client'

@Controller('meetings/:id/seating')
@UseGuards(AuthGuard('jwt'))
export class MeetingSeatingController {
  constructor(private readonly service: MeetingSeatingService) {}

  /**
   * Build editor context for service
   * ADMIN / SUPER_ADMIN → memberId = null
   * MEMBER → memberId present
   */
  private getEditor(req: any) {
    return {
      userId: req.user?.userId,
      role: req.user?.role as global_role,
      memberId: req.user?.memberId ?? null,
    }
  }

  // 🔹 Get candidates for seating
  @Get('candidates')
  candidates(@Param('id') id: string, @Req() req: any) {
    return this.service.candidates(
      Number(id),
      this.getEditor(req),
    )
  }

  // 🔹 Get current seating
  @Get()
  get(@Param('id') id: string, @Req() req: any) {
    return this.service.get(
      Number(id),
      this.getEditor(req),
    )
  }

  // 🔹 Save seating order
  @Post()
  save(
    @Param('id') id: string,
    @Body() dto: SaveSeatingDto,
    @Req() req: any,
  ) {
    return this.service.save(
      Number(id),
      this.getEditor(req),
      dto.members,
    )
  }

  // 🔹 Use last meeting's seating
  @Post('use-last')
  useLast(@Param('id') id: string, @Req() req: any) {
    return this.service.useLast(
      Number(id),
      this.getEditor(req),
    )
  }
}
