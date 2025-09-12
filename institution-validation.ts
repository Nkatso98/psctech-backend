import { z } from 'zod';

// Institution registration validation schema
export const institutionRegistrationSchema = z.object({
  schoolName: z.string()
    .min(1, "School name is required")
    .max(255, "School name cannot exceed 255 characters"),
  
  principalName: z.string()
    .min(1, "Principal name is required")
    .max(255, "Principal name cannot exceed 255 characters"),
  
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(255, "Email cannot exceed 255 characters"),
  
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, "Invalid phone number format")
    .max(20, "Phone number cannot exceed 20 characters"),
  
  address: z.string()
    .min(1, "Address is required")
    .max(500, "Address cannot exceed 500 characters"),
  
  schoolType: z.enum([
    "Primary School",
    "Secondary School", 
    "University",
    "College",
    "Technical Institute",
    "Vocational School"
  ], {
    errorMap: () => ({ message: "Please select a valid school type" })
  }),
  
  username: z.string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters")
});

export type InstitutionRegistrationFormData = z.infer<typeof institutionRegistrationSchema>;

// Validation function
export const validateInstitutionRegistration = (data: unknown) => {
  return institutionRegistrationSchema.safeParse(data);
};









