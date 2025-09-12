import { Injectable, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Voucher } from './entities/voucher.entity';
import { CreateVoucherDto, RedeemVoucherDto, UpdateVoucherDto, VoucherResponseDto } from './dto/voucher.dto';
import { User } from '../users/entities/user.entity';
import { Institution } from '../institutions/entities/institution.entity';
import { VoucherRedemption } from './entities/voucher-redemption.entity';
import { VoucherAudit } from './entities/voucher-audit.entity';
import { VoucherCodeGenerator } from './utils/voucher-code-generator';
import { VoucherExpiryService } from './utils/voucher-expiry.service';
import { VoucherValidationService } from './utils/voucher-validation.service';
import { VoucherExportService } from './utils/voucher-export.service';
import { VoucherNotificationService } from './utils/voucher-notification.service';

@Injectable()
export class VoucherService {
  private readonly logger = new Logger(VoucherService.name);

  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(VoucherRedemption)
    private readonly redemptionRepository: Repository<VoucherRedemption>,
    @InjectRepository(VoucherAudit)
    private readonly auditRepository: Repository<VoucherAudit>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Institution)
    private readonly institutionRepository: Repository<Institution>,
    private readonly codeGenerator: VoucherCodeGenerator,
    private readonly expiryService: VoucherExpiryService,
    private readonly validationService: VoucherValidationService,
    private readonly exportService: VoucherExportService,
    private readonly notificationService: VoucherNotificationService,
  ) {}

  /**
   * Create a new voucher
   */
  async createVoucher(createVoucherDto: CreateVoucherDto, user: User): Promise<Voucher> {
    try {
      // Validate voucher data
      await this.validationService.validateCreateVoucher(createVoucherDto);

      // Generate unique voucher code
      const voucherCode = await this.codeGenerator.generateUniqueCode();

      // Create voucher entity
      const voucher = this.voucherRepository.create({
        code: voucherCode,
        codeHash: await this.codeGenerator.hashCode(voucherCode),
        codeSalt: await this.codeGenerator.generateSalt(),
        valueCents: createVoucherDto.value * 100, // Convert to cents
        learnerCount: createVoucherDto.learnerCount,
        parentName: createVoucherDto.parentName,
        notes: createVoucherDto.notes,
        status: 'active',
        institutionId: user.institutionId,
        issuedByUserId: user.id,
        issuedDate: new Date(),
        expiryDate: null, // Will be set when redeemed
        isActive: true,
        metadata: {
          denomination: createVoucherDto.value,
          parentInfo: createVoucherDto.parentName,
          learnerCount: createVoucherDto.learnerCount,
          notes: createVoucherDto.notes
        }
      });

      // Save voucher
      const savedVoucher = await this.voucherRepository.save(voucher);

      // Create audit log
      await this.createAuditLog(savedVoucher, 'created', user.id, 'Voucher created');

      // Send notification to principal
      await this.notificationService.notifyVoucherCreated(savedVoucher, user);

      this.logger.log(`Voucher created: ${savedVoucher.id} by user: ${user.id}`);

      return savedVoucher;
    } catch (error) {
      this.logger.error(`Failed to create voucher: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Failed to create voucher',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Redeem a voucher
   */
  async redeemVoucher(voucherCode: string, user: User): Promise<Voucher> {
    try {
      // Validate voucher code format
      if (!this.validationService.validateVoucherCodeFormat(voucherCode)) {
        throw new HttpException('Invalid voucher code format', HttpStatus.BAD_REQUEST);
      }

      // Find voucher by code hash
      const voucher = await this.findVoucherByCode(voucherCode);
      if (!voucher) {
        throw new HttpException('Voucher not found', HttpStatus.NOT_FOUND);
      }

      // Validate voucher status
      if (voucher.status !== 'active') {
        throw new HttpException(
          `Voucher is ${voucher.status} and cannot be redeemed`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Check if voucher is expired
      if (voucher.expiryDate && new Date() > voucher.expiryDate) {
        voucher.status = 'expired';
        await this.voucherRepository.save(voucher);
        throw new HttpException('Voucher has expired', HttpStatus.GONE);
      }

      // Check if user has already redeemed this voucher
      const existingRedemption = await this.redemptionRepository.findOne({
        where: { voucherId: voucher.id, redeemedByUserId: user.id }
      });

      if (existingRedemption) {
        throw new HttpException('Voucher has already been redeemed by this user', HttpStatus.BAD_REQUEST);
      }

      // Calculate expiry date (30 days from redemption)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      // Update voucher status
      voucher.status = 'redeemed';
      voucher.expiryDate = expiryDate;
      voucher.redeemedByUserId = user.id;
      voucher.redeemedDate = new Date();
      voucher.isActive = true;

      // Save updated voucher
      const updatedVoucher = await this.voucherRepository.save(voucher);

      // Create redemption record
      await this.createRedemptionRecord(updatedVoucher, user);

      // Create audit log
      await this.createAuditLog(updatedVoucher, 'redeemed', user.id, 'Voucher redeemed');

      // Activate dashboard access for learners
      await this.activateLearnerAccess(updatedVoucher, user);

      // Send notification
      await this.notificationService.notifyVoucherRedeemed(updatedVoucher, user);

      this.logger.log(`Voucher redeemed: ${updatedVoucher.id} by user: ${user.id}`);

      return updatedVoucher;
    } catch (error) {
      this.logger.error(`Failed to redeem voucher: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get vouchers with filtering and pagination
   */
  async getVouchers(filters: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
    dateFilter?: string;
  }): Promise<{ vouchers: Voucher[]; total: number; page: number; totalPages: number }> {
    try {
      const queryBuilder = this.voucherRepository.createQueryBuilder('voucher')
        .leftJoinAndSelect('voucher.issuedBy', 'issuedBy')
        .leftJoinAndSelect('voucher.redeemedBy', 'redeemedBy')
        .orderBy('voucher.issuedDate', 'DESC');

      // Apply filters
      this.applyVoucherFilters(queryBuilder, filters);

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      const page = Math.max(1, filters.page);
      const limit = Math.min(100, Math.max(1, filters.limit));
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);

      // Get vouchers
      const vouchers = await queryBuilder.getMany();

      return {
        vouchers,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      this.logger.error(`Failed to get vouchers: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to retrieve vouchers',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get voucher statistics
   */
  async getVoucherStats(): Promise<any> {
    try {
      const stats = await this.voucherRepository
        .createQueryBuilder('voucher')
        .select([
          'COUNT(*) as totalIssued',
          'SUM(CASE WHEN voucher.status = "redeemed" THEN 1 ELSE 0 END) as totalRedeemed',
          'SUM(CASE WHEN voucher.status = "active" THEN 1 ELSE 0 END) as totalActive',
          'SUM(CASE WHEN voucher.status = "expired" THEN 1 ELSE 0 END) as totalExpired',
          'SUM(voucher.valueCents) / 100 as totalValue',
          'SUM(CASE WHEN voucher.status = "redeemed" THEN voucher.valueCents ELSE 0 END) / 100 as redeemedValue',
          'SUM(CASE WHEN voucher.status = "active" THEN voucher.valueCents ELSE 0 END) / 100 as activeValue',
          'SUM(voucher.learnerCount) as totalLearners',
          'SUM(CASE WHEN voucher.status = "active" THEN voucher.learnerCount ELSE 0 END) as activeLearners'
        ])
        .getRawOne();

      return {
        ...stats,
        totalIssued: parseInt(stats.totalIssued) || 0,
        totalRedeemed: parseInt(stats.totalRedeemed) || 0,
        totalActive: parseInt(stats.totalActive) || 0,
        totalExpired: parseInt(stats.totalExpired) || 0,
        totalValue: parseFloat(stats.totalValue) || 0,
        redeemedValue: parseFloat(stats.redeemedValue) || 0,
        activeValue: parseFloat(stats.activeValue) || 0,
        totalLearners: parseInt(stats.totalLearners) || 0,
        activeLearners: parseInt(stats.activeLearners) || 0
      };
    } catch (error) {
      this.logger.error(`Failed to get voucher stats: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to retrieve voucher statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get voucher by ID
   */
  async getVoucherById(id: string): Promise<Voucher> {
    try {
      const voucher = await this.voucherRepository.findOne({
        where: { id },
        relations: ['issuedBy', 'redeemedBy']
      });

      if (!voucher) {
        throw new HttpException('Voucher not found', HttpStatus.NOT_FOUND);
      }

      return voucher;
    } catch (error) {
      this.logger.error(`Failed to get voucher by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update voucher
   */
  async updateVoucher(id: string, updateVoucherDto: UpdateVoucherDto): Promise<Voucher> {
    try {
      const voucher = await this.getVoucherById(id);

      // Update allowed fields
      if (updateVoucherDto.notes !== undefined) {
        voucher.notes = updateVoucherDto.notes;
      }

      if (updateVoucherDto.status !== undefined) {
        voucher.status = updateVoucherDto.status;
      }

      voucher.updatedAt = new Date();

      const updatedVoucher = await this.voucherRepository.save(voucher);

      // Create audit log
      await this.createAuditLog(updatedVoucher, 'updated', null, 'Voucher updated');

      return updatedVoucher;
    } catch (error) {
      this.logger.error(`Failed to update voucher: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Cancel voucher
   */
  async cancelVoucher(id: string): Promise<void> {
    try {
      const voucher = await this.getVoucherById(id);

      if (voucher.status === 'redeemed') {
        throw new HttpException('Cannot cancel a redeemed voucher', HttpStatus.BAD_REQUEST);
      }

      voucher.status = 'cancelled';
      voucher.isActive = false;
      voucher.updatedAt = new Date();

      await this.voucherRepository.save(voucher);

      // Create audit log
      await this.createAuditLog(voucher, 'cancelled', null, 'Voucher cancelled');

      this.logger.log(`Voucher cancelled: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to cancel voucher: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Export vouchers to CSV
   */
  async exportVouchers(filters: { status?: string; dateFilter?: string; search?: string }): Promise<{ csvData: string; filename: string }> {
    try {
      const queryBuilder = this.voucherRepository.createQueryBuilder('voucher')
        .leftJoinAndSelect('voucher.issuedBy', 'issuedBy')
        .leftJoinAndSelect('voucher.redeemedBy', 'redeemedBy')
        .orderBy('voucher.issuedDate', 'DESC');

      // Apply filters
      this.applyVoucherFilters(queryBuilder, filters);

      const vouchers = await queryBuilder.getMany();

      const csvData = await this.exportService.exportToCSV(vouchers);
      const filename = `vouchers_${new Date().toISOString().split('T')[0]}.csv`;

      return { csvData, filename };
    } catch (error) {
      this.logger.error(`Failed to export vouchers: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to export vouchers',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get recent redemptions for user
   */
  async getRecentRedemptions(userId: string): Promise<any[]> {
    try {
      const redemptions = await this.redemptionRepository.find({
        where: { redeemedByUserId: userId },
        relations: ['voucher'],
        order: { redeemedAt: 'DESC' },
        take: 10
      });

      return redemptions.map(redemption => ({
        id: redemption.id,
        voucherCode: redemption.voucher.code,
        value: redemption.voucher.valueCents / 100,
        learnerCount: redemption.voucher.learnerCount,
        redeemedAt: redemption.redeemedAt,
        expiryDate: redemption.voucher.expiryDate
      }));
    } catch (error) {
      this.logger.error(`Failed to get recent redemptions: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to retrieve recent redemptions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Validate voucher code format
   */
  validateVoucherCodeFormat(code: string): boolean {
    return this.validationService.validateVoucherCodeFormat(code);
  }

  /**
   * Map voucher entity to response DTO
   */
  mapToResponseDto(voucher: Voucher): VoucherResponseDto {
    return {
      id: voucher.id,
      code: voucher.code,
      value: voucher.valueCents / 100,
      learnerCount: voucher.learnerCount,
      parentName: voucher.parentName,
      status: voucher.status,
      issuedBy: voucher.issuedBy?.fullName || 'Unknown',
      issuedDate: voucher.issuedDate,
      redeemedBy: voucher.redeemedBy?.fullName,
      redeemedDate: voucher.redeemedDate,
      expiryDate: voucher.expiryDate,
      notes: voucher.notes,
      isActive: voucher.isActive,
      createdAt: voucher.createdAt,
      updatedAt: voucher.updatedAt
    };
  }

  /**
   * Find voucher by code
   */
  private async findVoucherByCode(code: string): Promise<Voucher | null> {
    try {
      const codeHash = await this.codeGenerator.hashCode(code);
      
      return await this.voucherRepository.findOne({
        where: { codeHash },
        relations: ['issuedBy', 'redeemedBy']
      });
    } catch (error) {
      this.logger.error(`Failed to find voucher by code: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Apply filters to query builder
   */
  private applyVoucherFilters(queryBuilder: SelectQueryBuilder<Voucher>, filters: any): void {
    if (filters.status && filters.status !== 'all') {
      queryBuilder.andWhere('voucher.status = :status', { status: filters.status });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(voucher.code LIKE :search OR voucher.parentName LIKE :search OR voucher.notes LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.dateFilter) {
      const now = new Date();
      
      switch (filters.dateFilter) {
        case '30days':
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          queryBuilder.andWhere('voucher.issuedDate >= :date', { date: thirtyDaysAgo });
          break;
        case '90days':
          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          queryBuilder.andWhere('voucher.issuedDate >= :date', { date: ninetyDaysAgo });
          break;
        case 'expiring':
          const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          queryBuilder.andWhere('voucher.status = :status', { status: 'redeemed' });
          queryBuilder.andWhere('voucher.expiryDate <= :date', { date: thirtyDaysFromNow });
          break;
      }
    }
  }

  /**
   * Create redemption record
   */
  private async createRedemptionRecord(voucher: Voucher, user: User): Promise<void> {
    const redemption = this.redemptionRepository.create({
      voucherId: voucher.id,
      redeemedByUserId: user.id,
      redeemedAt: new Date(),
      learnerCount: voucher.learnerCount,
      expiryDate: voucher.expiryDate
    });

    await this.redemptionRepository.save(redemption);
  }

  /**
   * Create audit log
   */
  private async createAuditLog(voucher: Voucher, action: string, userId: string | null, description: string): Promise<void> {
    const audit = this.auditRepository.create({
      voucherId: voucher.id,
      action,
      userId,
      description,
      timestamp: new Date(),
      metadata: {
        voucherCode: voucher.code,
        voucherValue: voucher.valueCents / 100,
        voucherStatus: voucher.status
      }
    });

    await this.auditRepository.save(audit);
  }

  /**
   * Activate learner access
   */
  private async activateLearnerAccess(voucher: Voucher, user: User): Promise<void> {
    // This would integrate with your user management system
    // to activate dashboard access for the specified number of learners
    try {
      // Example implementation - replace with your actual user activation logic
      this.logger.log(`Activating dashboard access for ${voucher.learnerCount} learners via voucher ${voucher.id}`);
      
      // You would typically:
      // 1. Create or update learner user accounts
      // 2. Set appropriate permissions and roles
      // 3. Link learners to the parent user
      // 4. Set access expiry dates
      
    } catch (error) {
      this.logger.error(`Failed to activate learner access: ${error.message}`, error.stack);
      // Don't throw error here as voucher redemption should still succeed
    }
  }
}


