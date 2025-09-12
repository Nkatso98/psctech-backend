import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voucher } from '../entities/voucher.entity';
import { User } from '../../users/entities/user.entity';
import { Institution } from '../../institutions/entities/institution.entity';
import { VoucherStatus } from '../entities/voucher.entity';

export interface NotificationTemplate {
  subject: string;
  body: string;
  smsBody?: string;
}

export interface NotificationRecipient {
  userId: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface NotificationData {
  voucher: Voucher;
  recipient: NotificationRecipient;
  template: NotificationTemplate;
  metadata?: Record<string, any>;
}

@Injectable()
export class VoucherNotificationService {
  private readonly logger = new Logger(VoucherNotificationService.name);

  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Institution)
    private readonly institutionRepository: Repository<Institution>,
  ) {}

  /**
   * Send voucher redemption confirmation
   */
  async sendRedemptionConfirmation(
    voucher: Voucher,
    redeemedBy: User
  ): Promise<boolean> {
    try {
      this.logger.log(`Sending redemption confirmation for voucher ${voucher.id} to user ${redeemedBy.id}`);

      const recipient: NotificationRecipient = {
        userId: redeemedBy.id,
        email: redeemedBy.email,
        phone: redeemedBy.phone,
        firstName: redeemedBy.firstName,
        lastName: redeemedBy.lastName,
        role: redeemedBy.role
      };

      const template = this.getRedemptionConfirmationTemplate(voucher);
      
      const notificationData: NotificationData = {
        voucher,
        recipient,
        template,
        metadata: {
          redemptionDate: new Date(),
          expiryDate: voucher.expiryDate,
          learnerCount: voucher.learnerCount
        }
      };

      // Send notification
      const success = await this.sendNotification(notificationData);
      
      if (success) {
        this.logger.log(`Redemption confirmation sent successfully to ${redeemedBy.email}`);
      } else {
        this.logger.error(`Failed to send redemption confirmation to ${redeemedBy.email}`);
      }

      return success;
    } catch (error) {
      this.logger.error(`Error sending redemption confirmation: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Send voucher expiry warning
   */
  async sendExpiryWarning(
    voucher: Voucher,
    daysUntilExpiry: number
  ): Promise<boolean> {
    try {
      this.logger.log(`Sending expiry warning for voucher ${voucher.id} (${daysUntilExpiry} days until expiry)`);

      if (!voucher.redeemedByUserId) {
        this.logger.warn(`Voucher ${voucher.id} has no redeemed by user, cannot send expiry warning`);
        return false;
      }

      const redeemedBy = await this.userRepository.findOne({
        where: { id: voucher.redeemedByUserId }
      });

      if (!redeemedBy) {
        this.logger.warn(`User ${voucher.redeemedByUserId} not found for expiry warning`);
        return false;
      }

      const recipient: NotificationRecipient = {
        userId: redeemedBy.id,
        email: redeemedBy.email,
        phone: redeemedBy.phone,
        firstName: redeemedBy.firstName,
        lastName: redeemedBy.lastName,
        role: redeemedBy.role
      };

      const template = this.getExpiryWarningTemplate(voucher, daysUntilExpiry);
      
      const notificationData: NotificationData = {
        voucher,
        recipient,
        template,
        metadata: {
          daysUntilExpiry,
          expiryDate: voucher.expiryDate,
          warningType: daysUntilExpiry <= 3 ? 'urgent' : 'standard'
        }
      };

      // Send notification
      const success = await this.sendNotification(notificationData);
      
      if (success) {
        this.logger.log(`Expiry warning sent successfully to ${redeemedBy.email}`);
      } else {
        this.logger.error(`Failed to send expiry warning to ${redeemedBy.email}`);
      }

      return success;
    } catch (error) {
      this.logger.error(`Error sending expiry warning: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Send voucher expiry notification
   */
  async sendExpiryNotification(voucher: Voucher): Promise<boolean> {
    try {
      this.logger.log(`Sending expiry notification for voucher ${voucher.id}`);

      if (!voucher.redeemedByUserId) {
        this.logger.warn(`Voucher ${voucher.id} has no redeemed by user, cannot send expiry notification`);
        return false;
      }

      const redeemedBy = await this.userRepository.findOne({
        where: { id: voucher.redeemedByUserId }
      });

      if (!redeemedBy) {
        this.logger.warn(`User ${voucher.redeemedByUserId} not found for expiry notification`);
        return false;
      }

      const recipient: NotificationRecipient = {
        userId: redeemedBy.id,
        email: redeemedBy.email,
        phone: redeemedBy.phone,
        firstName: redeemedBy.firstName,
        lastName: redeemedBy.lastName,
        role: redeemedBy.role
      };

      const template = this.getExpiryNotificationTemplate(voucher);
      
      const notificationData: NotificationData = {
        voucher,
        recipient,
        template,
        metadata: {
          expiryDate: voucher.expiryDate,
          daysSinceExpiry: Math.ceil((new Date().getTime() - voucher.expiryDate!.getTime()) / (1000 * 3600 * 24))
        }
      };

      // Send notification
      const success = await this.sendNotification(notificationData);
      
      if (success) {
        this.logger.log(`Expiry notification sent successfully to ${redeemedBy.email}`);
      } else {
        this.logger.error(`Failed to send expiry notification to ${redeemedBy.email}`);
      }

      return success;
    } catch (error) {
      this.logger.error(`Error sending expiry notification: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Send voucher cancellation notification
   */
  async sendCancellationNotification(
    voucher: Voucher,
    cancelledBy: User,
    reason?: string
  ): Promise<boolean> {
    try {
      this.logger.log(`Sending cancellation notification for voucher ${voucher.id}`);

      // Notify the person who redeemed the voucher (if any)
      if (voucher.redeemedByUserId) {
        const redeemedBy = await this.userRepository.findOne({
          where: { id: voucher.redeemedByUserId }
        });

        if (redeemedBy) {
          const recipient: NotificationRecipient = {
            userId: redeemedBy.id,
            email: redeemedBy.email,
            phone: redeemedBy.phone,
            firstName: redeemedBy.firstName,
            lastName: redeemedBy.lastName,
            role: redeemedBy.role
          };

          const template = this.getCancellationNotificationTemplate(voucher, cancelledBy, reason);
          
          const notificationData: NotificationData = {
            voucher,
            recipient,
            template,
            metadata: {
              cancelledBy: `${cancelledBy.firstName} ${cancelledBy.lastName}`,
              cancellationDate: new Date(),
              reason
            }
          };

          await this.sendNotification(notificationData);
        }
      }

      // Notify the person who issued the voucher (if different from who cancelled it)
      if (voucher.issuedByUserId && voucher.issuedByUserId !== cancelledBy.id) {
        const issuedBy = await this.userRepository.findOne({
          where: { id: voucher.issuedByUserId }
        });

        if (issuedBy) {
          const recipient: NotificationRecipient = {
            userId: issuedBy.id,
            email: issuedBy.email,
            phone: issuedBy.phone,
            firstName: issuedBy.firstName,
            lastName: issuedBy.lastName,
            role: issuedBy.role
          };

          const template = this.getIssuerCancellationNotificationTemplate(voucher, cancelledBy, reason);
          
          const notificationData: NotificationData = {
            voucher,
            recipient,
            template,
            metadata: {
              cancelledBy: `${cancelledBy.firstName} ${cancelledBy.lastName}`,
              cancellationDate: new Date(),
              reason
            }
          };

          await this.sendNotification(notificationData);
        }
      }

      this.logger.log(`Cancellation notifications sent successfully for voucher ${voucher.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending cancellation notification: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Send bulk expiry warnings
   */
  async sendBulkExpiryWarnings(
    vouchers: Voucher[],
    daysThreshold: number = 7
  ): Promise<{ success: number; failed: number }> {
    try {
      this.logger.log(`Sending bulk expiry warnings for ${vouchers.length} vouchers`);

      let success = 0;
      let failed = 0;

      for (const voucher of vouchers) {
        try {
          const daysUntilExpiry = Math.ceil((voucher.expiryDate!.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          
          if (daysUntilExpiry <= daysThreshold) {
            const notificationSent = await this.sendExpiryWarning(voucher, daysUntilExpiry);
            if (notificationSent) {
              success++;
            } else {
              failed++;
            }
          }
        } catch (error) {
          this.logger.error(`Error sending expiry warning for voucher ${voucher.id}: ${error.message}`);
          failed++;
        }
      }

      this.logger.log(`Bulk expiry warnings completed: ${success} successful, ${failed} failed`);
      return { success, failed };
    } catch (error) {
      this.logger.error(`Error sending bulk expiry warnings: ${error.message}`, error.stack);
      return { success: 0, failed: vouchers.length };
    }
  }

  /**
   * Send voucher generation notification to issuer
   */
  async sendGenerationNotification(
    voucher: Voucher,
    issuedBy: User
  ): Promise<boolean> {
    try {
      this.logger.log(`Sending generation notification for voucher ${voucher.id} to issuer ${issuedBy.id}`);

      const recipient: NotificationRecipient = {
        userId: issuedBy.id,
        email: issuedBy.email,
        phone: issuedBy.phone,
        firstName: issuedBy.firstName,
        lastName: issuedBy.lastName,
        role: issuedBy.role
      };

      const template = this.getGenerationNotificationTemplate(voucher);
      
      const notificationData: NotificationData = {
        voucher,
        recipient,
        template,
        metadata: {
          generationDate: new Date(),
          voucherCode: voucher.code
        }
      };

      // Send notification
      const success = await this.sendNotification(notificationData);
      
      if (success) {
        this.logger.log(`Generation notification sent successfully to ${issuedBy.email}`);
      } else {
        this.logger.error(`Failed to send generation notification to ${issuedBy.email}`);
      }

      return success;
    } catch (error) {
      this.logger.error(`Error sending generation notification: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Get redemption confirmation template
   */
  private getRedemptionConfirmationTemplate(voucher: Voucher): NotificationTemplate {
    const subject = `Voucher Redemption Confirmation - R${voucher.value}`;
    
    const body = `
      Dear ${voucher.parentName},

      Your voucher has been successfully redeemed!

      Voucher Details:
      - Code: ${voucher.code}
      - Value: R${voucher.value}
      - Learner Count: ${voucher.learnerCount}
      - Redemption Date: ${new Date().toLocaleDateString()}
      - Expiry Date: ${voucher.expiryDate?.toLocaleDateString() || 'Not set'}

      Your learner dashboard access has been activated for ${voucher.learnerCount} learner(s).
      The access will expire on ${voucher.expiryDate?.toLocaleDateString() || 'Not set'}.

      Thank you for choosing our service!

      Best regards,
      PSC Tech Team
    `;

    const smsBody = `Voucher R${voucher.value} redeemed successfully! Access activated for ${voucher.learnerCount} learner(s). Expires: ${voucher.expiryDate?.toLocaleDateString() || 'Not set'}`;

    return { subject, body, smsBody };
  }

  /**
   * Get expiry warning template
   */
  private getExpiryWarningTemplate(voucher: Voucher, daysUntilExpiry: number): NotificationTemplate {
    const urgency = daysUntilExpiry <= 3 ? 'URGENT' : 'Important';
    const subject = `${urgency}: Voucher Expiry Warning - ${daysUntilExpiry} day(s) remaining`;
    
    const body = `
      Dear ${voucher.parentName},

      This is a ${urgency.toLowerCase()} reminder that your voucher access will expire soon.

      Voucher Details:
      - Code: ${voucher.code}
      - Value: R${voucher.value}
      - Learner Count: ${voucher.learnerCount}
      - Expiry Date: ${voucher.expiryDate?.toLocaleDateString() || 'Not set'}
      - Days Remaining: ${daysUntilExpiry}

      ${daysUntilExpiry <= 3 
        ? '⚠️ URGENT: Your access expires very soon! Please ensure all necessary activities are completed.'
        : 'Please ensure all necessary activities are completed before expiry.'
      }

      If you need to extend your access, please contact your institution administrator.

      Best regards,
      PSC Tech Team
    `;

    const smsBody = `${urgency}: Voucher expires in ${daysUntilExpiry} day(s). Code: ${voucher.code}`;

    return { subject, body, smsBody };
  }

  /**
   * Get expiry notification template
   */
  private getExpiryNotificationTemplate(voucher: Voucher): NotificationTemplate {
    const subject = `Voucher Access Expired - R${voucher.value}`;
    
    const body = `
      Dear ${voucher.parentName},

      Your voucher access has expired.

      Voucher Details:
      - Code: ${voucher.code}
      - Value: R${voucher.value}
      - Learner Count: ${voucher.learnerCount}
      - Expiry Date: ${voucher.expiryDate?.toLocaleDateString() || 'Not set'}

      Your learner dashboard access has been deactivated.
      To regain access, you will need to purchase a new voucher.

      If you have any questions, please contact your institution administrator.

      Best regards,
      PSC Tech Team
    `;

    const smsBody = `Voucher access expired. Code: ${voucher.code}. Contact admin for new voucher.`;

    return { subject, body, smsBody };
  }

  /**
   * Get cancellation notification template
   */
  private getCancellationNotificationTemplate(
    voucher: Voucher,
    cancelledBy: User,
    reason?: string
  ): NotificationTemplate {
    const subject = `Voucher Cancelled - R${voucher.value}`;
    
    const body = `
      Dear ${voucher.parentName},

      Your voucher has been cancelled.

      Voucher Details:
      - Code: ${voucher.code}
      - Value: R${voucher.value}
      - Learner Count: ${voucher.learnerCount}
      - Cancelled By: ${cancelledBy.firstName} ${cancelledBy.lastName}
      - Cancellation Date: ${new Date().toLocaleDateString()}
      ${reason ? `- Reason: ${reason}` : ''}

      Your learner dashboard access has been deactivated.
      If you believe this was done in error, please contact your institution administrator.

      Best regards,
      PSC Tech Team
    `;

    const smsBody = `Voucher cancelled. Code: ${voucher.code}. Contact admin if error.`;

    return { subject, body, smsBody };
  }

  /**
   * Get issuer cancellation notification template
   */
  private getIssuerCancellationNotificationTemplate(
    voucher: Voucher,
    cancelledBy: User,
    reason?: string
  ): NotificationTemplate {
    const subject = `Voucher You Issued Has Been Cancelled - R${voucher.value}`;
    
    const body = `
      Dear ${cancelledBy.firstName} ${cancelledBy.lastName},

      A voucher you issued has been cancelled.

      Voucher Details:
      - Code: ${voucher.code}
      - Value: R${voucher.value}
      - Learner Count: ${voucher.learnerCount}
      - Parent/Guardian: ${voucher.parentName}
      - Cancelled By: ${cancelledBy.firstName} ${cancelledBy.lastName}
      - Cancellation Date: ${new Date().toLocaleDateString()}
      ${reason ? `- Reason: ${reason}` : ''}

      This is for your information. The voucher has been removed from the active system.

      Best regards,
      PSC Tech Team
    `;

    const smsBody = `Voucher you issued cancelled. Code: ${voucher.code}`;

    return { subject, body, smsBody };
  }

  /**
   * Get generation notification template
   */
  private getGenerationNotificationTemplate(voucher: Voucher): NotificationTemplate {
    const subject = `Voucher Generated Successfully - R${voucher.value}`;
    
    const body = `
      Dear Administrator,

      A new voucher has been generated successfully.

      Voucher Details:
      - Code: ${voucher.code}
      - Value: R${voucher.value}
      - Learner Count: ${voucher.learnerCount}
      - Parent/Guardian: ${voucher.parentName}
      - Generation Date: ${new Date().toLocaleDateString()}
      ${voucher.notes ? `- Notes: ${voucher.notes}` : ''}

      The voucher is now active and ready for redemption.
      Please provide the voucher code to the parent/guardian.

      Best regards,
      PSC Tech Team
    `;

    const smsBody = `Voucher generated: ${voucher.code} - R${voucher.value} for ${voucher.parentName}`;

    return { subject, body, smsBody };
  }

  /**
   * Send notification (placeholder for actual notification service integration)
   */
  private async sendNotification(notificationData: NotificationData): Promise<boolean> {
    try {
      this.logger.log(`Sending notification to ${notificationData.recipient.email}`);

      // TODO: Integrate with actual notification service (email, SMS, push notifications)
      // For now, just log the notification details
      
      this.logger.log(`Notification Details:
        To: ${notificationData.recipient.email}
        Subject: ${notificationData.template.subject}
        Body: ${notificationData.template.body.substring(0, 100)}...
        SMS: ${notificationData.template.smsBody}
        Metadata: ${JSON.stringify(notificationData.metadata)}
      `);

      // Simulate notification delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate 95% success rate
      const success = Math.random() > 0.05;
      
      if (success) {
        this.logger.log(`Notification sent successfully to ${notificationData.recipient.email}`);
      } else {
        this.logger.warn(`Notification failed to send to ${notificationData.recipient.email}`);
      }

      return success;
    } catch (error) {
      this.logger.error(`Error sending notification: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Get notification preferences for a user
   */
  async getUserNotificationPreferences(userId: string): Promise<{
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    expiryWarnings: boolean;
    expiryWarningsDays: number[];
  }> {
    try {
      // TODO: Implement user notification preferences from database
      // For now, return default preferences
      return {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: false,
        expiryWarnings: true,
        expiryWarningsDays: [7, 3, 1] // Send warnings 7, 3, and 1 day before expiry
      };
    } catch (error) {
      this.logger.error(`Error getting user notification preferences: ${error.message}`, error.stack);
      // Return default preferences on error
      return {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: false,
        expiryWarnings: true,
        expiryWarningsDays: [7, 3, 1]
      };
    }
  }

  /**
   * Update user notification preferences
   */
  async updateUserNotificationPreferences(
    userId: string,
    preferences: {
      emailNotifications?: boolean;
      smsNotifications?: boolean;
      pushNotifications?: boolean;
      expiryWarnings?: boolean;
      expiryWarningsDays?: number[];
    }
  ): Promise<boolean> {
    try {
      this.logger.log(`Updating notification preferences for user ${userId}`);

      // TODO: Implement updating user notification preferences in database
      // For now, just log the update
      
      this.logger.log(`Updated preferences: ${JSON.stringify(preferences)}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Error updating notification preferences: ${error.message}`, error.stack);
      return false;
    }
  }
}


