import {
    IsString,
    IsOptional,
    IsEmail,
    IsBoolean,
    IsDateString,
  } from 'class-validator'
  
  export class UpdateMemberDto {
    @IsOptional()
    @IsString()
    full_name?: string
  
    @IsOptional()
    @IsString()
    slug?: string
  
    @IsOptional()
    @IsString()
    salutation?: string
  
    @IsOptional()
    @IsDateString()
    birth_date?: string
  
    @IsOptional()
    @IsString()
    membership_number?: string
  
    @IsOptional()
    @IsString()
    membership_category?: string
  
    @IsOptional()
    @IsString()
    company_name?: string
  
    @IsOptional()
    @IsString()
    designation?: string
  
    @IsOptional()
    @IsString()
    category?: string
  
    @IsOptional()
    @IsString()
    industry?: string
  
    @IsOptional()
    @IsString()
    city?: string
  
    @IsOptional()
    @IsString()
    state?: string
  
    @IsOptional()
    @IsString()
    phone?: string
  
    @IsOptional()
    @IsEmail()
    email?: string
  
    @IsOptional()
    @IsBoolean()
    is_active?: boolean
  }
  