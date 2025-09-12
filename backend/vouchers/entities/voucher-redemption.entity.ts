import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Voucher } from './voucher.entity';
import { User } from '../../users/entities/user.entity';

// Align with frontend expectations
export enum RedemptionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum RedemptionMethod {
  ONLINE = 'online',
  MOBILE_APP = 'mobile_app',
  ADMIN_PANEL = 'admin_panel',
  API = 'api'
}

@Entity('voucher_redemptions')
@Index(['voucherId', 'userId'])
@Index(['userId', 'createdAt'])
@Index(['status', 'createdAt'])
export class VoucherRedemption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, comment: 'Reference to the voucher being redeemed' })
  voucherId: string;

  @Column({ type: 'varchar', length: 50, comment: 'User who is redeeming the voucher' })
  userId: string;

  @Column({ type: 'enum', enum: RedemptionStatus, default: RedemptionStatus.PENDING, comment: 'Current status of the redemption process' })
  status: RedemptionStatus;

  @Column({ type: 'enum', enum: RedemptionMethod, default: RedemptionMethod.ONLINE, comment: 'Method used to redeem the voucher' })
  method: RedemptionMethod;

  @Column({ type: 'datetime', comment: 'Date and time when redemption was initiated' })
  redemptionDate: Date;

  @Column({ type: 'datetime', nullable: true, comment: 'Date and time when redemption was completed' })
  completedDate: Date | null;

  @Column({ type: 'datetime', nullable: true, comment: 'Date and time when redemption was cancelled or failed' })
  cancelledDate: Date | null;

  @Column({ type: 'text', nullable: true, comment: 'Reason for cancellation or failure' })
  reason: string | null;

  @Column({ type: 'json', nullable: true, comment: 'Additional metadata about the redemption process' })
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
    location?: string;
    redemptionAttempts?: number;
    validationErrors?: string[];
    [key: string]: any;
  } | null;

  @Column({ type: 'boolean', default: false, comment: 'Whether the redemption was successful' })
  isSuccessful: boolean;

  @Column({ type: 'text', nullable: true, comment: 'Error message if redemption failed' })
  errorMessage: string | null;

  @Column({ type: 'int', default: 0, comment: 'Number of attempts made to redeem this voucher' })
  attemptCount: number;

  @Column({ type: 'datetime', nullable: true, comment: 'Last attempt timestamp' })
  lastAttemptDate: Date | null;

  @Column({ type: 'boolean', default: true, comment: 'Whether this redemption record is active' })
  isActive: boolean;

  @CreateDateColumn({ comment: 'Date when redemption record was created' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Date when redemption record was last updated' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Voucher, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voucherId' })
  voucher: Voucher;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Computed properties
  get isPending(): boolean {
    return this.status === RedemptionStatus.PENDING;
  }

  get isCompleted(): boolean {
    return this.status === RedemptionStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === RedemptionStatus.FAILED;
  }

  get isCancelled(): boolean {
    return this.status === RedemptionStatus.CANCELLED;
  }

  get canBeRetried(): boolean {
    return this.status === RedemptionStatus.FAILED && this.attemptCount < 3;
  }

  get isExpired(): boolean {
    if (!this.redemptionDate) return false;
    const now = new Date();
    const redemptionTime = new Date(this.redemptionDate);
    // Consider redemption expired if it's been pending for more than 24 hours
    return (now.getTime() - redemptionTime.getTime()) > (24 * 60 * 60 * 1000);
  }

  get duration(): number | null {
    if (!this.redemptionDate || !this.completedDate) return null;
    return this.completedDate.getTime() - this.redemptionDate.getTime();
  }

  get durationFormatted(): string | null {
    const duration = this.duration;
    if (duration === null) return null;

    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Business logic methods
  markAsCompleted(): void {
    this.status = RedemptionStatus.COMPLETED;
    this.completedDate = new Date();
    this.isSuccessful = true;
    this.errorMessage = null;
    this.updatedAt = new Date();
  }

  markAsFailed(errorMessage: string): void {
    this.status = RedemptionStatus.FAILED;
    this.isSuccessful = false;
    this.errorMessage = errorMessage;
    this.attemptCount++;
    this.lastAttemptDate = new Date();
    this.updatedAt = new Date();
  }

  markAsCancelled(reason: string): void {
    this.status = RedemptionStatus.CANCELLED;
    this.cancelledDate = new Date();
    this.reason = reason;
    this.isSuccessful = false;
    this.updatedAt = new Date();
  }

  retry(): void {
    if (!this.canBeRetried) {
      throw new Error('Redemption cannot be retried');
    }
    
    this.status = RedemptionStatus.PENDING;
    this.redemptionDate = new Date();
    this.errorMessage = null;
    this.updatedAt = new Date();
  }

  addAttempt(): void {
    this.attemptCount++;
    this.lastAttemptDate = new Date();
    this.updatedAt = new Date();
  }

  updateMetadata(metadata: Partial<NonNullable<typeof this.metadata>>): void {
    this.metadata = { ...this.metadata, ...metadata };
    this.updatedAt = new Date();
  }

  setDeviceInfo(ipAddress: string, userAgent: string, deviceInfo?: string): void {
    this.metadata = {
      ...this.metadata,
      ipAddress,
      userAgent,
      deviceInfo
    };
    this.updatedAt = new Date();
  }

  setLocation(location: string): void {
    this.metadata = {
      ...this.metadata,
      location
    };
    this.updatedAt = new Date();
  }

  addValidationError(error: string): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    
    if (!this.metadata.validationErrors) {
      this.metadata.validationErrors = [];
    }
    
    this.metadata.validationErrors.push(error);
    this.updatedAt = new Date();
  }

  getValidationErrors(): string[] {
    return this.metadata?.validationErrors || [];
  }

  clearValidationErrors(): void {
    if (this.metadata) {
      this.metadata.validationErrors = [];
      this.updatedAt = new Date();
    }
  }

  // Static factory methods
  static create(
    voucherId: string,
    userId: string,
    method: RedemptionMethod = RedemptionMethod.ONLINE
  ): VoucherRedemption {
    const redemption = new VoucherRedemption();
    redemption.voucherId = voucherId;
    redemption.userId = userId;
    redemption.method = method;
    redemption.status = RedemptionStatus.PENDING;
    redemption.redemptionDate = new Date();
    redemption.isSuccessful = false;
    redemption.attemptCount = 1;
    redemption.lastAttemptDate = new Date();
    redemption.isActive = true;
    redemption.metadata = {};
    return redemption;
  }

  static createFromVoucher(
    voucher: Voucher,
    userId: string,
    method: RedemptionMethod = RedemptionMethod.ONLINE
  ): VoucherRedemption {
    return VoucherRedemption.create(voucher.id, userId, method);
  }

  // Validation methods
  validateForCompletion(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.status !== RedemptionStatus.PENDING) {
      errors.push('Redemption must be in pending status to complete');
    }

    if (!this.redemptionDate) {
      errors.push('Redemption date is required');
    }

    if (this.isExpired) {
      errors.push('Redemption has expired and cannot be completed');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateForCancellation(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.status === RedemptionStatus.COMPLETED) {
      errors.push('Completed redemptions cannot be cancelled');
    }

    if (this.status === RedemptionStatus.CANCELLED) {
      errors.push('Redemption is already cancelled');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Frontend compatibility methods
  toFrontendResponse(): any {
    return {
      id: this.id,
      voucherId: this.voucherId,
      userId: this.userId,
      status: this.status,
      method: this.method,
      redemptionDate: this.redemptionDate.toISOString(),
      completedDate: this.completedDate?.toISOString(),
      cancelledDate: this.cancelledDate?.toISOString(),
      reason: this.reason,
      isSuccessful: this.isSuccessful,
      errorMessage: this.errorMessage,
      attemptCount: this.attemptCount,
      lastAttemptDate: this.lastAttemptDate?.toISOString(),
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      // Computed properties
      isPending: this.isPending,
      isCompleted: this.isCompleted,
      isFailed: this.isFailed,
      isCancelled: this.isCancelled,
      canBeRetried: this.canBeRetried,
      isExpired: this.isExpired,
      duration: this.duration,
      durationFormatted: this.durationFormatted
    };
  }

  // Utility methods
  toJSON(): any {
    return this.toFrontendResponse();
  }

  clone(): VoucherRedemption {
    const cloned = new VoucherRedemption();
    Object.assign(cloned, this);
    cloned.id = undefined as any;
    cloned.createdAt = undefined as any;
    cloned.updatedAt = undefined as any;
    return cloned;
  }
}
