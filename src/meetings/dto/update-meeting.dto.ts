import { IsDateString, IsOptional, IsString } from 'class-validator'

export class UpdateMeetingDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsDateString()
  meeting_at?: string

  @IsOptional()
  @IsString()
  venue?: string

  @IsOptional()
  @IsString()
  map_link?: string
}
