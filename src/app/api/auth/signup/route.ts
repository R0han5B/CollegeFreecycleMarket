import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, validateCollegeEmail } from '@/lib/auth';
import { otpStore, isOTPExpired, cleanupExpiredOTP } from '@/lib/otpStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone, otp } = body;

    // Validate required fields
    if (!email || !password || !otp) {
      return NextResponse.json(
        { error: 'Email, password, and OTP are required' },
        { status: 400 }
      );
    }

    // Validate email domain
    if (!validateCollegeEmail(email)) {
      return NextResponse.json(
        { error: 'Only @rknec.edu email addresses are allowed' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (!otpStore[email]) {
      return NextResponse.json(
        { error: 'No OTP found. Please request an OTP first.' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (isOTPExpired(email)) {
      cleanupExpiredOTP(email);
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Convert OTP to number and verify
    const otpNumber = typeof otp === 'string' ? parseInt(otp, 10) : otp;
    if (otpStore[email].otp !== otpNumber) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Clean up the verified OTP since user already exists
      delete otpStore[email];
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isAdmin: true,
        credits: true,
        createdAt: true,
      },
    });

    // Clean up the verified OTP
    delete otpStore[email];

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
