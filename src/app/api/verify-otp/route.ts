import { NextRequest, NextResponse } from 'next/server';
import { isOTPExpired, cleanupExpiredOTP, getOTPData, normalizeEmail } from '@/lib/otpStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;
    const normalizedEmail = normalizeEmail(email || '');

    // Validate inputs
    if (!normalizedEmail || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Convert OTP to number if it's a string
    const otpNumber = typeof otp === 'string' ? parseInt(otp, 10) : otp;

    if (isNaN(otpNumber)) {
      return NextResponse.json(
        { error: 'Invalid OTP format' },
        { status: 400 }
      );
    }

    // Check if OTP exists and is valid
    const otpData = getOTPData(normalizedEmail);
    if (!otpData) {
      return NextResponse.json(
        { error: 'No OTP found for this email. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (isOTPExpired(normalizedEmail)) {
      cleanupExpiredOTP(normalizedEmail);
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpData.otp === otpNumber) {
      // Keep the OTP until signup completes, but mark it verified.
      otpData.verified = true;
      return NextResponse.json(
        { success: true, message: 'OTP verified successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
