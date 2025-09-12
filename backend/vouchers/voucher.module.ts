import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Controllers
import { VoucherController } from './voucher.controller';

// Services
import { VoucherService } from './voucher.service';

// Entities
import { Voucher } from './entities/voucher.entity';
import { VoucherRedemption } from './entities/voucher-redemption.entity';
import { VoucherAudit } from './entities/voucher-audit.entity';

// Utility Services
import { VoucherCodeGenerator } from './utils/voucher-code-generator';
import { VoucherExpiryService } from './utils/voucher-expiry.service';
import { VoucherValidationService } from './utils/voucher-validation.service';
import { VoucherExportService } from './utils/voucher-export.service';
import { VoucherNotificationService } from './utils/voucher-notification.service';

// DTOs
import { VoucherDto } from './dto/voucher.dto';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Voucher,
      VoucherRedemption,
      VoucherAudit
    ]),
    ScheduleModule.forRoot() // For cron jobs in VoucherExpiryService
  ],
  controllers: [VoucherController],
  providers: [
    VoucherService,
    VoucherCodeGenerator,
    VoucherExpiryService,
    VoucherValidationService,
    VoucherExportService,
    VoucherNotificationService
  ],
  exports: [
    VoucherService,
    VoucherCodeGenerator,
    VoucherExpiryService,
    VoucherValidationService,
    VoucherExportService,
    VoucherNotificationService
  ]
})
export class VoucherModule {}


