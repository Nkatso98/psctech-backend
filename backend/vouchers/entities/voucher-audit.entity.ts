import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne } from 'typeorm';
import { Voucher } from './voucher.entity';

// Align with frontend expectations
export enum AuditAction {
  // Voucher lifecycle actions
  CREATED = 'created',
  UPDATED = 'updated',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  EXTENDED = 'extended',
  
  // Status changes
  STATUS_CHANGED = 'status_changed',
  ACTIVATED = 'activated',
  DEACTIVATED = 'deactivated',
  
  // Value and configuration changes
  VALUE_CHANGED = 'value_changed',
  LEARNER_COUNT_CHANGED = 'learner_count_changed',
  NOTES_UPDATED = 'notes_updated',
  
  // Security and access actions
  ACCESS_GRANTED = 'access_granted',
  ACCESS_REVOKED = 'access_revoked',
  PERMISSION_CHANGED = 'permission_changed',
  
  // System actions
  SYSTEM_EXPIRY = 'system_expiry',
  BULK_UPDATE = 'bulk_update',
  IMPORT = 'import',
  EXPORT = 'export',
  
  // Error and failure tracking
  VALIDATION_FAILED = 'validation_failed',
  REDEMPTION_FAILED = 'redemption_failed',
  SYSTEM_ERROR = 'system_error',
  
  // Administrative actions
  ADMIN_OVERRIDE = 'admin_override',
  MANUAL_CORRECTION = 'manual_correction',
  AUDIT_REVIEW = 'audit_review'
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum AuditSource {
  USER = 'user',
  SYSTEM = 'system',
  API = 'api',
  SCHEDULED = 'scheduled',
  ADMIN = 'admin'
}

@Entity('voucher_audits')
@Index(['voucherId', 'createdAt'])
@Index(['action', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['severity', 'createdAt'])
@Index(['source', 'createdAt'])
export class VoucherAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, comment: 'Reference to the voucher being audited' })
  voucherId: string;

  @Column({ type: 'enum', enum: AuditAction, comment: 'Action performed on the voucher' })
  action: AuditAction;

  @Column({ type: 'enum', enum: AuditSeverity, default: AuditSeverity.INFO, comment: 'Severity level of the audit event' })
  severity: AuditSeverity;

  @Column({ type: 'enum', enum: AuditSource, default: AuditSource.SYSTEM, comment: 'Source of the audit event' })
  source: AuditSource;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: 'User who performed the action (if applicable)' })
  userId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Username or identifier of the user who performed the action' })
  username: string | null;

  @Column({ type: 'text', comment: 'Description of the action performed' })
  description: string;

  @Column({ type: 'json', nullable: true, comment: 'Additional metadata about the audit event' })
  metadata: {
    // Previous values (for updates)
    previousValues?: Record<string, any>;
    
    // New values (for updates)
    newValues?: Record<string, any>;
    
    // Error details (for failures)
    errorCode?: string;
    errorMessage?: string;
    stackTrace?: string;
    
    // Context information
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    requestId?: string;
    
    // Business logic context
    reason?: string;
    justification?: string;
    approvalRequired?: boolean;
    approvedBy?: string;
    
    // Performance metrics
    executionTime?: number;
    memoryUsage?: number;
    
    // Related entities
    relatedVoucherIds?: string[];
    relatedUserId?: string;
    institutionId?: string;
    
    // Custom fields
    [key: string]: any;
  } | null;

  @Column({ type: 'boolean', default: false, comment: 'Whether this audit event requires review' })
  requiresReview: boolean;

  @Column({ type: 'text', nullable: true, comment: 'Additional notes for review purposes' })
  reviewNotes: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: 'User who reviewed this audit event' })
  reviewedBy: string | null;

  @Column({ type: 'datetime', nullable: true, comment: 'Date when this audit event was reviewed' })
  reviewedAt: Date | null;

  @Column({ type: 'boolean', default: false, comment: 'Whether this audit event has been reviewed' })
  isReviewed: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Category for grouping related audit events' })
  category: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Subcategory for further classification' })
  subcategory: string | null;

  @Column({ type: 'boolean', default: true, comment: 'Whether this audit record is active' })
  isActive: boolean;

  @CreateDateColumn({ comment: 'Date when audit record was created' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => Voucher, { onDelete: 'CASCADE' })
  voucher: Voucher;

  // Computed properties
  get isHighSeverity(): boolean {
    return this.severity === AuditSeverity.ERROR || this.severity === AuditSeverity.CRITICAL;
  }

  get isLowSeverity(): boolean {
    return this.severity === AuditSeverity.INFO;
  }

  get isWarning(): boolean {
    return this.severity === AuditSeverity.WARNING;
  }

  get isUserAction(): boolean {
    return this.source === AuditSource.USER || this.source === AuditSource.ADMIN;
  }

  get isSystemAction(): boolean {
    return this.source === AuditSource.SYSTEM || this.source === AuditSource.SCHEDULED;
  }

  get isApiAction(): boolean {
    return this.source === AuditSource.API;
  }

  get hasMetadata(): boolean {
    return this.metadata !== null && Object.keys(this.metadata).length > 0;
  }

  get isPendingReview(): boolean {
    return this.requiresReview && !this.isReviewed;
  }

  get isReviewedStatus(): boolean {
    return this.reviewedAt !== null && this.reviewedBy !== null;
  }

  get ageInHours(): number {
    const now = new Date();
    const created = new Date(this.createdAt);
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
  }

  get ageInDays(): number {
    const now = new Date();
    const created = new Date(this.createdAt);
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Business logic methods
  markAsReviewed(reviewedBy: string, notes?: string): void {
    this.isReviewed = true;
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
    if (notes) {
      this.reviewNotes = notes;
    }
  }

  markForReview(reason: string): void {
    this.requiresReview = true;
    this.reviewNotes = reason;
  }

  updateSeverity(newSeverity: AuditSeverity, reason?: string): void {
    this.severity = newSeverity;
    if (reason) {
      this.metadata = {
        ...this.metadata,
        severityChangeReason: reason,
        previousSeverity: this.severity
      };
    }
  }

  addMetadata(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
  }

  setPreviousValues(values: Record<string, any>): void {
    this.metadata = {
      ...this.metadata,
      previousValues: values
    };
  }

  setNewValues(values: Record<string, any>): void {
    this.metadata = {
      ...this.metadata,
      newValues: values
    };
  }

  setErrorDetails(errorCode: string, errorMessage: string, stackTrace?: string): void {
    this.metadata = {
      ...this.metadata,
      errorCode,
      errorMessage,
      stackTrace
    };
    this.severity = AuditSeverity.ERROR;
  }

  setContextInfo(ipAddress?: string, userAgent?: string, sessionId?: string, requestId?: string): void {
    this.metadata = {
      ...this.metadata,
      ipAddress,
      userAgent,
      sessionId,
      requestId
    };
  }

  setPerformanceMetrics(executionTime: number, memoryUsage?: number): void {
    this.metadata = {
      ...this.metadata,
      executionTime,
      memoryUsage
    };
  }

  setBusinessContext(reason?: string, justification?: string, approvalRequired?: boolean, approvedBy?: string): void {
    this.metadata = {
      ...this.metadata,
      reason,
      justification,
      approvalRequired,
      approvedBy
    };
  }

  // Static factory methods
  static create(
    voucherId: string,
    action: AuditAction,
    description: string,
    source: AuditSource = AuditSource.SYSTEM,
    severity: AuditSeverity = AuditSeverity.INFO,
    userId?: string,
    username?: string
  ): VoucherAudit {
    const audit = new VoucherAudit();
    audit.voucherId = voucherId;
    audit.action = action;
    audit.description = description;
    audit.source = source;
    audit.severity = severity;
    audit.userId = userId || null;
    audit.username = username || null;
    audit.metadata = {};
    audit.requiresReview = severity === AuditSeverity.ERROR || severity === AuditSeverity.CRITICAL;
    audit.isActive = true;
    return audit;
  }

  static createUserAction(
    voucherId: string,
    action: AuditAction,
    description: string,
    userId: string,
    username: string,
    severity: AuditSeverity = AuditSeverity.INFO
  ): VoucherAudit {
    return VoucherAudit.create(
      voucherId,
      action,
      description,
      AuditSource.USER,
      severity,
      userId,
      username
    );
  }

  static createSystemAction(
    voucherId: string,
    action: AuditAction,
    description: string,
    severity: AuditSeverity = AuditSeverity.INFO
  ): VoucherAudit {
    return VoucherAudit.create(
      voucherId,
      action,
      description,
      AuditSource.SYSTEM,
      severity
    );
  }

  static createError(
    voucherId: string,
    action: AuditAction,
    description: string,
    errorCode: string,
    errorMessage: string,
    source: AuditSource = AuditSource.SYSTEM
  ): VoucherAudit {
    const audit = VoucherAudit.create(
      voucherId,
      action,
      description,
      source,
      AuditSeverity.ERROR
    );
    audit.setErrorDetails(errorCode, errorMessage);
    audit.requiresReview = true;
    return audit;
  }

  static createUpdate(
    voucherId: string,
    previousValues: Record<string, any>,
    newValues: Record<string, any>,
    userId?: string,
    username?: string
  ): VoucherAudit {
    const audit = VoucherAudit.create(
      voucherId,
      AuditAction.UPDATED,
      'Voucher updated',
      userId ? AuditSource.USER : AuditSource.SYSTEM,
      AuditSeverity.INFO,
      userId,
      username
    );
    audit.setPreviousValues(previousValues);
    audit.setNewValues(newValues);
    return audit;
  }

  // Validation methods
  validateForReview(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.requiresReview) {
      errors.push('Audit event does not require review');
    }

    if (this.isReviewedStatus) {
      errors.push('Audit event has already been reviewed');
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
      action: this.action,
      severity: this.severity,
      source: this.source,
      userId: this.userId,
      username: this.username,
      description: this.description,
      metadata: this.metadata,
      requiresReview: this.requiresReview,
      reviewNotes: this.reviewNotes,
      reviewedBy: this.reviewedBy,
      reviewedAt: this.reviewedAt?.toISOString(),
      isReviewed: this.isReviewedStatus,
      category: this.category,
      subcategory: this.subcategory,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      // Computed properties
      isHighSeverity: this.isHighSeverity,
      isLowSeverity: this.isLowSeverity,
      isWarning: this.isWarning,
      isUserAction: this.isUserAction,
      isSystemAction: this.isSystemAction,
      isApiAction: this.isApiAction,
      hasMetadata: this.hasMetadata,
      isPendingReview: this.isPendingReview,
      ageInHours: this.ageInHours,
      ageInDays: this.ageInDays
    };
  }

  // Utility methods
  toJSON(): any {
    return this.toFrontendResponse();
  }

  clone(): VoucherAudit {
    const cloned = new VoucherAudit();
    Object.assign(cloned, this);
    cloned.id = undefined as any;
    cloned.createdAt = undefined as any;
    return cloned;
  }

  // Search and filtering helpers
  matchesSearch(searchTerm: string): boolean {
    const searchLower = searchTerm.toLowerCase();
    return (
      this.description.toLowerCase().includes(searchLower) ||
      this.action.toLowerCase().includes(searchLower) ||
      (this.username && this.username.toLowerCase().includes(searchLower)) ||
      (this.metadata && JSON.stringify(this.metadata).toLowerCase().includes(searchLower))
    );
  }

  isInDateRange(startDate: Date, endDate: Date): boolean {
    const created = new Date(this.createdAt);
    return created >= startDate && created <= endDate;
  }

  isInCategory(category: string): boolean {
    return this.category === category;
  }

  isInSubcategory(subcategory: string): boolean {
    return this.subcategory === subcategory;
  }
}
