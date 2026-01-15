import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AttendanceService } from './attendance.service'
import {
  UpdateAttendanceDto,
  BulkUpdateAttendanceDto,
} from './dto/update-attendance.dto'

@Controller('meetings/:id/attendance')
@UseGuards(AuthGuard('jwt'))
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  /**
   * Get attendance list (ordered by seating)
   */
  @Get()
  list(@Param('id') id: string, @Req() req: any) {
    return this.service.list(
      Number(id),
      req.user.memberId ?? null, // ✅ memberId (null for admin)
      req.user.role,             // ✅ role
    )
  }

  /**
   * Bulk update attendance
   */
  @Patch()
  bulkUpdate(
    @Param('id') id: string,
    @Body() dto: BulkUpdateAttendanceDto,
    @Req() req: any,
  ) {
    return this.service.bulkUpdate(
      Number(id),
      dto,
      req.user.memberId ?? null, // ✅ memberId
      req.user.role,             // ✅ role
    )
  }

  /**
   * Update single member attendance
   */
  @Patch(':memberId')
  update(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateAttendanceDto,
    @Req() req: any,
  ) {
    return this.service.update(
      Number(id),
      Number(memberId),
      dto,
      req.user.memberId ?? null, // ✅ editor memberId
      req.user.role,             // ✅ role
    )
  }
}
