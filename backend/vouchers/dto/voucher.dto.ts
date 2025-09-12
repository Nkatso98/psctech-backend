import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsDateString, Min, Max, Length, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Align with frontend UserRole enum
export enum UserRole {
  SUPERADMIN = 'Superadmin',
  PRINCIPAL = 'Principal',
  TEACHER = 'Teacher',
  PARENT = 'Parent',
  LEARNER = 'Learner',
  SGB = 'SGB'
}

// Align with frontend status values
export enum VoucherStatus {
  ACTIVE = 'active',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

// Align with frontend denomination values
export enum VoucherDenomination {
  FIVE = 5,
  TEN = 10,
  FIFTEEN = 15,
  TWENTY = 20,
  TWENTY_FIVE = 25,
  THIRTY = 30,
  THIRTY_FIVE = 35,
  FORTY = 40,
  FORTY_FIVE = 45
}

export class CreateVoucherDto {
  @ApiProperty({ description: 'Voucher value in Rand', enum: VoucherDenomination, example: 25 })
  @IsNumber()
  @IsEnum(VoucherDenomination)
  value: number;

  @ApiProperty({ description: 'Number of learners this voucher will activate', minimum: 1, maximum: 10, example: 2 })
  @IsNumber()
  @Min(1)
  @Max(10)
  learnerCount: number;

  @ApiProperty({ description: 'Full name of parent/guardian', minLength: 2, maxLength: 100, example: 'John Johnson' })
  @IsString()
  @Length(2, 100)
  parentName: string;

  @ApiPropertyOptional({ description: 'Optional notes for tracking purposes', maxLength: 200, example: 'Parent payment for January - 2 children' })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  notes?: string;
}

export class RedeemVoucherDto {
  @ApiProperty({ description: '16-character voucher code in format XXXX-XXXX-XXXX-XXXX', minLength: 19, maxLength: 19, example: 'ABCD-EFGH-JKLM-NPQR' })
  @IsString()
  @Length(19, 19)
  code: string;
}

export class VoucherResponseDto {
  @ApiProperty({ description: 'Unique voucher identifier', example: 'uuid-string' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: '16-character voucher code', example: 'ABCD-EFGH-JKLM-NPQR' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Voucher value in Rand', example: 25 })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Number of learners this voucher activates', example: 2 })
  @IsNumber()
  learnerCount: number;

  @ApiProperty({ description: 'Parent/guardian name', example: 'John Johnson' })
  @IsString()
  parentName: string;

  @ApiProperty({ description: 'Current voucher status', enum: VoucherStatus })
  @IsEnum(VoucherStatus)
  status: VoucherStatus;

  @ApiProperty({ description: 'Institution ID where voucher was issued', example: 'inst_001' })
  @IsString()
  institutionId: string;

  @ApiProperty({ description: 'User ID who issued the voucher', example: 'user_001' })
  @IsString()
  issuedByUserId: string;

  @ApiProperty({ description: 'Date when voucher was issued', example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  issuedDate: string;

  @ApiPropertyOptional({ description: 'User ID who redeemed the voucher', example: 'user_002' })
  @IsOptional()
  @IsString()
  redeemedByUserId?: string;

  @ApiPropertyOptional({ description: 'Date when voucher was redeemed', example: '2024-01-20T14:30:00Z' })
  @IsOptional()
  @IsDateString()
  redeemedDate?: string;

  @ApiPropertyOptional({ description: 'Date when voucher access expires (30 days after redemption)', example: '2024-02-19T14:30:00Z' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Optional notes for tracking purposes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Whether the voucher is currently active' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Date when voucher was created', example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  createdAt: string;

  @ApiProperty({ description: 'Date when voucher was last updated', example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  updatedAt: string;

  // Additional fields for frontend compatibility
  @ApiPropertyOptional({ description: 'Name of user who issued the voucher', example: 'Principal Smith' })
  @IsOptional()
  @IsString()
  issuedBy?: string;

  @ApiPropertyOptional({ description: 'Name of user who redeemed the voucher', example: 'Parent Johnson' })
  @IsOptional()
  @IsString()
  redeemedBy?: string;

  @ApiPropertyOptional({ description: 'Institution name', example: 'Sample Primary School' })
  @IsOptional()
  @IsString()
  institutionName?: string;
}

export class UpdateVoucherDto {
  @ApiPropertyOptional({ description: 'Optional notes for tracking purposes', maxLength: 200 })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  notes?: string;

  @ApiPropertyOptional({ description: 'Voucher status', enum: VoucherStatus })
  @IsOptional()
  @IsEnum(VoucherStatus)
  status?: VoucherStatus;
}

export class VoucherFilterDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by voucher status', enum: VoucherStatus })
  @IsOptional()
  @IsEnum(VoucherStatus)
  status?: VoucherStatus;

  @ApiPropertyOptional({ description: 'Search term for voucher code, parent name, or notes' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by date range', enum: ['all', '30days', '90days', 'expiring'] })
  @IsOptional()
  @IsString()
  dateFilter?: string;

  @ApiPropertyOptional({ description: 'Filter by minimum voucher value' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minValue?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum voucher value' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxValue?: number;

  @ApiPropertyOptional({ description: 'Filter by specific learner count' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  learnerCount?: number;

  @ApiPropertyOptional({ description: 'Filter by user who issued the voucher' })
  @IsOptional()
  @IsString()
  issuedByUserId?: string;

  @ApiPropertyOptional({ description: 'Start date for custom date range' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for custom date range' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class VoucherExportDto {
  @ApiPropertyOptional({ description: 'Filter by voucher status', enum: VoucherStatus })
  @IsOptional()
  @IsEnum(VoucherStatus)
  status?: VoucherStatus;

  @ApiPropertyOptional({ description: 'Filter by date range', enum: ['all', '30days', '90days', 'expiring'] })
  @IsOptional()
  @IsString()
  dateFilter?: string;

  @ApiPropertyOptional({ description: 'Search term for voucher code, parent name, or notes' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by minimum voucher value' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minValue?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum voucher value' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxValue?: number;

  @ApiPropertyOptional({ description: 'Filter by specific learner count' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  learnerCount?: number;

  @ApiPropertyOptional({ description: 'Filter by user who issued the voucher' })
  @IsOptional()
  @IsString()
  issuedByUserId?: string;

  @ApiPropertyOptional({ description: 'Start date for custom date range' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for custom date range' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class VoucherStatsResponseDto {
  @ApiProperty({ description: 'Total number of vouchers issued' })
  totalIssued: number;

  @ApiProperty({ description: 'Total number of vouchers redeemed' })
  totalRedeemed: number;

  @ApiProperty({ description: 'Total number of active vouchers' })
  totalActive: number;

  @ApiProperty({ description: 'Total number of expired vouchers' })
  totalExpired: number;

  @ApiProperty({ description: 'Total value of all vouchers in Rand' })
  totalValue: number;

  @ApiProperty({ description: 'Total value of redeemed vouchers in Rand' })
  redeemedValue: number;

  @ApiProperty({ description: 'Total value of active vouchers in Rand' })
  activeValue: number;

  @ApiProperty({ description: 'Total number of learners across all vouchers' })
  totalLearners: number;

  @ApiProperty({ description: 'Total number of learners with active access' })
  activeLearners: number;
}

export class VoucherRedemptionResponseDto {
  @ApiProperty({ description: 'Whether redemption was successful' })
  success: boolean;

  @ApiProperty({ description: 'Voucher code that was redeemed' })
  voucherCode: string;

  @ApiProperty({ description: 'Voucher value in Rand' })
  value: number;

  @ApiProperty({ description: 'Number of learners activated' })
  learnerCount: number;

  @ApiProperty({ description: 'Parent/guardian name' })
  parentName: string;

  @ApiProperty({ description: 'Expiry date for the redeemed voucher' })
  expiryDate: string;

  @ApiProperty({ description: 'Success or error message' })
  message: string;

  @ApiProperty({ description: 'Date when voucher was redeemed' })
  redeemedAt: string;

  @ApiProperty({ description: 'Array of activated learner names' })
  activatedLearners: string[];
}

export class VoucherCodeValidationResponseDto {
  @ApiProperty({ description: 'Whether the voucher code is valid' })
  isValid: boolean;

  @ApiPropertyOptional({ description: 'Error message if validation fails' })
  error?: string;

  @ApiPropertyOptional({ description: 'Voucher details if validation succeeds' })
  voucher?: VoucherResponseDto;
}

export class RecentRedemptionDto {
  @ApiProperty({ description: 'Voucher code' })
  code: string;

  @ApiProperty({ description: 'Voucher value in Rand' })
  value: number;

  @ApiProperty({ description: 'Number of learners activated' })
  learnerCount: number;

  @ApiProperty({ description: 'Parent/guardian name' })
  parentName: string;

  @ApiProperty({ description: 'Date when voucher was redeemed' })
  redeemedAt: string;

  @ApiProperty({ description: 'Whether redemption was successful' })
  success: boolean;
}
