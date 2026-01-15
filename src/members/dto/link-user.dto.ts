import { IsNumber } from 'class-validator'

export class LinkUserDto {
  @IsNumber()
  user_id: number
}
