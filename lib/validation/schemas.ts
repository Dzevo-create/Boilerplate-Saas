/**
 * Validation Schemas
 * 
 * Zod schemas for validating API requests and form data.
 */

import { z } from 'zod';

// ===================================
// Auth Schemas
// ===================================

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ===================================
// Payment Schemas
// ===================================

export const checkoutSchema = z.object({
  planId: z.enum(['starter', 'pro', 'business']),
});

export const creditPurchaseSchema = z.object({
  packageId: z.string().min(1),
  credits: z.number().positive(),
});

// ===================================
// Profile Schemas
// ===================================

export const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

// ===================================
// Type Exports
// ===================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CreditPurchaseInput = z.infer<typeof creditPurchaseSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

