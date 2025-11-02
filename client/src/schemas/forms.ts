import { z } from 'zod';

/**
 * Zod schemas and inferred types for forms
 */

// Basic phone number pattern (allows digits, spaces, +, -, parentheses)
const phonePattern = /^[0-9+\-\s()]{7,}$/;

export const GuestCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phoneNumber: z
    .string()
    .min(7, 'Phone number is too short')
    .regex(phonePattern, 'Invalid phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  // status may be provided, default will be set in the form where needed
  status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED']).optional(),
});

export const UserCreateSchema = z.object({
  firstname: z.string().min(1, 'First Name is required'),
  lastname: z.string().min(1, 'Last Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'user'], 'Role must be admin or user'),
});

export const GuestEditSchema = GuestCreateSchema.partial().extend({
  // No additional required fields for edit, but keep same validations for provided fields
});

export const UserEditSchema = z.object({
  firstname: z.string().min(1, 'First Name is required'),
  lastname: z.string().min(1, 'Last Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'user'], 'Role must be admin or user'),
});

// Export TS types inferred from the schemas
export type GuestCreateForm = z.infer<typeof GuestCreateSchema>;
export type UserCreateForm = z.infer<typeof UserCreateSchema>;
export type GuestEditForm = z.infer<typeof GuestEditSchema>;
export type UserEditForm = z.infer<typeof UserEditSchema>;