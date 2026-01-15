import { IsInt, Min } from 'class-validator'

export class SeatingMemberDto {
  @IsInt({ message: 'member_id must be an integer' })
  member_id: number

  @IsInt({ message: 'sequence must be an integer' })
  @Min(1, { message: 'sequence must be >= 1' })
  sequence: number
}
