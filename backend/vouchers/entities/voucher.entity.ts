import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Institution } from '../../institutions/entities/institution.entity';
import { VoucherRedemption } from './voucher-redemption.entity';
import { VoucherAudit } from './voucher-audit.entity';

// Align with frontend status values
export enum VoucherStatus {
  ACTIVE = 'active',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

@Entity('vouchers')
@Index(['institutionId', 'status'])
@Index(['codeHash'], { unique: true })
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 19, unique: true, comment: 'Human-readable voucher code (XXXX-XXXX-XXXX-XXXX)' })
  code: string;

  @Column({ type: 'binary', length: 32, comment: 'SHA-256 hash of voucher code for security' })
  codeHash: Buffer;

  @Column({ type: 'binary', length: 16, comment: 'Random salt for code hashing' })
  codeSalt: Buffer;

  @Column({ type: 'int', comment: 'Voucher value in cents (e.g., 2500 = R25.00)' })
  valueCents: number;

  @Column({ type: 'int', comment: 'Number of learners this voucher will activate (1-10)' })
  learnerCount: number;

  @Column({ type: 'varchar', length: 100, comment: 'Full name of parent/guardian' })
  parentName: string;

  @Column({ type: 'enum', enum: VoucherStatus, default: VoucherStatus.ACTIVE, comment: 'Current status of the voucher' })
  status: VoucherStatus;

  @Column({ type: 'varchar', length: 50, comment: 'Institution ID where voucher was issued' })
  institutionId: string;

  @Column({ type: 'varchar', length: 50, comment: 'User ID who issued the voucher' })
  issuedByUserId: string;

  @Column({ type: 'datetime', comment: 'Date when voucher was issued' })
  issuedDate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: 'User ID who redeemed the voucher' })
  redeemedByUserId: string | null;

  @Column({ type: 'datetime', nullable: true, comment: 'Date when voucher was redeemed' })
  redeemedDate: Date | null;

  @Column({ type: 'datetime', nullable: true, comment: 'Date when voucher access expires (30 days after redemption)' })
  expiryDate: Date | null;

  @Column({ type: 'text', nullable: true, comment: 'Optional notes for tracking purposes' })
  notes: string | null;

  @Column({ type: 'boolean', default: true, comment: 'Whether the voucher is currently active' })
  isActive: boolean;

  @Column({ type: 'json', nullable: true, comment: 'Additional metadata for the voucher' })
  metadata: {
    denomination: number;
    parentInfo: string;
    learnerCount: number;
    notes?: string;
    [key: string]: any;
  } | null;

  @CreateDateColumn({ comment: 'Date when voucher was created' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Date when voucher was last updated' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Institution, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'institutionId' })
  institution: Institution;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'issuedByUserId' })
  issuedBy: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'redeemedByUserId' })
  redeemedBy: User;

  @OneToMany(() => VoucherRedemption, redemption => redemption.voucher)
  redemptions: VoucherRedemption[];

  @OneToMany(() => VoucherAudit, audit => audit.voucher)
  audits: VoucherAudit[];

  // Computed properties
  get value(): number {
    return this.valueCents / 100;
  }

  get isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
  }

  get canBeRedeemed(): boolean {
    return this.status === VoucherStatus.ACTIVE && this.isActive && !this.isExpired;
  }

  get daysUntilExpiry(): number | null {
    if (!this.expiryDate) return null;
    const now = new Date();
    const timeDiff = this.expiryDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  get statusDisplay(): string {
    switch (this.status) {
      case VoucherStatus.ACTIVE:
        return 'Active';
      case VoucherStatus.REDEEMED:
        return 'Redeemed';
      case VoucherStatus.EXPIRED:
        return 'Expired';
      case VoucherStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  get statusColor(): string {
    switch (this.status) {
      case VoucherStatus.ACTIVE:
        return 'text-blue-600';
      case VoucherStatus.REDEEMED:
        return 'text-green-600';
      case VoucherStatus.EXPIRED:
        return 'text-red-600';
      case VoucherStatus.CANCELLED:
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }

  // Business logic methods
  canBeCancelled(): boolean {
    return this.status === VoucherStatus.ACTIVE || this.status === VoucherStatus.REDEEMED;
  }

  canBeUpdated(): boolean {
    return this.status !== VoucherStatus.CANCELLED;
  }

  getExpiryDate(): Date | null {
    if (this.status === VoucherStatus.REDEEMED && this.redeemedDate) {
      // 30 days after redemption
      return new Date(this.redeemedDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    }
    return this.expiryDate;
  }

  validateForRedemption(): { isValid: boolean; error?: string } {
    if (this.status !== VoucherStatus.ACTIVE) {
      return { isValid: false, error: 'Voucher is not active' };
    }

    if (!this.isActive) {
      return { isValid: false, error: 'Voucher is not active' };
    }

    if (this.isExpired) {
      return { isValid: false, error: 'Voucher has expired' };
    }

    return { isValid: true };
  }

  markAsRedeemed(userId: string): void {
    this.status = VoucherStatus.REDEEMED;
    this.redeemedByUserId = userId;
    this.redeemedDate = new Date();
    this.expiryDate = new Date(this.redeemedDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    this.updatedAt = new Date();
  }

  markAsExpired(): void {
    this.status = VoucherStatus.EXPIRED;
    this.isActive = false;
    this.updatedAt = new Date();
  }

  markAsCancelled(): void {
    this.status = VoucherStatus.CANCELLED;
    this.isActive = false;
    this.updatedAt = new Date();
  }

  updateNotes(notes: string): void {
    this.notes = notes;
    this.updatedAt = new Date();
  }

  // Frontend compatibility methods
  toFrontendResponse(): any {
    return {
      id: this.id,
      code: this.code,
      value: this.value,
      learnerCount: this.learnerCount,
      parentName: this.parentName,
      status: this.status,
      institutionId: this.institutionId,
      issuedByUserId: this.issuedByUserId,
      issuedDate: this.issuedDate.toISOString(),
      redeemedByUserId: this.redeemedByUserId,
      redeemedDate: this.redeemedDate?.toISOString(),
      expiryDate: this.expiryDate?.toISOString(),
      notes: this.notes,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      // Additional fields for frontend
      issuedBy: this.issuedBy?.fullName || 'Unknown',
      redeemedBy: this.redeemedBy?.fullName,
      institutionName: this.institution?.name || 'Unknown',
      isExpired: this.isExpired,
      canBeRedeemed: this.canBeRedeemed,
      daysUntilExpiry: this.daysUntilExpiry,
      statusDisplay: this.statusDisplay,
      statusColor: this.statusColor
    };
  }
}
