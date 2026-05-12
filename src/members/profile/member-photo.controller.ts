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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { RolesGuard } from '../../auth/roles.guard'
import { MemberProfileService } from './member-profile.service'
import { CurrentUser } from '../../auth/current-user.decorator'
import { MembersService } from '../members.service'

const uploadDir = './uploads/members'

function ensureUploadDir() {
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true })
  }
}

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

@ApiTags('Member Photos')
@ApiBearerAuth('JWT-auth')
@Controller('members/:id/profile/photo')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MemberPhotoController {
  constructor(
    private readonly profileService: MemberProfileService,
    private readonly membersService: MembersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Upload member profile photo' })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
    description: 'Member ID',
    example: 123,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload JPG, JPEG, PNG, or WEBP member photo. Max size: 5MB.',
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          ensureUploadDir()
          cb(null, uploadDir)
        },
        filename,
      }),
      fileFilter: imageFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async upload(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    const memberId = Number(id)

    this.membersService.ensureOwnerOrAdmin(user, memberId)

    if (!file) {
      throw new BadRequestException('File is required')
    }

    const url = `/uploads/members/${file.filename}`

    await this.profileService.upsertProfile(memberId, {
      photo_url: url,
    })

    return {
      message: 'Member photo uploaded successfully',
      photo_url: url,
    }
  }
}
