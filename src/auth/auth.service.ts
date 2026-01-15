import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { sendResetPasswordEmail } from '../utils/mail'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ===============================
  // LOGIN
  // ===============================
  async login(email: string, password: string) {
    // 1️⃣ Fetch user
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // 2️⃣ Fetch linked member explicitly
    const member = await this.prisma.member.findUnique({
      where: { user_id: user.id },
    })

    // 3️⃣ Build JWT payload
    const payload = {
      sub: user.id,
      role: user.role,
      memberId: member?.id ?? null,
      email: user.email ?? null,
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        memberId: member?.id ?? null,
      },
    }
  }

  // ===============================
  // CURRENT USER (ME)
  // ===============================
  async me(jwtUser: any) {
    const userId = jwtUser?.userId

    if (!userId) {
      throw new UnauthorizedException('Invalid token')
    }

    // 1️⃣ Fetch user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
      },
    })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    // 2️⃣ Fetch member + chapters
    const member = await this.prisma.member.findUnique({
      where: { user_id: userId },
      select: {
        id: true,
        full_name: true,
        company_name: true,
        designation: true,
        category: true,
        industry: true,
        city: true,
        state: true,
        phone: true,
        email: true,
        chapters: {
          where: { is_active: true },
          select: {
            chapter: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
            roles: {
              select: {
                role: true,
              },
            },
          },
        },
      },
    })

    return {
      ...user,
      member, // may be null for ADMIN / STAFF
    }
  }

  // ===============================
  // FORGOT PASSWORD
  // ===============================
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { message: 'If email exists, reset link sent' }
    }

    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    const expiry = new Date(Date.now() + 30 * 60 * 1000) // 30 min

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: tokenHash,
        reset_token_expiry: expiry,
      },
    })

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

    await sendResetPasswordEmail(user.email!, resetLink)

    return { message: 'If email exists, reset link sent' }
  }

  // ===============================
  // RESET PASSWORD
  // ===============================
  async resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    const user = await this.prisma.user.findFirst({
      where: {
        reset_token: tokenHash,
        reset_token_expiry: { gt: new Date() },
      },
    })

    if (!user) {
      throw new BadRequestException('Invalid or expired token')
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        reset_token: null,
        reset_token_expiry: null,
      },
    })

    return { message: 'Password reset successful' }
  }
}
