import { z } from 'zod';

// Study session validation schema
export const studySessionSchema = z.object({
  userId: z.string()
    .min(1, "User ID is required")
    .max(50, "User ID cannot exceed 50 characters"),
  
  institutionId: z.string()
    .max(50, "Institution ID cannot exceed 50 characters")
    .optional(),
  
  subject: z.string()
    .min(1, "Subject is required")
    .max(100, "Subject cannot exceed 100 characters"),
  
  topic: z.string()
    .max(200, "Topic cannot exceed 200 characters")
    .optional(),
  
  dayOfWeek: z.number()
    .min(0, "Day must be 0-6 (Sunday-Saturday)")
    .max(6, "Day must be 0-6 (Sunday-Saturday)"),
  
  startTime: z.string()
    .min(1, "Start time is required")
    .max(5, "Start time cannot exceed 5 characters")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  
  durationMinutes: z.number()
    .min(1, "Duration must be at least 1 minute")
    .max(1440, "Duration cannot exceed 24 hours"),
  
  reminderMinutesBefore: z.number()
    .min(0, "Reminder cannot be negative")
    .max(1440, "Reminder cannot exceed 24 hours")
    .default(15)
});

export type StudySessionFormData = z.infer<typeof studySessionSchema>;

// Validation function
export const validateStudySession = (data: unknown) => {
  return studySessionSchema.safeParse(data);
};









