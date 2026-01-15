import { IsInt, IsNumber, Min, IsOptional, IsString } from 'class-validator'

export class CreateAppreciationDto {
  @IsOptional()
  @IsInt()
  meeting_id?: number

  @IsInt()
  to_member_id: number

  @IsNumber()
  @Min(1)
  amount: number

  @IsOptional()
  @IsString()
  note?: string
}
