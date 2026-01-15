import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator'

export class CreateMeetingDto {
  @IsInt()
  chapter_id: number

  @IsString()
  title: string

  @IsDateString()
  meeting_at: string

  @IsOptional()
  @IsString()
  venue?: string

  @IsOptional()
  @IsString()
  map_link?: string
}
