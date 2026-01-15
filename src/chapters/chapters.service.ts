import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ChaptersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.chapter.findMany({
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: number) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
    })

    if (!chapter) throw new NotFoundException('Chapter not found')
    return chapter
  }

  async create(data: { name: string; slug: string; city?: string }) {
    return this.prisma.chapter.create({ data })
  }

  async update(
    id: number,
    data: { name?: string; city?: string },
  ) {
    return this.prisma.chapter.update({
      where: { id },
      data,
    })
  }
}
