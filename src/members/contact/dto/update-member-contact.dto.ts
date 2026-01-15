import { IsOptional, IsString } from 'class-validator'

export class UpdateMemberContactDto {
  @IsOptional()
  @IsString()
  office_email?: string

  @IsOptional()
  @IsString()
  personal_email?: string

  @IsOptional()
  @IsString()
  company_phone?: string

  @IsOptional()
  @IsString()
  residence_phone?: string

  @IsOptional()
  company_address?: any

  @IsOptional()
  residence_address?: any
}
