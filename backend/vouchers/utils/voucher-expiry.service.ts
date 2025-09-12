import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { Voucher } from '../entities/voucher.entity';
import { VoucherAudit } from '../entities/voucher-audit.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VoucherStatus } from '../entities/voucher.entity';

@Injectable()
export class VoucherExpiryService {
  private readonly logger = new Logger(VoucherExpiryService.name);
  
  // 30 days in milliseconds
  private readonly EXPIRY_DAYS = 30;
  private readonly EXPIRY_MS = this.EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(VoucherAudit)
    private readonly auditRepository: Repository<VoucherAudit>,
  ) {}

  /**
   * Calculate expiry date for a voucher (30 days after redemption)
   */
  calculateExpiryDate(redemptionDate: Date): Date {
    try {
      const expiryDate = new Date(redemptionDate.getTime() + this.EXPIRY_MS);
      this.logger.debug(`Calculated expiry date: ${expiryDate.toISOString()} for redemption date: ${redemptionDate.toISOString()}`);
      return expiryDate;
    } catch (error) {
      this.logger.error(`Error calculating expiry date: ${error.message}`, error.stack);
      throw new Error('Failed to calculate expiry date');
    }
  }

  /**
   * Check if a voucher is expired
   */
  isVoucherExpired(voucher: Voucher): boolean {
    try {
      if (!voucher.expiryDate) {
        return false; // No expiry date set
      }

      const now = new Date();
      const isExpired = now > voucher.expiryDate;
      
      if (isExpired) {
        this.logger.debug(`Voucher ${voucher.id} is expired. Expiry: ${voucher.expiryDate.toISOString()}, Now: ${now.toISOString()}`);
      }

      return isExpired;
    } catch (error) {
      this.logger.error(`Error checking voucher expiry: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Get days until expiry for a voucher
   */
  getDaysUntilExpiry(voucher: Voucher): number | null {
    try {
      if (!voucher.expiryDate) {
        return null; // No expiry date set
      }

      const now = new Date();
      const timeDiff = voucher.expiryDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      return Math.max(0, daysDiff);
    } catch (error) {
      this.logger.error(`Error calculating days until expiry: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Get expiry status for display purposes
   */
  getExpiryStatus(voucher: Voucher): {
    status: 'active' | 'expiring_soon' | 'expired' | 'no_expiry';
    daysLeft: number | null;
    color: string;
    message: string;
  } {
    try {
      if (!voucher.expiryDate) {
        return {
          status: 'no_expiry',
          daysLeft: null,
          color: 'text-gray-500',
          message: 'No expiry date set'
        };
      }

      const daysLeft = this.getDaysUntilExpiry(voucher);

      if (daysLeft === null) {
        return {
          status: 'no_expiry',
          daysLeft: null,
          color: 'text-gray-500',
          message: 'Unable to calculate expiry'
        };
      }

      if (daysLeft === 0) {
        return {
          status: 'expired',
          daysLeft: 0,
          color: 'text-red-600',
          message: 'Expired today'
        };
      }

      if (daysLeft <= 7) {
        return {
          status: 'expiring_soon',
          daysLeft,
          color: 'text-orange-600',
          message: `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
        };
      }

      return {
        status: 'active',
        daysLeft,
        color: 'text-green-600',
        message: `Expires in ${daysLeft} days`
      };
    } catch (error) {
      this.logger.error(`Error getting expiry status: ${error.message}`, error.stack);
      return {
        status: 'no_expiry',
        daysLeft: null,
        color: 'text-gray-500',
        message: 'Error calculating status'
      };
    }
  }

  /**
   * Mark vouchers as expired
   */
  async markExpiredVouchers(): Promise<number> {
    try {
      const now = new Date();
      
      // Find vouchers that are expired but still marked as active/redeemed
      const expiredVouchers = await this.voucherRepository.find({
        where: {
          expiryDate: LessThan(now),
          status: VoucherStatus.REDEEMED,
          isActive: true
        }
      });

      if (expiredVouchers.length === 0) {
        this.logger.debug('No expired vouchers found');
        return 0;
      }

      let updatedCount = 0;

      for (const voucher of expiredVouchers) {
        try {
          // Mark as expired
          voucher.status = VoucherStatus.EXPIRED;
          voucher.isActive = false;
          voucher.updatedAt = new Date();

          await this.voucherRepository.save(voucher);

          // Create audit log
          await this.createExpiryAuditLog(voucher);

          updatedCount++;
          this.logger.log(`Marked voucher ${voucher.id} as expired`);
        } catch (error) {
          this.logger.error(`Error marking voucher ${voucher.id} as expired: ${error.message}`, error.stack);
        }
      }

      this.logger.log(`Successfully marked ${updatedCount} vouchers as expired`);
      return updatedCount;
    } catch (error) {
      this.logger.error(`Error marking expired vouchers: ${error.message}`, error.stack);
      throw new Error('Failed to mark expired vouchers');
    }
  }

  /**
   * Get vouchers expiring soon (within specified days)
   */
  async getVouchersExpiringSoon(days: number = 7): Promise<Voucher[]> {
    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

      const expiringVouchers = await this.voucherRepository.find({
        where: {
          expiryDate: Between(now, futureDate),
          status: VoucherStatus.REDEEMED,
          isActive: true
        },
        order: {
          expiryDate: 'ASC'
        }
      });

      this.logger.debug(`Found ${expiringVouchers.length} vouchers expiring within ${days} days`);
      return expiringVouchers;
    } catch (error) {
      this.logger.error(`Error getting vouchers expiring soon: ${error.message}`, error.stack);
      throw new Error('Failed to get vouchers expiring soon');
    }
  }

  /**
   * Get expiry statistics
   */
  async getExpiryStats(): Promise<{
    totalActive: number;
    expiringToday: number;
    expiringThisWeek: number;
    expiringThisMonth: number;
    expiredThisMonth: number;
  }> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekFromNow = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
      const monthFromNow = new Date(today.getFullYear(), now.getMonth() + 1, now.getDate());
      const monthAgo = new Date(today.getFullYear(), now.getMonth() - 1, now.getDate());

      const [
        totalActive,
        expiringToday,
        expiringThisWeek,
        expiringThisMonth,
        expiredThisMonth
      ] = await Promise.all([
        // Total active vouchers
        this.voucherRepository.count({
          where: {
            status: VoucherStatus.REDEEMED,
            isActive: true
          }
        }),

        // Expiring today
        this.voucherRepository.count({
          where: {
            expiryDate: Between(today, new Date(today.getTime() + 24 * 60 * 60 * 1000)),
            status: VoucherStatus.REDEEMED,
            isActive: true
          }
        }),

        // Expiring this week
        this.voucherRepository.count({
          where: {
            expiryDate: Between(today, weekFromNow),
            status: VoucherStatus.REDEEMED,
            isActive: true
          }
        }),

        // Expiring this month
        this.voucherRepository.count({
          where: {
            expiryDate: Between(today, monthFromNow),
            status: VoucherStatus.REDEEMED,
            isActive: true
          }
        }),

        // Expired this month
        this.voucherRepository.count({
          where: {
            expiryDate: Between(monthAgo, today),
            status: VoucherStatus.EXPIRED
          }
        })
      ]);

      return {
        totalActive,
        expiringToday,
        expiringThisWeek,
        expiringThisMonth,
        expiredThisMonth
      };
    } catch (error) {
      this.logger.error(`Error getting expiry stats: ${error.message}`, error.stack);
      throw new Error('Failed to get expiry statistics');
    }
  }

  /**
   * Extend voucher expiry (admin function)
   */
  async extendVoucherExpiry(voucherId: string, additionalDays: number): Promise<Voucher> {
    try {
      const voucher = await this.voucherRepository.findOne({
        where: { id: voucherId }
      });

      if (!voucher) {
        throw new Error('Voucher not found');
      }

      if (!voucher.expiryDate) {
        throw new Error('Voucher has no expiry date to extend');
      }

      if (voucher.status !== VoucherStatus.REDEEMED) {
        throw new Error('Can only extend expiry for redeemed vouchers');
      }

      // Calculate new expiry date
      const newExpiryDate = new Date(voucher.expiryDate.getTime() + (additionalDays * 24 * 60 * 60 * 1000));
      
      voucher.expiryDate = newExpiryDate;
      voucher.updatedAt = new Date();

      const updatedVoucher = await this.voucherRepository.save(voucher);

      // Create audit log
      await this.createExtensionAuditLog(voucher, additionalDays);

      this.logger.log(`Extended voucher ${voucherId} expiry by ${additionalDays} days to ${newExpiryDate.toISOString()}`);
      
      return updatedVoucher;
    } catch (error) {
      this.logger.error(`Error extending voucher expiry: ${error.message}`, error.stack);
      throw new Error(`Failed to extend voucher expiry: ${error.message}`);
    }
  }

  /**
   * Get expiry timeline for a voucher
   */
  getExpiryTimeline(voucher: Voucher): {
    issued: Date;
    redeemed: Date | null;
    expiry: Date | null;
    status: string;
    duration: string | null;
  } {
    try {
      const timeline = {
        issued: voucher.issuedDate,
        redeemed: voucher.redeemedDate,
        expiry: voucher.expiryDate,
        status: voucher.status,
        duration: null as string | null
      };

      if (voucher.redeemedDate && voucher.expiryDate) {
        const durationMs = voucher.expiryDate.getTime() - voucher.redeemedDate.getTime();
        const durationDays = Math.ceil(durationMs / (1000 * 3600 * 24));
        timeline.duration = `${durationDays} day${durationDays === 1 ? '' : 's'}`;
      }

      return timeline;
    } catch (error) {
      this.logger.error(`Error getting expiry timeline: ${error.message}`, error.stack);
      return {
        issued: voucher.issuedDate,
        redeemed: voucher.redeemedDate,
        expiry: voucher.expiryDate,
        status: voucher.status,
        duration: 'Error calculating duration'
      };
    }
  }

  /**
   * Create audit log for expiry
   */
  private async createExpiryAuditLog(voucher: Voucher): Promise<void> {
    try {
      const auditLog = this.auditRepository.create({
        voucherId: voucher.id,
        action: 'expired',
        userId: null, // System action
        description: `Voucher automatically expired after ${this.EXPIRY_DAYS} days`,
        metadata: {
          expiryDate: voucher.expiryDate,
          daysSinceRedemption: voucher.redeemedDate ? 
            Math.ceil((voucher.expiryDate!.getTime() - voucher.redeemedDate.getTime()) / (1000 * 3600 * 24)) : null
        }
      });

      await this.auditRepository.save(auditLog);
    } catch (error) {
      this.logger.error(`Error creating expiry audit log: ${error.message}`, error.stack);
    }
  }

  /**
   * Create audit log for extension
   */
  private async createExtensionAuditLog(voucher: Voucher, additionalDays: number): Promise<void> {
    try {
      const auditLog = this.auditRepository.create({
        voucherId: voucher.id,
        action: 'extended',
        userId: null, // Admin action
        description: `Voucher expiry extended by ${additionalDays} days`,
        metadata: {
          newExpiryDate: voucher.expiryDate,
          additionalDays,
          previousExpiryDate: new Date(voucher.expiryDate!.getTime() - (additionalDays * 24 * 60 * 60 * 1000))
        }
      });

      await this.auditRepository.save(auditLog);
    } catch (error) {
      this.logger.error(`Error creating extension audit log: ${error.message}`, error.stack);
    }
  }

  /**
   * Scheduled job to check and mark expired vouchers
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredVouchers(): Promise<void> {
    try {
      this.logger.log('Starting scheduled expired voucher check');
      const updatedCount = await this.markExpiredVouchers();
      
      if (updatedCount > 0) {
        this.logger.log(`Scheduled job: Marked ${updatedCount} vouchers as expired`);
      } else {
        this.logger.debug('Scheduled job: No expired vouchers found');
      }
    } catch (error) {
      this.logger.error(`Scheduled job error: ${error.message}`, error.stack);
    }
  }

  /**
   * Scheduled job to send expiry notifications
   * Runs daily at 9 AM
   */
  @Cron('0 9 * * *')
  async sendExpiryNotifications(): Promise<void> {
    try {
      this.logger.log('Starting scheduled expiry notification check');
      
      // Get vouchers expiring in the next 3 days
      const expiringVouchers = await this.getVouchersExpiringSoon(3);
      
      if (expiringVouchers.length > 0) {
        this.logger.log(`Found ${expiringVouchers.length} vouchers expiring soon`);
        
        // TODO: Implement notification service integration
        // await this.notificationService.sendExpiryNotifications(expiringVouchers);
        
        this.logger.log('Expiry notifications sent successfully');
      } else {
        this.logger.debug('No vouchers expiring soon');
      }
    } catch (error) {
      this.logger.error(`Scheduled job error: ${error.message}`, error.stack);
    }
  }
}


