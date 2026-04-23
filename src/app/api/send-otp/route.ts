import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateOTP, setOTP, isOTPExpired, cleanupExpiredOTP, getOTPData, normalizeEmail } from '@/lib/otpStore';
import { validateCollegeEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    const normalizedEmail = normalizeEmail(email || '');

    // Validate email
    if (!normalizedEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate college email domain
    if (!validateCollegeEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Only @rknec.edu email addresses are allowed' },
        { status: 400 }
      );
    }

    // Clean up expired OTP if exists
    cleanupExpiredOTP(normalizedEmail);

    // Check if there's a recent OTP (prevent spam, wait 1 minute)
    const existingOtp = getOTPData(normalizedEmail);
    if (existingOtp && !isOTPExpired(normalizedEmail)) {
      const timeLeft = Math.ceil((existingOtp.expiresAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Please wait before requesting another OTP. Expires in ${timeLeft} seconds.` },
        { status: 429 }
      );
    }

    // Generate new OTP
    const otp = generateOTP();
    setOTP(normalizedEmail, otp, 5); // 5 minutes expiry

    // Create transporter (using environment variables)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your_email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your_app_password',
      },
    });

    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'College Freecycling Market <noreply@rknec.edu>',
        to: normalizedEmail,
        subject: 'Verify Your Email - College Freecycling Market',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #f97316; margin-bottom: 20px;">Verify Your Email Address</h2>
            <p>Hello,</p>
            <p>Thank you for signing up for the College Freecycling Market!</p>
            <p>Your One-Time Password (OTP) is:</p>
            <div style="background-color: #f97316; color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; border-radius: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p><strong>This OTP will expire in 5 minutes.</strong></p>
            <p>If you didn't request this code, please ignore this email.</p>
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `,
        text: `Your OTP is: ${otp}\n\nThis OTP will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this email.`,
      });

      return NextResponse.json(
        { success: true, message: 'OTP sent successfully to your email' },
        { status: 200 }
      );
    } catch (emailError: any) {
      console.error('Email sending error:', emailError);

      return NextResponse.json(
        { error: 'Failed to send OTP email. Please check your email configuration or try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
