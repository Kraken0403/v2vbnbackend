import { IsNumber, IsOptional, IsEnum, IsArray } from 'class-validator'
import { chapter_role_type } from '@prisma/client'

export class AssignMemberDto {
  @IsNumber()
  chapter_id: number

  @IsOptional()
  @IsArray()
  @IsEnum(chapter_role_type, { each: true })
  roles?: chapter_role_type[]
}
