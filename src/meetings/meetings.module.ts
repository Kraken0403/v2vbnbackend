import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { MeetingsController } from './meetings.controller'
import { MeetingsService } from './meetings.service'
import { MeetingSeatingModule } from './seating/meeting-seating.module'

@Module({
  imports: [PrismaModule, MeetingSeatingModule],
  controllers: [MeetingsController],
  providers: [MeetingsService],
  exports: [MeetingsService],
})
export class MeetingsModule {}
