import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateIf,
} from 'class-validator'
import { referral_type } from '@prisma/client'

export class CreateReferralDto {
  @IsEnum(referral_type)
  referral_type: referral_type

  // ✅ optional meeting link
  @IsOptional()
  @IsInt()
  meeting_id?: number

  // INSIDE
  @ValidateIf(o => o.referral_type === referral_type.INSIDE)
  @IsInt()
  to_member_id?: number

  // OUTSIDE
  @ValidateIf(o => o.referral_type === referral_type.OUTSIDE)
  @IsString()
  referral_name?: string

  @ValidateIf(o => o.referral_type === referral_type.OUTSIDE)
  @IsString()
  referral_phone?: string

  @IsInt()
  @Min(1)
  @Max(5)
  hotness: number

  @IsOptional()
  @IsString()
  note?: string
}
