// src/public/public.controller.ts
import { Controller, Get, Param, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Controller('public')
export class PublicController {
  constructor(private prisma: PrismaService) {}

  @Get('chapters/:slug/roster')
  async chapterRoster(@Param('slug') slug: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        city: true,
        member_links: {
          where: { is_active: true },
          select: {
            member: {
              select: {
                id: true,
                full_name: true,
                company_name: true,
                designation: true,
                category: true,
                industry: true,
                email: true,
                profile: {
                  select: {
                    photo_url: true,
                  },
                },
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

    if (!chapter) {
      throw new NotFoundException('Chapter not found')
    }

    return chapter
  }
}
