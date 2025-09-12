import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Voucher } from '../entities/voucher.entity';
import { VoucherRedemption } from '../entities/voucher-redemption.entity';
import { User } from '../../users/entities/user.entity';
import { Institution } from '../../institutions/entities/institution.entity';
import { VoucherStatus } from '../entities/voucher.entity';
import { UserRole } from '../../users/enums/user-role.enum';

@Injectable()
export class VoucherValidationService {
  private readonly logger = new Logger(VoucherValidationService.name);
  
  // Rate limiting: max attempts per hour per user
  private readonly MAX_REDEEM_ATTEMPTS_PER_HOUR = 5;
  
  // Maximum vouchers per parent per month
  private readonly MAX_VOUCHERS_PER_PARENT_PER_MONTH = 10;

  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(VoucherRedemption)
    private readonly redemptionRepository: Repository<VoucherRedemption>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Institution)
    private readonly institutionRepository: Repository<Institution>,
  ) {}

  /**
   * Validate voucher code format
   */
  validateCodeFormat(code: string): { isValid: boolean; error?: string } {
    try {
      // Remove any whitespace
      const cleanCode = code.trim();

      // Check if code is empty
      if (!cleanCode) {
        return { isValid: false, error: 'Voucher code is required' };
      }

      // Check if code matches XXXX-XXXX-XXXX-XXXX format
      const codeRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
      
      if (!codeRegex.test(cleanCode)) {
        return { 
          isValid: false, 
          error: 'Invalid voucher code format. Expected format: XXXX-XXXX-XXXX-XXXX' 
        };
      }

      // Check if code contains only allowed characters (excluding I, O, 1, 0)
      const allowedChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const cleanCodeChars = cleanCode.replace(/-/g, '');
      
      for (const char of cleanCodeChars) {
        if (!allowedChars.includes(char)) {
          return { 
            isValid: false, 
            error: 'Voucher code contains invalid characters. Only letters (excluding I, O) and numbers (excluding 1, 0) are allowed' 
          };
        }
      }

      return { isValid: true };
    } catch (error) {
      this.logger.error(`Error validating code format: ${error.message}`, error.stack);
      return { isValid: false, error: 'Error validating voucher code format' };
    }
  }

  /**
   * Validate voucher for redemption
   */
  async validateVoucherForRedemption(
    code: string, 
    userId: string, 
    institutionId: string
  ): Promise<{ isValid: boolean; voucher?: Voucher; error?: string }> {
    try {
      // First validate code format
      const formatValidation = this.validateCodeFormat(code);
      if (!formatValidation.isValid) {
        return { isValid: false, error: formatValidation.error };
      }

      // Find voucher by code
      const voucher = await this.voucherRepository.findOne({
        where: { code },
        relations: ['institution', 'issuedBy']
      });

      if (!voucher) {
        return { isValid: false, error: 'Voucher not found' };
      }

      // Check if voucher belongs to the same institution
      if (voucher.institutionId !== institutionId) {
        return { isValid: false, error: 'Voucher does not belong to this institution' };
      }

      // Check voucher status
      if (voucher.status !== VoucherStatus.ACTIVE) {
        let errorMessage = 'Voucher cannot be redeemed';
        
        switch (voucher.status) {
          case VoucherStatus.REDEEMED:
            errorMessage = 'Voucher has already been redeemed';
            break;
          case VoucherStatus.EXPIRED:
            errorMessage = 'Voucher has expired';
            break;
          case VoucherStatus.CANCELLED:
            errorMessage = 'Voucher has been cancelled';
            break;
        }
        
        return { isValid: false, error: errorMessage };
      }

      // Check if voucher is active
      if (!voucher.isActive) {
        return { isValid: false, error: 'Voucher is not active' };
      }

      // Check if voucher has expired
      if (voucher.expiryDate && new Date() > voucher.expiryDate) {
        return { isValid: false, error: 'Voucher has expired' };
      }

      // Check if user has exceeded redemption attempts
      const attemptValidation = await this.validateRedemptionAttempts(userId);
      if (!attemptValidation.isValid) {
        return { isValid: false, error: attemptValidation.error };
      }

      // Check if user can redeem this voucher
      const userValidation = await this.validateUserCanRedeem(userId, voucher);
      if (!userValidation.isValid) {
        return { isValid: false, error: userValidation.error };
      }

      return { isValid: true, voucher };
    } catch (error) {
      this.logger.error(`Error validating voucher for redemption: ${error.message}`, error.stack);
      return { isValid: false, error: 'Error validating voucher' };
    }
  }

  /**
   * Validate redemption attempts (rate limiting)
   */
  async validateRedemptionAttempts(userId: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const recentAttempts = await this.redemptionRepository.count({
        where: {
          userId,
          createdAt: MoreThan(oneHourAgo)
        }
      });

      if (recentAttempts >= this.MAX_REDEEM_ATTEMPTS_PER_HOUR) {
        return { 
          isValid: false, 
          error: `Too many redemption attempts. Please wait before trying again. Maximum ${this.MAX_REDEEM_ATTEMPTS_PER_HOUR} attempts per hour.` 
        };
      }

      return { isValid: true };
    } catch (error) {
      this.logger.error(`Error validating redemption attempts: ${error.message}`, error.stack);
      return { isValid: false, error: 'Error checking redemption attempts' };
    }
  }

  /**
   * Validate if user can redeem voucher
   */
  async validateUserCanRedeem(userId: string, voucher: Voucher): Promise<{ isValid: boolean; error?: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['institution']
      });

      if (!user) {
        return { isValid: false, error: 'User not found' };
      }

      // Check if user belongs to the same institution
      if (user.institutionId !== voucher.institutionId) {
        return { isValid: false, error: 'User does not belong to this institution' };
      }

      // Check user role - only parents and learners can redeem vouchers
      if (![UserRole.PARENT, UserRole.LEARNER].includes(user.role)) {
        return { isValid: false, error: 'Only parents and learners can redeem vouchers' };
      }

      // Check if user has exceeded monthly voucher limit
      const monthlyLimitValidation = await this.validateMonthlyVoucherLimit(userId, voucher.institutionId);
      if (!monthlyLimitValidation.isValid) {
        return { isValid: false, error: monthlyLimitValidation.error };
      }

      return { isValid: true };
    } catch (error) {
      this.logger.error(`Error validating user can redeem: ${error.message}`, error.stack);
      return { isValid: false, error: 'Error validating user permissions' };
    }
  }

  /**
   * Validate monthly voucher limit per parent
   */
  async validateMonthlyVoucherLimit(userId: string, institutionId: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user || user.role !== UserRole.PARENT) {
        return { isValid: true }; // Only parents have monthly limits
      }

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const monthlyVouchers = await this.redemptionRepository.count({
        where: {
          userId,
          createdAt: MoreThan(oneMonthAgo)
        }
      });

      if (monthlyVouchers >= this.MAX_VOUCHERS_PER_PARENT_PER_MONTH) {
        return { 
          isValid: false, 
          error: `Monthly voucher limit exceeded. Maximum ${this.MAX_VOUCHERS_PER_PARENT_PER_MONTH} vouchers per month.` 
        };
      }

      return { isValid: true };
    } catch (error) {
      this.logger.error(`Error validating monthly voucher limit: ${error.message}`, error.stack);
      return { isValid: false, error: 'Error checking monthly voucher limit' };
    }
  }

  /**
   * Validate voucher creation data
   */
  validateVoucherCreation(data: {
    value: number;
    learnerCount: number;
    parentName: string;
    notes?: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Validate value (must be one of the allowed denominations)
      const allowedValues = [5, 10, 15, 20, 25, 30, 35, 40, 45];
      if (!allowedValues.includes(data.value)) {
        errors.push(`Invalid voucher value. Allowed values: ${allowedValues.join(', ')}`);
      }

      // Validate learner count (1-10)
      if (data.learnerCount < 1 || data.learnerCount > 10) {
        errors.push('Learner count must be between 1 and 10');
      }

      // Validate parent name
      if (!data.parentName || data.parentName.trim().length < 2) {
        errors.push('Parent/guardian name must be at least 2 characters long');
      }

      if (data.parentName && data.parentName.trim().length > 100) {
        errors.push('Parent/guardian name cannot exceed 100 characters');
      }

      // Validate notes (optional)
      if (data.notes && data.notes.length > 200) {
        errors.push('Notes cannot exceed 200 characters');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      this.logger.error(`Error validating voucher creation: ${error.message}`, error.stack);
      errors.push('Error validating voucher data');
      return { isValid: false, errors };
    }
  }

  /**
   * Validate voucher update data
   */
  validateVoucherUpdate(
    voucher: Voucher,
    updateData: {
      notes?: string;
      status?: VoucherStatus;
    }
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Check if voucher can be updated
      if (!voucher.canBeUpdated()) {
        errors.push('Voucher cannot be updated in its current state');
      }

      // Validate notes
      if (updateData.notes !== undefined) {
        if (updateData.notes && updateData.notes.length > 200) {
          errors.push('Notes cannot exceed 200 characters');
        }
      }

      // Validate status change
      if (updateData.status !== undefined) {
        const statusValidation = this.validateStatusChange(voucher.status, updateData.status);
        if (!statusValidation.isValid) {
          errors.push(statusValidation.error!);
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      this.logger.error(`Error validating voucher update: ${error.message}`, error.stack);
      errors.push('Error validating update data');
      return { isValid: false, errors };
    }
  }

  /**
   * Validate status change
   */
  private validateStatusChange(
    currentStatus: VoucherStatus,
    newStatus: VoucherStatus
  ): { isValid: boolean; error?: string } {
    try {
      // Define allowed status transitions
      const allowedTransitions: Record<VoucherStatus, VoucherStatus[]> = {
        [VoucherStatus.ACTIVE]: [VoucherStatus.REDEEMED, VoucherStatus.CANCELLED],
        [VoucherStatus.REDEEMED]: [VoucherStatus.EXPIRED, VoucherStatus.CANCELLED],
        [VoucherStatus.EXPIRED]: [VoucherStatus.CANCELLED],
        [VoucherStatus.CANCELLED]: [] // No transitions allowed from cancelled
      };

      const allowed = allowedTransitions[currentStatus] || [];
      
      if (!allowed.includes(newStatus)) {
        return { 
          isValid: false, 
          error: `Cannot change voucher status from ${currentStatus} to ${newStatus}` 
        };
      }

      return { isValid: true };
    } catch (error) {
      this.logger.error(`Error validating status change: ${error.message}`, error.stack);
      return { isValid: false, error: 'Error validating status change' };
    }
  }

  /**
   * Validate voucher cancellation
   */
  async validateVoucherCancellation(voucherId: string, userId: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      const voucher = await this.voucherRepository.findOne({
        where: { id: voucherId },
        relations: ['issuedBy']
      });

      if (!voucher) {
        return { isValid: false, error: 'Voucher not found' };
      }

      // Check if voucher can be cancelled
      if (!voucher.canBeCancelled()) {
        return { isValid: false, error: 'Voucher cannot be cancelled in its current state' };
      }

      // Check if user has permission to cancel
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        return { isValid: false, error: 'User not found' };
      }

      // Only the issuer or admin can cancel vouchers
      if (voucher.issuedByUserId !== userId && user.role !== UserRole.ADMIN) {
        return { isValid: false, error: 'Only the voucher issuer or admin can cancel vouchers' };
      }

      return { isValid: true };
    } catch (error) {
      this.logger.error(`Error validating voucher cancellation: ${error.message}`, error.stack);
      return { isValid: false, error: 'Error validating cancellation' };
    }
  }

  /**
   * Validate voucher export filters
   */
  validateExportFilters(filters: {
    status?: string;
    dateFilter?: string;
    search?: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Validate status filter
      if (filters.status) {
        const validStatuses = Object.values(VoucherStatus);
        if (!validStatuses.includes(filters.status as VoucherStatus)) {
          errors.push(`Invalid status filter. Valid values: ${validStatuses.join(', ')}`);
        }
      }

      // Validate date filter
      if (filters.dateFilter) {
        const validDateFilters = ['today', 'this_week', 'this_month', 'last_month', 'custom'];
        if (!validDateFilters.includes(filters.dateFilter)) {
          errors.push(`Invalid date filter. Valid values: ${validDateFilters.join(', ')}`);
        }
      }

      // Validate search filter
      if (filters.search && filters.search.length > 100) {
        errors.push('Search term cannot exceed 100 characters');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      this.logger.error(`Error validating export filters: ${error.message}`, error.stack);
      errors.push('Error validating export filters');
      return { isValid: false, errors };
    }
  }

  /**
   * Get validation summary for a voucher
   */
  async getVoucherValidationSummary(voucherId: string): Promise<{
    isValid: boolean;
    issues: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    try {
      const voucher = await this.voucherRepository.findOne({
        where: { id: voucherId },
        relations: ['institution', 'issuedBy', 'redeemedBy']
      });

      if (!voucher) {
        return {
          isValid: false,
          issues: ['Voucher not found'],
          warnings: [],
          recommendations: []
        };
      }

      const issues: string[] = [];
      const warnings: string[] = [];
      const recommendations: string[] = [];

      // Check for critical issues
      if (voucher.status === VoucherStatus.EXPIRED && voucher.isActive) {
        issues.push('Voucher is marked as expired but still active');
      }

      if (voucher.status === VoucherStatus.CANCELLED && voucher.isActive) {
        issues.push('Voucher is marked as cancelled but still active');
      }

      // Check for warnings
      if (voucher.expiryDate) {
        const daysUntilExpiry = Math.ceil((voucher.expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        
        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          warnings.push(`Voucher expires in ${daysUntilExpiry} days`);
        }
        
        if (daysUntilExpiry < 0) {
          issues.push('Voucher has expired but status not updated');
        }
      }

      // Check for recommendations
      if (voucher.status === VoucherStatus.ACTIVE && voucher.issuedDate) {
        const daysSinceIssued = Math.ceil((new Date().getTime() - voucher.issuedDate.getTime()) / (1000 * 3600 * 24));
        
        if (daysSinceIssued > 90) {
          recommendations.push('Consider cancelling old unused vouchers');
        }
      }

      if (voucher.learnerCount > 5) {
        recommendations.push('High learner count voucher - ensure proper tracking');
      }

      return {
        isValid: issues.length === 0,
        issues,
        warnings,
        recommendations
      };
    } catch (error) {
      this.logger.error(`Error getting validation summary: ${error.message}`, error.stack);
      return {
        isValid: false,
        issues: ['Error generating validation summary'],
        warnings: [],
        recommendations: []
      };
    }
  }
}


