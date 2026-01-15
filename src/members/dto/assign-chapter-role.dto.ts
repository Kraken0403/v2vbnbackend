import { IsEnum, IsInt } from 'class-validator'
import { chapter_role_type } from '@prisma/client'

export class AssignChapterRoleDto {
  @IsInt()
  chapter_id: number

  @IsEnum(chapter_role_type)
  role: chapter_role_type
}
