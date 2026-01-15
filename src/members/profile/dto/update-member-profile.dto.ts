import {
  IsOptional,
  IsString,
  IsBoolean,
  IsUrl,
} from 'class-validator'
import { Expose } from 'class-transformer'

export class UpdateMemberProfileDto {
  @IsOptional()
  @IsString()
  headline?: string

  @IsOptional()
  @IsString()
  about?: string

  @IsOptional()
  @IsString()
  business_description?: string

  @IsOptional()
  @IsUrl()
  website?: string

  @IsOptional()
  @IsUrl()
  linkedin?: string

  @IsOptional()
  @IsUrl()
  instagram?: string

  @IsOptional()
  @IsUrl()
  facebook?: string

  @IsOptional()
  @IsUrl()
  youtube?: string

  @IsOptional()
  @IsString()
  photo_url?: string

  // ✅ ACCEPT showEmail
  @Expose({ name: 'showEmail' })
  @IsOptional()
  @IsBoolean()
  show_email?: boolean

  // ✅ ACCEPT showPhone
  @Expose({ name: 'showPhone' })
  @IsOptional()
  @IsBoolean()
  show_phone?: boolean

  @IsOptional()
  company_address?: any

  @IsOptional()
  @IsString()
  gst_number?: string
}
