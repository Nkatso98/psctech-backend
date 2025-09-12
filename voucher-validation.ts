import { z } from 'zod';

// Create voucher validation schema
export const createVoucherSchema = z.object({
  denomination: z.number()
    .min(0.01, "Denomination must be greater than 0")
    .max(999999.99, "Denomination cannot exceed 999,999.99"),
  
  parentGuardianName: z.string()
    .min(1, "Parent/Guardian name is required")
    .max(255, "Parent/Guardian name cannot exceed 255 characters"),
  
  learnerCount: z.number()
    .min(1, "Learner count must be at least 1")
    .max(100, "Learner count cannot exceed 100"),
  
  institutionId: z.string()
    .min(1, "Institution ID is required")
    .max(50, "Institution ID cannot exceed 50 characters"),
  
  issuedByUserId: z.string()
    .min(1, "Issued by user ID is required")
    .max(50, "Issued by user ID cannot exceed 50 characters")
});

// Redeem voucher validation schema
export const redeemVoucherSchema = z.object({
  voucherCode: z.string()
    .min(1, "Voucher code is required")
    .max(50, "Voucher code cannot exceed 50 characters"),
  
  userId: z.string()
    .min(1, "User ID is required")
    .max(50, "User ID cannot exceed 50 characters"),
  
  parentGuardianName: z.string()
    .min(1, "Parent/Guardian name is required")
    .max(255, "Parent/Guardian name cannot exceed 255 characters"),
  
  learnerCount: z.number()
    .min(1, "Learner count must be at least 1")
    .max(100, "Learner count cannot exceed 100")
});

export type CreateVoucherFormData = z.infer<typeof createVoucherSchema>;
export type RedeemVoucherFormData = z.infer<typeof redeemVoucherSchema>;

// Validation functions
export const validateCreateVoucher = (data: unknown) => {
  return createVoucherSchema.safeParse(data);
};

export const validateRedeemVoucher = (data: unknown) => {
  return redeemVoucherSchema.safeParse(data);
};









