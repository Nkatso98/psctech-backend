import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voucher } from '../entities/voucher.entity';
import * as crypto from 'crypto';

@Injectable()
export class VoucherCodeGenerator {
  private readonly logger = new Logger(VoucherCodeGenerator.name);
  
  // Characters for voucher codes (excluding I, O, 1, 0 for clarity)
  private readonly CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  private readonly CODE_LENGTH = 16;
  private readonly MAX_ATTEMPTS = 100;

  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
  ) {}

  /**
   * Generate a unique voucher code
   */
  async generateUniqueCode(): Promise<string> {
    let attempts = 0;
    let code: string;
    let isUnique = false;

    while (!isUnique && attempts < this.MAX_ATTEMPTS) {
      code = this.generateRandomCode();
      
      try {
        // Check if code already exists
        const existingVoucher = await this.voucherRepository.findOne({
          where: { code }
        });

        if (!existingVoucher) {
          isUnique = true;
        } else {
          attempts++;
          this.logger.debug(`Generated duplicate code, attempt ${attempts}`);
        }
      } catch (error) {
        this.logger.error(`Error checking code uniqueness: ${error.message}`, error.stack);
        attempts++;
      }
    }

    if (!isUnique) {
      this.logger.error(`Failed to generate unique code after ${this.MAX_ATTEMPTS} attempts`);
      throw new Error('Unable to generate unique voucher code');
    }

    this.logger.log(`Generated unique voucher code: ${code} in ${attempts + 1} attempts`);
    return code!;
  }

  /**
   * Generate a random voucher code
   */
  private generateRandomCode(): string {
    let code = '';
    
    // Generate 16 random characters
    for (let i = 0; i < this.CODE_LENGTH; i++) {
      const randomIndex = crypto.randomInt(0, this.CHARS.length);
      code += this.CHARS[randomIndex];
    }

    // Format as XXXX-XXXX-XXXX-XXXX
    return this.formatCode(code);
  }

  /**
   * Format raw code into XXXX-XXXX-XXXX-XXXX format
   */
  private formatCode(rawCode: string): string {
    const groups = [];
    for (let i = 0; i < rawCode.length; i += 4) {
      groups.push(rawCode.slice(i, i + 4));
    }
    return groups.join('-');
  }

  /**
   * Hash a voucher code for secure storage
   */
  async hashCode(code: string): Promise<Buffer> {
    try {
      // Remove hyphens for hashing
      const cleanCode = code.replace(/-/g, '');
      
      // Generate SHA-256 hash
      const hash = crypto.createHash('sha256');
      hash.update(cleanCode);
      
      return hash.digest();
    } catch (error) {
      this.logger.error(`Error hashing voucher code: ${error.message}`, error.stack);
      throw new Error('Failed to hash voucher code');
    }
  }

  /**
   * Generate a random salt for additional security
   */
  async generateSalt(): Promise<Buffer> {
    try {
      // Generate 16 random bytes
      return crypto.randomBytes(16);
    } catch (error) {
      this.logger.error(`Error generating salt: ${error.message}`, error.stack);
      throw new Error('Failed to generate salt');
    }
  }

  /**
   * Validate voucher code format
   */
  validateCodeFormat(code: string): boolean {
    try {
      // Check if code matches XXXX-XXXX-XXXX-XXXX format
      const codeRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
      
      if (!codeRegex.test(code)) {
        return false;
      }

      // Check if code contains only allowed characters
      const cleanCode = code.replace(/-/g, '');
      const allowedCharsRegex = /^[A-Z0-9]+$/;
      
      if (!allowedCharsRegex.test(cleanCode)) {
        return false;
      }

      // Check if code is exactly 16 characters (excluding hyphens)
      if (cleanCode.length !== this.CODE_LENGTH) {
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error validating code format: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Generate a human-readable code from hash (for display purposes)
   */
  generateDisplayCode(hash: Buffer): string {
    try {
      // Use first 8 bytes of hash to generate a shorter display code
      const displayHash = hash.slice(0, 8);
      const displayCode = displayHash.toString('hex').toUpperCase();
      
      // Format as XXXX-XXXX
      return `${displayCode.slice(0, 4)}-${displayCode.slice(4, 8)}`;
    } catch (error) {
      this.logger.error(`Error generating display code: ${error.message}`, error.stack);
      return 'XXXX-XXXX';
    }
  }

  /**
   * Verify a voucher code against its hash
   */
  async verifyCode(code: string, hash: Buffer): Promise<boolean> {
    try {
      const computedHash = await this.hashCode(code);
      return computedHash.equals(hash);
    } catch (error) {
      this.logger.error(`Error verifying voucher code: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Generate a batch of unique codes
   */
  async generateBatchCodes(count: number): Promise<string[]> {
    const codes: string[] = [];
    const maxBatchAttempts = count * 2; // Allow some duplicates
    let attempts = 0;

    while (codes.length < count && attempts < maxBatchAttempts) {
      try {
        const code = await this.generateUniqueCode();
        if (!codes.includes(code)) {
          codes.push(code);
        }
        attempts++;
      } catch (error) {
        this.logger.error(`Error generating batch code: ${error.message}`, error.stack);
        attempts++;
      }
    }

    if (codes.length < count) {
      this.logger.warn(`Generated only ${codes.length} unique codes out of requested ${count}`);
    }

    return codes;
  }

  /**
   * Check code complexity and strength
   */
  analyzeCodeStrength(code: string): {
    score: number;
    feedback: string[];
    recommendations: string[];
  } {
    const feedback: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    try {
      const cleanCode = code.replace(/-/g, '');

      // Check length
      if (cleanCode.length < 16) {
        score -= 20;
        feedback.push('Code is shorter than recommended length');
        recommendations.push('Use 16-character codes for better security');
      }

      // Check character variety
      const uniqueChars = new Set(cleanCode).size;
      if (uniqueChars < 20) {
        score -= 15;
        feedback.push('Limited character variety');
        recommendations.push('Ensure good character distribution');
      }

      // Check for patterns
      if (this.hasRepeatingPatterns(cleanCode)) {
        score -= 25;
        feedback.push('Detected repeating patterns');
        recommendations.push('Avoid predictable patterns');
      }

      // Check for sequential characters
      if (this.hasSequentialChars(cleanCode)) {
        score -= 20;
        feedback.push('Detected sequential characters');
        recommendations.push('Avoid sequential patterns');
      }

      // Final score adjustments
      if (score < 50) {
        recommendations.push('Consider regenerating code for better security');
      } else if (score < 80) {
        recommendations.push('Code meets basic security requirements');
      } else {
        feedback.push('Code meets high security standards');
      }

      return {
        score: Math.max(0, score),
        feedback,
        recommendations
      };
    } catch (error) {
      this.logger.error(`Error analyzing code strength: ${error.message}`, error.stack);
      return {
        score: 0,
        feedback: ['Error analyzing code'],
        recommendations: ['Unable to provide recommendations']
      };
    }
  }

  /**
   * Check for repeating patterns in code
   */
  private hasRepeatingPatterns(code: string): boolean {
    for (let patternLength = 2; patternLength <= 4; patternLength++) {
      for (let i = 0; i <= code.length - patternLength * 2; i++) {
        const pattern = code.slice(i, i + patternLength);
        const remaining = code.slice(i + patternLength);
        if (remaining.includes(pattern)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check for sequential characters
   */
  private hasSequentialChars(code: string): boolean {
    for (let i = 0; i < code.length - 2; i++) {
      const char1 = this.CHARS.indexOf(code[i]);
      const char2 = this.CHARS.indexOf(code[i + 1]);
      const char3 = this.CHARS.indexOf(code[i + 2]);
      
      if (char1 !== -1 && char2 !== -1 && char3 !== -1) {
        if ((char2 === char1 + 1 && char3 === char2 + 1) ||
            (char2 === char1 - 1 && char3 === char2 - 1)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Generate a secure random number within range
   */
  private secureRandomInt(min: number, max: number): number {
    const range = max - min;
    const bytes = crypto.randomBytes(4);
    const value = bytes.readUInt32BE(0);
    return min + (value % range);
  }
}


