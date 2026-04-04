// Store for OTP codes (in-memory)
// For production, use Redis or database

interface OTPData {
  otp: number;
  expiresAt: number;
}

export const otpStore: Record<string, OTPData> = {};

// Helper to check if OTP is expired
export function isOTPExpired(email: string): boolean {
  const data = otpStore[email];
  if (!data) return true;
  return Date.now() > data.expiresAt;
}

// Helper to clean up expired OTPs
export function cleanupExpiredOTP(email: string): void {
  if (isOTPExpired(email)) {
    delete otpStore[email];
  }
}

// Helper to generate OTP
export function generateOTP(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

// Helper to set OTP with 5 minute expiry
export function setOTP(email: string, otp: number, expiryMinutes: number = 5): void {
  otpStore[email] = {
    otp,
    expiresAt: Date.now() + expiryMinutes * 60 * 1000
  };
}
