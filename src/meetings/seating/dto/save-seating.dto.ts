import {
    IsArray,
    ArrayNotEmpty,
    ValidateNested,
  } from 'class-validator'
  import { Type } from 'class-transformer'
  import { SeatingMemberDto } from './seating-member.dto'
  
  export class SaveSeatingDto {
    @IsArray({ message: 'members must be an array' })
    @ArrayNotEmpty({ message: 'members array cannot be empty' })
    @ValidateNested({ each: true })
    @Type(() => SeatingMemberDto)
    members: SeatingMemberDto[]
  }
  