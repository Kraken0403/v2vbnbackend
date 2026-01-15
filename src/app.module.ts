import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { ChaptersModule } from './chapters/chapters.module'
import { MembersModule } from './members/members.module'
import { MeetingsModule } from './meetings/meetings.module'
import { ActivitiesModule } from './activities/activities.module'
import { AttendanceModule } from './attendance/attendance.module';
import { PublicModule } from './public/public.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    PrismaModule,
    AuthModule,
    ChaptersModule,
    MembersModule,
    MeetingsModule, 
    AttendanceModule,
    ActivitiesModule,
    PublicModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
