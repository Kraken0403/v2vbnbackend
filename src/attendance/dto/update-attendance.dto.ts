import {
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  IsArray,
  ValidateNested,
} from 'class-validator'
import { attendance_status } from '@prisma/client'
import { Type } from 'class-transformer'

export class UpdateAttendanceDto {
  @IsEnum(attendance_status)
  status: attendance_status

  @IsOptional()
  @IsString()
  substitute_name?: string
}

export class BulkAttendanceRowDto {
  @IsInt()
  member_id: number

  @IsEnum(attendance_status)
  status: attendance_status

  @IsOptional()
  @IsString()
  substitute_name?: string
}

export class BulkUpdateAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkAttendanceRowDto)
  rows: BulkAttendanceRowDto[]
}
