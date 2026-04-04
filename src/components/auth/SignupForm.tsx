'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle, Clock } from 'lucide-react';

export default function SignupForm() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    otp: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const validateEmail = (email: string) => {
    return email.endsWith('@rknec.edu');
  };

  const sendOTP = async () => {
    if (!formData.email) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter your email address first',
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      toast({
        variant: 'destructive',
        title: 'Invalid email',
        description: 'Only @rknec.edu email addresses are allowed',
      });
      return;
    }

    setIsSendingOTP(true);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      setCountdown(60); // 60 seconds countdown

      // Show OTP in development mode
      if (data.otp) {
        toast({
          title: 'OTP Sent (Development Mode)',
          description: `Your OTP is: ${data.otp}`,
        });
      } else {
        toast({
          title: 'OTP Sent',
          description: 'Please check your email for the verification code',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to send OTP',
        description: error.message || 'Please try again',
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  const verifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid OTP',
        description: 'Please enter a valid 6-digit OTP',
      });
      return;
    }

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      setOtpVerified(true);
      toast({
        title: 'Email Verified',
        description: 'Your email has been verified successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message || 'Please check your OTP and try again',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpVerified) {
      toast({
        variant: 'destructive',
        title: 'Email not verified',
        description: 'Please verify your email with OTP first',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Password too short',
        description: 'Password must be at least 6 characters',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          otp: formData.otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setUser(data.user);
      toast({
        title: 'Account created successfully!',
        description: 'Welcome to College Freecycling Market',
      });
      router.replace('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: error.message || 'Please try again',
      });
      // Reset OTP verification on error so user can try again
      setOtpVerified(false);
      setOtpSent(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
        <CardDescription className="text-center">
          Join the college freecycling community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">College Email (@rknec.edu)</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="your.email@rknec.edu"
                value={formData.email}
                onChange={handleChange}
                disabled={otpVerified}
                required
              />
              {!otpVerified && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={sendOTP}
                  disabled={isSendingOTP || countdown > 0 || !formData.email}
                  className="whitespace-nowrap"
                >
                  {isSendingOTP ? (
                    'Sending...'
                  ) : countdown > 0 ? (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {countdown}s
                    </span>
                  ) : otpSent ? (
                    'Resend'
                  ) : (
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Send OTP
                    </span>
                  )}
                </Button>
              )}
            </div>
            {otpVerified && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Email verified</span>
              </div>
            )}
          </div>

          {otpSent && !otpVerified && (
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <div className="flex gap-2">
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={6}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={verifyOTP}
                  disabled={!formData.otp || formData.otp.length !== 6}
                >
                  Verify
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                OTP sent to your email. Valid for 5 minutes.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={isLoading || !otpVerified}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-orange-500 hover:underline font-medium">
            Sign in
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
