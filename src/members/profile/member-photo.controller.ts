import {
    Controller,
    Post,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
  } from '@nestjs/common'
  import { AuthGuard } from '@nestjs/passport'
  import { RolesGuard } from '../../auth/roles.guard'
  import { FileInterceptor } from '@nestjs/platform-express'
  import { diskStorage } from 'multer'
  import { extname } from 'path'
  import { MemberProfileService } from './member-profile.service'
  import { CurrentUser } from '../../auth/current-user.decorator'
  import { MembersService } from '../members.service'
  
  function filename(req: any, file: any, cb: any) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${extname(file.originalname)}`)
  }
  
  function imageFilter(req: any, file: any, cb: any) {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      return cb(new BadRequestException('Only image files are allowed'), false)
    }
    cb(null, true)
  }
  
  @Controller('members/:id/profile/photo')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  export class MemberPhotoController {
    constructor(
      private readonly profileService: MemberProfileService,
      private readonly membersService: MembersService,
    ) {}
  
    @Post()
    @UseInterceptors(
      FileInterceptor('file', {
        storage: diskStorage({
          destination: './uploads/members',
          filename,
        }),
        fileFilter: imageFilter,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      }),
    )
    async upload(
      @Param('id') id: string,
      @UploadedFile() file: Express.Multer.File,
      @CurrentUser() user: any,
    ) {
      const memberId = Number(id)
  
      this.membersService.ensureOwnerOrAdmin(user, memberId)
  
      if (!file) throw new BadRequestException('File is required')
  
      const url = `/uploads/members/${file.filename}`
  
      await this.profileService.upsertProfile(memberId, {
        photo_url: url,
      })
  
      return { photo_url: url }
    }
  }
  