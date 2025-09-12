import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Voucher } from '../entities/voucher.entity';
import { VoucherStatus } from '../entities/voucher.entity';
import { VoucherExportDto } from '../dto/voucher.dto';

@Injectable()
export class VoucherExportService {
  private readonly logger = new Logger(VoucherExportService.name);

  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
  ) {}

  /**
   * Export vouchers to CSV format
   */
  async exportVouchersToCSV(filters: VoucherExportDto): Promise<{
    csvData: string;
    filename: string;
    recordCount: number;
  }> {
    try {
      this.logger.log(`Starting voucher export with filters: ${JSON.stringify(filters)}`);

      // Build query with filters
      const queryBuilder = this.buildExportQuery(filters);
      
      // Get vouchers
      const vouchers = await queryBuilder.getMany();
      
      if (vouchers.length === 0) {
        this.logger.warn('No vouchers found for export');
        return {
          csvData: this.generateEmptyCSV(),
          filename: this.generateFilename(filters),
          recordCount: 0
        };
      }

      // Generate CSV data
      const csvData = this.generateCSVData(vouchers);
      
      // Generate filename
      const filename = this.generateFilename(filters);
      
      this.logger.log(`Successfully exported ${vouchers.length} vouchers to CSV`);
      
      return {
        csvData,
        filename,
        recordCount: vouchers.length
      };
    } catch (error) {
      this.logger.error(`Error exporting vouchers to CSV: ${error.message}`, error.stack);
      throw new Error('Failed to export vouchers to CSV');
    }
  }

  /**
   * Export vouchers to Excel format (placeholder for future implementation)
   */
  async exportVouchersToExcel(filters: VoucherExportDto): Promise<{
    excelData: Buffer;
    filename: string;
    recordCount: number;
  }> {
    try {
      this.logger.log(`Starting voucher export to Excel with filters: ${JSON.stringify(filters)}`);

      // For now, return a placeholder
      // TODO: Implement Excel export using a library like 'exceljs' or 'xlsx'
      throw new Error('Excel export not yet implemented');
    } catch (error) {
      this.logger.error(`Error exporting vouchers to Excel: ${error.message}`, error.stack);
      throw new Error('Failed to export vouchers to Excel');
    }
  }

  /**
   * Build export query with filters
   */
  private buildExportQuery(filters: VoucherExportDto): SelectQueryBuilder<Voucher> {
    try {
      const queryBuilder = this.voucherRepository
        .createQueryBuilder('voucher')
        .leftJoinAndSelect('voucher.institution', 'institution')
        .leftJoinAndSelect('voucher.issuedBy', 'issuedBy')
        .leftJoinAndSelect('voucher.redeemedBy', 'redeemedBy')
        .orderBy('voucher.createdAt', 'DESC');

      // Apply filters
      this.applyExportFilters(queryBuilder, filters);

      return queryBuilder;
    } catch (error) {
      this.logger.error(`Error building export query: ${error.message}`, error.stack);
      throw new Error('Failed to build export query');
    }
  }

  /**
   * Apply filters to export query
   */
  private applyExportFilters(
    queryBuilder: SelectQueryBuilder<Voucher>, 
    filters: VoucherExportDto
  ): void {
    try {
      // Status filter
      if (filters.status && filters.status !== 'all') {
        queryBuilder.andWhere('voucher.status = :status', { status: filters.status });
      }

      // Date filter
      if (filters.dateFilter) {
        const dateRange = this.getDateRange(filters.dateFilter);
        if (dateRange.start && dateRange.end) {
          queryBuilder.andWhere('voucher.createdAt BETWEEN :startDate AND :endDate', {
            startDate: dateRange.start,
            endDate: dateRange.end
          });
        }
      }

      // Search filter
      if (filters.search) {
        queryBuilder.andWhere(
          '(voucher.code LIKE :search OR voucher.parentName LIKE :search OR voucher.notes LIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      // Institution filter
      if (filters.institutionId) {
        queryBuilder.andWhere('voucher.institutionId = :institutionId', {
          institutionId: filters.institutionId
        });
      }

      // Value range filter
      if (filters.minValue !== undefined) {
        queryBuilder.andWhere('voucher.valueCents >= :minValue', {
          minValue: filters.minValue * 100 // Convert to cents
        });
      }

      if (filters.maxValue !== undefined) {
        queryBuilder.andWhere('voucher.valueCents <= :maxValue', {
          maxValue: filters.maxValue * 100 // Convert to cents
        });
      }

      // Learner count filter
      if (filters.learnerCount !== undefined) {
        queryBuilder.andWhere('voucher.learnerCount = :learnerCount', {
          learnerCount: filters.learnerCount
        });
      }

      // Issued by filter
      if (filters.issuedByUserId) {
        queryBuilder.andWhere('voucher.issuedByUserId = :issuedByUserId', {
          issuedByUserId: filters.issuedByUserId
        });
      }

      // Date range filter
      if (filters.startDate && filters.endDate) {
        queryBuilder.andWhere('voucher.createdAt BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate
        });
      }
    } catch (error) {
      this.logger.error(`Error applying export filters: ${error.message}`, error.stack);
      throw new Error('Failed to apply export filters');
    }
  }

  /**
   * Generate CSV data from vouchers
   */
  private generateCSVData(vouchers: Voucher[]): string {
    try {
      // Define CSV headers
      const headers = [
        'Voucher ID',
        'Code',
        'Value (R)',
        'Learner Count',
        'Parent/Guardian Name',
        'Status',
        'Institution',
        'Issued By',
        'Issued Date',
        'Redeemed By',
        'Redeemed Date',
        'Expiry Date',
        'Notes',
        'Created At',
        'Updated At'
      ];

      // Generate CSV rows
      const rows = vouchers.map(voucher => [
        voucher.id,
        voucher.code,
        voucher.value,
        voucher.learnerCount,
        voucher.parentName,
        voucher.status,
        voucher.institution?.name || 'N/A',
        voucher.issuedBy ? `${voucher.issuedBy.firstName} ${voucher.issuedBy.lastName}` : 'N/A',
        voucher.issuedDate ? voucher.issuedDate.toISOString() : 'N/A',
        voucher.redeemedBy ? `${voucher.redeemedBy.firstName} ${voucher.redeemedBy.lastName}` : 'N/A',
        voucher.redeemedDate ? voucher.redeemedDate.toISOString() : 'N/A',
        voucher.expiryDate ? voucher.expiryDate.toISOString() : 'N/A',
        voucher.notes || 'N/A',
        voucher.createdAt.toISOString(),
        voucher.updatedAt.toISOString()
      ]);

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => this.escapeCSVField(field)))
        .map(row => row.join(','))
        .join('\n');

      return csvContent;
    } catch (error) {
      this.logger.error(`Error generating CSV data: ${error.message}`, error.stack);
      throw new Error('Failed to generate CSV data');
    }
  }

  /**
   * Generate empty CSV with headers
   */
  private generateEmptyCSV(): string {
    const headers = [
      'Voucher ID',
      'Code',
      'Value (R)',
      'Learner Count',
      'Parent/Guardian Name',
      'Status',
      'Institution',
      'Issued By',
      'Issued Date',
      'Redeemed By',
      'Redeemed Date',
      'Expiry Date',
      'Notes',
      'Created At',
      'Updated At'
    ];

    return headers.join(',') + '\n';
  }

  /**
   * Escape CSV field values
   */
  private escapeCSVField(field: any): string {
    if (field === null || field === undefined) {
      return '';
    }

    const stringField = String(field);
    
    // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    
    return stringField;
  }

  /**
   * Generate filename for export
   */
  private generateFilename(filters: VoucherExportDto): string {
    try {
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      let filename = `vouchers_export_${timestamp}`;

      // Add filters to filename
      if (filters.status && filters.status !== 'all') {
        filename += `_${filters.status}`;
      }

      if (filters.dateFilter) {
        filename += `_${filters.dateFilter}`;
      }

      if (filters.search) {
        const searchSnippet = filters.search.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
        filename += `_search_${searchSnippet}`;
      }

      filename += '.csv';

      return filename;
    } catch (error) {
      this.logger.error(`Error generating filename: ${error.message}`, error.stack);
      return `vouchers_export_${new Date().toISOString().split('T')[0]}.csv`;
    }
  }

  /**
   * Get date range based on filter
   */
  private getDateRange(dateFilter: string): { start: Date | null; end: Date | null } {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (dateFilter) {
        case 'today':
          return {
            start: today,
            end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
          };

        case 'this_week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          return {
            start: weekStart,
            end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
          };

        case 'this_month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          return {
            start: monthStart,
            end: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999)
          };

        case 'last_month':
          const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
          return {
            start: lastMonthStart,
            end: lastMonthEnd
          };

        case 'last_30_days':
          return {
            start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            end: now
          };

        case 'last_90_days':
          return {
            start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
            end: now
          };

        default:
          return { start: null, end: null };
      }
    } catch (error) {
      this.logger.error(`Error getting date range: ${error.message}`, error.stack);
      return { start: null, end: null };
    }
  }

  /**
   * Get export statistics
   */
  async getExportStats(filters: VoucherExportDto): Promise<{
    totalRecords: number;
    filteredRecords: number;
    statusBreakdown: Record<string, number>;
    valueBreakdown: Record<string, number>;
    dateRange: { start: Date | null; end: Date | null };
  }> {
    try {
      // Get total records
      const totalRecords = await this.voucherRepository.count();

      // Get filtered records
      const queryBuilder = this.buildExportQuery(filters);
      const filteredRecords = await queryBuilder.getCount();

      // Get status breakdown
      const statusBreakdown = await this.getStatusBreakdown(filters);

      // Get value breakdown
      const valueBreakdown = await this.getValueBreakdown(filters);

      // Get date range
      const dateRange = this.getDateRange(filters.dateFilter || '');

      return {
        totalRecords,
        filteredRecords,
        statusBreakdown,
        valueBreakdown,
        dateRange
      };
    } catch (error) {
      this.logger.error(`Error getting export stats: ${error.message}`, error.stack);
      throw new Error('Failed to get export statistics');
    }
  }

  /**
   * Get status breakdown for export
   */
  private async getStatusBreakdown(filters: VoucherExportDto): Promise<Record<string, number>> {
    try {
      const queryBuilder = this.voucherRepository
        .createQueryBuilder('voucher')
        .select('voucher.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('voucher.status');

      // Apply filters (excluding status filter for breakdown)
      const filtersForBreakdown = { ...filters, status: undefined };
      this.applyExportFilters(queryBuilder, filtersForBreakdown);

      const results = await queryBuilder.getRawMany();

      const breakdown: Record<string, number> = {};
      results.forEach(result => {
        breakdown[result.status] = parseInt(result.count);
      });

      return breakdown;
    } catch (error) {
      this.logger.error(`Error getting status breakdown: ${error.message}`, error.stack);
      return {};
    }
  }

  /**
   * Get value breakdown for export
   */
  private async getValueBreakdown(filters: VoucherExportDto): Promise<Record<string, number>> {
    try {
      const queryBuilder = this.voucherRepository
        .createQueryBuilder('voucher')
        .select('voucher.valueCents', 'valueCents')
        .addSelect('COUNT(*)', 'count')
        .groupBy('voucher.valueCents');

      // Apply filters
      this.applyExportFilters(queryBuilder, filters);

      const results = await queryBuilder.getRawMany();

      const breakdown: Record<string, number> = {};
      results.forEach(result => {
        const value = result.valueCents / 100; // Convert from cents to Rand
        breakdown[`R${value}`] = parseInt(result.count);
      });

      return breakdown;
    } catch (error) {
      this.logger.error(`Error getting value breakdown: ${error.message}`, error.stack);
      return {};
    }
  }

  /**
   * Validate export filters
   */
  validateExportFilters(filters: VoucherExportDto): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Validate status
      if (filters.status && !Object.values(VoucherStatus).includes(filters.status as VoucherStatus)) {
        errors.push(`Invalid status: ${filters.status}`);
      }

      // Validate date filter
      if (filters.dateFilter && !['today', 'this_week', 'this_month', 'last_month', 'last_30_days', 'last_90_days'].includes(filters.dateFilter)) {
        errors.push(`Invalid date filter: ${filters.dateFilter}`);
      }

      // Validate search length
      if (filters.search && filters.search.length > 100) {
        errors.push('Search term cannot exceed 100 characters');
      }

      // Validate value range
      if (filters.minValue !== undefined && (filters.minValue < 0 || filters.minValue > 100)) {
        errors.push('Minimum value must be between 0 and 100');
      }

      if (filters.maxValue !== undefined && (filters.maxValue < 0 || filters.maxValue > 100)) {
        errors.push('Maximum value must be between 0 and 100');
      }

      if (filters.minValue !== undefined && filters.maxValue !== undefined && filters.minValue > filters.maxValue) {
        errors.push('Minimum value cannot be greater than maximum value');
      }

      // Validate learner count
      if (filters.learnerCount !== undefined && (filters.learnerCount < 1 || filters.learnerCount > 10)) {
        errors.push('Learner count must be between 1 and 10');
      }

      // Validate date range
      if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
        errors.push('Start date cannot be after end date');
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
}


