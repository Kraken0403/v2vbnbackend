import { IsInt, IsString, IsOptional } from 'class-validator'

export class CreateF2fDto {
  @IsOptional()
  @IsInt()
  meeting_id?: number

  @IsInt()
  to_member_id: number

  @IsString()
  location: string

  @IsString()
  discussion: string

  @IsOptional()
  @IsString()
  note?: string
}
