import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT access token' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          example: 'admin@example.com',
        },
        password: {
          type: 'string',
          example: 'password123',
        },
      },
    },
  })
  login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(email, password)
  }

  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email)
  }

  @Post('reset-password')
  resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password)
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: any) {
    return this.authService.me(req.user)
  }
}
