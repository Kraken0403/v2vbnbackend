import { Module } from '@nestjs/common'
import { MeetingSeatingController } from './meeting-seating.controller'
import { MeetingSeatingService } from './meeting-seating.service'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [MeetingSeatingController],
  providers: [MeetingSeatingService],
  exports: [MeetingSeatingService],
})
export class MeetingSeatingModule {}
