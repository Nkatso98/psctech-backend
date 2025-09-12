import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto, RedeemVoucherDto, UpdateVoucherDto, VoucherResponseDto } from './dto/voucher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { InstitutionGuard } from '../institutions/guards/institution.guard';

@ApiTags('Vouchers')
@Controller('vouchers')
@UseGuards(JwtAuthGuard, InstitutionGuard)
@ApiBearerAuth()
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post()
  @Roles(UserRole.PRINCIPAL, UserRole.ADMIN)
  @ApiOperation({ summary: 'Generate a new voucher' })
  @ApiResponse({ 
    status: 201, 
    description: 'Voucher generated successfully',
    type: VoucherResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid voucher data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async createVoucher(
    @Body() createVoucherDto: CreateVoucherDto,
    @CurrentUser() user: User
  ): Promise<VoucherResponseDto> {
    try {
      const voucher = await this.voucherService.createVoucher(createVoucherDto, user);
      return this.voucherService.mapToResponseDto(voucher);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create voucher',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('redeem')
  @Roles(UserRole.PARENT, UserRole.LEARNER)
  @ApiOperation({ summary: 'Redeem a voucher to activate dashboard access' })
  @ApiResponse({ 
    status: 200, 
    description: 'Voucher redeemed successfully',
    type: VoucherResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid voucher code' })
  @ApiResponse({ status: 404, description: 'Voucher not found or already redeemed' })
  @ApiResponse({ status: 410, description: 'Voucher expired' })
  async redeemVoucher(
    @Body() redeemVoucherDto: RedeemVoucherDto,
    @CurrentUser() user: User
  ): Promise<VoucherResponseDto> {
    try {
      const voucher = await this.voucherService.redeemVoucher(redeemVoucherDto.code, user);
      return this.voucherService.mapToResponseDto(voucher);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to redeem voucher',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  @Roles(UserRole.PRINCIPAL, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all vouchers with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'redeemed', 'expired', 'cancelled'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'dateFilter', required: false, enum: ['30days', '90days', 'expiring'] })
  @ApiResponse({ 
    status: 200, 
    description: 'Vouchers retrieved successfully',
    type: [VoucherResponseDto] 
  })
  async getVouchers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('dateFilter') dateFilter?: string
  ): Promise<{ vouchers: VoucherResponseDto[]; total: number; page: number; totalPages: number }> {
    try {
      const result = await this.voucherService.getVouchers({
        page,
        limit,
        status,
        search,
        dateFilter
      });

      return {
        vouchers: result.vouchers.map(voucher => this.voucherService.mapToResponseDto(voucher)),
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve vouchers',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stats')
  @Roles(UserRole.PRINCIPAL, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get voucher statistics and analytics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistics retrieved successfully' 
  })
  async getVoucherStats() {
    try {
      return await this.voucherService.getVoucherStats();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve voucher statistics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @Roles(UserRole.PRINCIPAL, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific voucher by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Voucher retrieved successfully',
    type: VoucherResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Voucher not found' })
  async getVoucher(@Param('id') id: string): Promise<VoucherResponseDto> {
    try {
      const voucher = await this.voucherService.getVoucherById(id);
      return this.voucherService.mapToResponseDto(voucher);
    } catch (error) {
      throw new HttpException(
        error.message || 'Voucher not found',
        error.status || HttpStatus.NOT_FOUND
      );
    }
  }

  @Put(':id')
  @Roles(UserRole.PRINCIPAL, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a voucher' })
  @ApiResponse({ 
    status: 200, 
    description: 'Voucher updated successfully',
    type: VoucherResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Voucher not found' })
  async updateVoucher(
    @Param('id') id: string,
    @Body() updateVoucherDto: UpdateVoucherDto
  ): Promise<VoucherResponseDto> {
    try {
      const voucher = await this.voucherService.updateVoucher(id, updateVoucherDto);
      return this.voucherService.mapToResponseDto(voucher);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update voucher',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @Roles(UserRole.PRINCIPAL, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel a voucher' })
  @ApiResponse({ 
    status: 200, 
    description: 'Voucher cancelled successfully' 
  })
  @ApiResponse({ status: 404, description: 'Voucher not found' })
  async cancelVoucher(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.voucherService.cancelVoucher(id);
      return { message: 'Voucher cancelled successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to cancel voucher',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('export')
  @Roles(UserRole.PRINCIPAL, UserRole.ADMIN)
  @ApiOperation({ summary: 'Export vouchers to CSV' })
  @ApiResponse({ 
    status: 200, 
    description: 'Vouchers exported successfully' 
  })
  async exportVouchers(
    @Body() exportDto: { status?: string; dateFilter?: string; search?: string }
  ): Promise<{ csvData: string; filename: string }> {
    try {
      return await this.voucherService.exportVouchers(exportDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to export vouchers',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('recent-redemptions')
  @Roles(UserRole.PARENT, UserRole.LEARNER)
  @ApiOperation({ summary: 'Get recent voucher redemptions for current user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Recent redemptions retrieved successfully' 
  })
  async getRecentRedemptions(@CurrentUser() user: User) {
    try {
      return await this.voucherService.getRecentRedemptions(user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve recent redemptions',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('validate-code')
  @ApiOperation({ summary: 'Validate a voucher code format' })
  @ApiResponse({ 
    status: 200, 
    description: 'Voucher code format is valid' 
  })
  @ApiResponse({ status: 400, description: 'Invalid voucher code format' })
  async validateVoucherCode(@Body() { code }: { code: string }): Promise<{ isValid: boolean; message: string }> {
    try {
      const isValid = this.voucherService.validateVoucherCodeFormat(code);
      return {
        isValid,
        message: isValid ? 'Voucher code format is valid' : 'Invalid voucher code format'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to validate voucher code',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}


