// Store for OTP codes (in-memory)
// For production, use Redis or database

interface OTPData {
  otp: number;
  expiresAt: number;
  verified: boolean;
}

declare global {
  var __otpStore: Record<string, OTPData> | undefined;
}

export const otpStore: Record<string, OTPData> = globalThis.__otpStore ?? {};

if (!globalThis.__otpStore) {
  globalThis.__otpStore = otpStore;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getOTPData(email: string): OTPData | undefined {
  return otpStore[normalizeEmail(email)];
}

export function deleteOTP(email: string): void {
  delete otpStore[normalizeEmail(email)];
}

// Helper to check if OTP is expired
export function isOTPExpired(email: string): boolean {
  const data = getOTPData(email);
  if (!data) return true;
  return Date.now() > data.expiresAt;
}

// Helper to clean up expired OTPs
export function cleanupExpiredOTP(email: string): void {
  if (isOTPExpired(email)) {
    deleteOTP(email);
  }
}

// Helper to generate OTP
export function generateOTP(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

// Helper to set OTP with 5 minute expiry
export function setOTP(email: string, otp: number, expiryMinutes: number = 5): void {
  otpStore[normalizeEmail(email)] = {
    otp,
    expiresAt: Date.now() + expiryMinutes * 60 * 1000,
    verified: false,
  };
}
