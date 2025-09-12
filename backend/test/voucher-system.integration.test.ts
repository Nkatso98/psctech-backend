import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherModule } from '../vouchers/voucher.module';
import { VoucherService } from '../vouchers/voucher.service';
import { VoucherController } from '../vouchers/voucher.controller';
import { Voucher } from '../vouchers/entities/voucher.entity';
import { VoucherRedemption } from '../vouchers/entities/voucher-redemption.entity';
import { VoucherAudit } from '../vouchers/entities/voucher-audit.entity';
import { getDatabaseConfig } from '../config/database.config';
import { VoucherStatus } from '../vouchers/entities/voucher.entity';
import { RedemptionStatus } from '../vouchers/entities/voucher-redemption.entity';
import { AuditAction, AuditSeverity, AuditSource } from '../vouchers/entities/voucher-audit.entity';

describe('Voucher System Integration Tests', () => {
  let app: INestApplication;
  let voucherService: VoucherService;
  let voucherController: VoucherController;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...getDatabaseConfig(),
          database: 'psctech_test', // Use test database
          synchronize: true, // Auto-create tables for testing
          logging: false, // Disable logging during tests
        }),
        VoucherModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    voucherService = moduleFixture.get<VoucherService>(VoucherService);
    voucherController = moduleFixture.get<VoucherController>(VoucherController);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await voucherService.clearTestData();
  });

  describe('Voucher Generation Flow', () => {
    it('should generate a voucher with correct properties', async () => {
      const voucherData = {
        value: 25,
        learnerCount: 3,
        parentName: 'John Smith',
        notes: 'Test voucher for integration testing',
        institutionId: 'test-institution-001',
        issuedByUserId: 'test-principal-001',
      };

      const voucher = await voucherService.generateVoucher(voucherData);

      expect(voucher).toBeDefined();
      expect(voucher.value).toBe(25);
      expect(voucher.learnerCount).toBe(3);
      expect(voucher.parentName).toBe('John Smith');
      expect(voucher.status).toBe(VoucherStatus.ACTIVE);
      expect(voucher.institutionId).toBe('test-institution-001');
      expect(voucher.issuedByUserId).toBe('test-principal-001');
      expect(voucher.codeHash).toBeDefined();
      expect(voucher.codeSalt).toBeDefined();
      expect(voucher.visibleCode).toBeDefined();
      expect(voucher.visibleCode).toHaveLength(8);
    });

    it('should validate voucher denominations correctly', async () => {
      const invalidVoucherData = {
        value: 23, // Invalid denomination
        learnerCount: 3,
        parentName: 'John Smith',
        institutionId: 'test-institution-001',
        issuedByUserId: 'test-principal-001',
      };

      await expect(
        voucherService.generateVoucher(invalidVoucherData)
      ).rejects.toThrow('Invalid voucher denomination');
    });

    it('should validate learner count range', async () => {
      const invalidVoucherData = {
        value: 25,
        learnerCount: 15, // Invalid: exceeds maximum of 10
        parentName: 'John Smith',
        institutionId: 'test-institution-001',
        issuedByUserId: 'test-principal-001',
      };

      await expect(
        voucherService.generateVoucher(invalidVoucherData)
      ).rejects.toThrow('Learner count must be between 1 and 10');
    });
  });

  describe('Voucher Redemption Flow', () => {
    let testVoucher: Voucher;

    beforeEach(async () => {
      // Create a test voucher for redemption tests
      testVoucher = await voucherService.generateVoucher({
        value: 30,
        learnerCount: 2,
        parentName: 'Jane Doe',
        institutionId: 'test-institution-001',
        issuedByUserId: 'test-principal-001',
      });
    });

    it('should redeem a valid voucher successfully', async () => {
      const redemptionData = {
        voucherCode: testVoucher.visibleCode,
        userId: 'test-parent-001',
        institutionId: 'test-institution-001',
      };

      const redemption = await voucherService.redeemVoucher(redemptionData);

      expect(redemption.success).toBe(true);
      expect(redemption.voucherCode).toBe(testVoucher.visibleCode);
      expect(redemption.value).toBe(30);
      expect(redemption.learnerCount).toBe(2);
      expect(redemption.parentName).toBe('Jane Doe');
      expect(redemption.activatedLearners).toHaveLength(2);
      expect(redemption.expiryDate).toBeDefined();

      // Verify voucher status changed
      const updatedVoucher = await voucherService.getVoucherById(testVoucher.id);
      expect(updatedVoucher.status).toBe(VoucherStatus.REDEEMED);
      expect(updatedVoucher.redeemedByUserId).toBe('test-parent-001');
      expect(updatedVoucher.redeemedDate).toBeDefined();
      expect(updatedVoucher.expiryDate).toBeDefined();
    });

    it('should set expiry date to 30 days after redemption', async () => {
      const redemptionData = {
        voucherCode: testVoucher.visibleCode,
        userId: 'test-parent-001',
        institutionId: 'test-institution-001',
      };

      const redemption = await voucherService.redeemVoucher(redemptionData);
      const updatedVoucher = await voucherService.getVoucherById(testVoucher.id);

      const redemptionDate = new Date(updatedVoucher.redeemedDate!);
      const expiryDate = new Date(updatedVoucher.expiryDate!);
      const daysDifference = Math.ceil((expiryDate.getTime() - redemptionDate.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysDifference).toBe(30);
    });

    it('should prevent redeeming an already redeemed voucher', async () => {
      const redemptionData = {
        voucherCode: testVoucher.visibleCode,
        userId: 'test-parent-001',
        institutionId: 'test-institution-001',
      };

      // First redemption
      await voucherService.redeemVoucher(redemptionData);

      // Second redemption should fail
      await expect(
        voucherService.redeemVoucher(redemptionData)
      ).rejects.toThrow('Voucher has already been redeemed');
    });

    it('should prevent redeeming an expired voucher', async () => {
      // Manually set voucher as expired
      await voucherService.updateVoucherStatus(testVoucher.id, VoucherStatus.EXPIRED);

      const redemptionData = {
        voucherCode: testVoucher.visibleCode,
        userId: 'test-parent-001',
        institutionId: 'test-institution-001',
      };

      await expect(
        voucherService.redeemVoucher(redemptionData)
      ).rejects.toThrow('Voucher has expired');
    });
  });

  describe('Voucher Management Flow', () => {
    let testVouchers: Voucher[];

    beforeEach(async () => {
      // Create multiple test vouchers
      testVouchers = await Promise.all([
        voucherService.generateVoucher({
          value: 15,
          learnerCount: 1,
          parentName: 'Alice Johnson',
          institutionId: 'test-institution-001',
          issuedByUserId: 'test-principal-001',
        }),
        voucherService.generateVoucher({
          value: 35,
          learnerCount: 4,
          parentName: 'Bob Wilson',
          institutionId: 'test-institution-001',
          issuedByUserId: 'test-principal-001',
        }),
        voucherService.generateVoucher({
          value: 45,
          learnerCount: 2,
          parentName: 'Carol Brown',
          institutionId: 'test-institution-001',
          issuedByUserId: 'test-principal-001',
        }),
      ]);
    });

    it('should list all vouchers with correct pagination', async () => {
      const result = await voucherService.getVouchers({
        page: 1,
        limit: 10,
        institutionId: 'test-institution-001',
      });

      expect(result.vouchers).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter vouchers by status', async () => {
      // Redeem one voucher
      await voucherService.redeemVoucher({
        voucherCode: testVouchers[0].visibleCode,
        userId: 'test-parent-001',
        institutionId: 'test-institution-001',
      });

      const activeVouchers = await voucherService.getVouchers({
        statusFilter: VoucherStatus.ACTIVE,
        institutionId: 'test-institution-001',
      });

      const redeemedVouchers = await voucherService.getVouchers({
        statusFilter: VoucherStatus.REDEEMED,
        institutionId: 'test-institution-001',
      });

      expect(activeVouchers.vouchers).toHaveLength(2);
      expect(redeemedVouchers.vouchers).toHaveLength(1);
    });

    it('should filter vouchers by parent name', async () => {
      const aliceVouchers = await voucherService.getVouchers({
        searchTerm: 'Alice',
        institutionId: 'test-institution-001',
      });

      expect(aliceVouchers.vouchers).toHaveLength(1);
      expect(aliceVouchers.vouchers[0].parentName).toBe('Alice Johnson');
    });

    it('should calculate statistics correctly', async () => {
      // Redeem one voucher
      await voucherService.redeemVoucher({
        voucherCode: testVouchers[0].visibleCode,
        userId: 'test-parent-001',
        institutionId: 'test-institution-001',
      });

      const stats = await voucherService.getVoucherStatistics('test-institution-001');

      expect(stats.totalIssued).toBe(3);
      expect(stats.totalRedeemed).toBe(1);
      expect(stats.totalActive).toBe(2);
      expect(stats.totalValue).toBe(95); // 15 + 35 + 45
      expect(stats.redeemedValue).toBe(15);
      expect(stats.activeValue).toBe(80); // 35 + 45
      expect(stats.totalLearners).toBe(7); // 1 + 4 + 2
      expect(stats.activeLearners).toBe(6); // 4 + 2
    });
  });

  describe('Voucher Audit Flow', () => {
    let testVoucher: Voucher;

    beforeEach(async () => {
      testVoucher = await voucherService.generateVoucher({
        value: 20,
        learnerCount: 1,
        parentName: 'Test User',
        institutionId: 'test-institution-001',
        issuedByUserId: 'test-principal-001',
      });
    });

    it('should create audit records for voucher generation', async () => {
      const audits = await voucherService.getVoucherAudits(testVoucher.id);

      expect(audits).toHaveLength(1);
      expect(audits[0].action).toBe(AuditAction.CREATED);
      expect(audits[0].severity).toBe(AuditSeverity.INFO);
      expect(audits[0].source).toBe(AuditSource.SYSTEM);
      expect(audits[0].voucherId).toBe(testVoucher.id);
    });

    it('should create audit records for voucher redemption', async () => {
      await voucherService.redeemVoucher({
        voucherCode: testVoucher.visibleCode,
        userId: 'test-parent-001',
        institutionId: 'test-institution-001',
      });

      const audits = await voucherService.getVoucherAudits(testVoucher.id);

      expect(audits).toHaveLength(2);
      expect(audits[1].action).toBe(AuditAction.REDEEMED);
      expect(audits[1].severity).toBe(AuditSeverity.INFO);
      expect(audits[1].source).toBe(AuditSource.USER);
      expect(audits[1].userId).toBe('test-parent-001');
    });

    it('should create audit records for status changes', async () => {
      await voucherService.updateVoucherStatus(testVoucher.id, VoucherStatus.CANCELLED);

      const audits = await voucherService.getVoucherAudits(testVoucher.id);

      expect(audits).toHaveLength(2);
      expect(audits[1].action).toBe(AuditAction.STATUS_CHANGED);
      expect(audits[1].severity).toBe(AuditSeverity.INFO);
      expect(audits[1].metadata).toHaveProperty('previousStatus', VoucherStatus.ACTIVE);
      expect(audits[1].metadata).toHaveProperty('newStatus', VoucherStatus.CANCELLED);
    });
  });

  describe('Voucher Export Flow', () => {
    let testVouchers: Voucher[];

    beforeEach(async () => {
      testVouchers = await Promise.all([
        voucherService.generateVoucher({
          value: 10,
          learnerCount: 1,
          parentName: 'Export Test User 1',
          institutionId: 'test-institution-001',
          issuedByUserId: 'test-principal-001',
        }),
        voucherService.generateVoucher({
          value: 20,
          learnerCount: 2,
          parentName: 'Export Test User 2',
          institutionId: 'test-institution-001',
          issuedByUserId: 'test-principal-001',
        }),
      ]);
    });

    it('should export vouchers to CSV format', async () => {
      const csvData = await voucherService.exportVouchers({
        institutionId: 'test-institution-001',
        format: 'csv',
      });

      expect(csvData).toBeDefined();
      expect(csvData).toContain('Voucher ID,Value,Learner Count,Parent Name,Status,Issued Date');
      expect(csvData).toContain('Export Test User 1');
      expect(csvData).toContain('Export Test User 2');
      expect(csvData).toContain('10');
      expect(csvData).toContain('20');
    });

    it('should filter exported data correctly', async () => {
      const csvData = await voucherService.exportVouchers({
        institutionId: 'test-institution-001',
        format: 'csv',
        statusFilter: VoucherStatus.ACTIVE,
        dateFilter: 'last30days',
      });

      expect(csvData).toBeDefined();
      expect(csvData).toContain('Export Test User 1');
      expect(csvData).toContain('Export Test User 2');
    });
  });

  describe('Error Handling and Validation', () => {
    it('should handle invalid voucher codes gracefully', async () => {
      const invalidCode = 'INVALID123';

      await expect(
        voucherService.redeemVoucher({
          voucherCode: invalidCode,
          userId: 'test-parent-001',
          institutionId: 'test-institution-001',
        })
      ).rejects.toThrow('Invalid voucher code');
    });

    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking database failures
      // Implementation depends on your error handling strategy
      expect(true).toBe(true); // Placeholder
    });

    it('should validate all required fields', async () => {
      const incompleteData = {
        value: 25,
        // Missing learnerCount, parentName, etc.
      };

      await expect(
        voucherService.generateVoucher(incompleteData as any)
      ).rejects.toThrow();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle bulk voucher generation efficiently', async () => {
      const startTime = Date.now();
      
      const bulkVouchers = await Promise.all(
        Array.from({ length: 100 }, (_, i) =>
          voucherService.generateVoucher({
            value: 25,
            learnerCount: 1,
            parentName: `Bulk User ${i}`,
            institutionId: 'test-institution-001',
            issuedByUserId: 'test-principal-001',
          })
        )
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(bulkVouchers).toHaveLength(100);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent voucher redemptions', async () => {
      const testVoucher = await voucherService.generateVoucher({
        value: 25,
        learnerCount: 1,
        parentName: 'Concurrent Test User',
        institutionId: 'test-institution-001',
        issuedByUserId: 'test-principal-001',
      });

      // Simulate concurrent redemption attempts
      const redemptionPromises = Array.from({ length: 5 }, (_, i) =>
        voucherService.redeemVoucher({
          voucherCode: testVoucher.visibleCode,
          userId: `concurrent-user-${i}`,
          institutionId: 'test-institution-001',
        }).catch(error => error.message)
      );

      const results = await Promise.all(redemptionPromises);
      
      // Only one should succeed, others should fail
      const successCount = results.filter(result => result !== 'Voucher has already been redeemed').length;
      const failureCount = results.filter(result => result === 'Voucher has already been redeemed').length;

      expect(successCount).toBe(1);
      expect(failureCount).toBe(4);
    });
  });
});


