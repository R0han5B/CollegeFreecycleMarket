'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      toast({
        title: 'Login successful!',
        description: 'Welcome back!',
      });
      router.replace('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'Please check your credentials',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'rahul@rknec.edu', password: 'demo123' },
    { email: 'priya@rknec.edu', password: 'demo123' },
  ];

  return (
    <Card className="w-full max-w-md bg-white">
      <CardHeader className="space-y-4">
        <div className="section-badge w-fit">Member Access</div>
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-slate-900">Welcome back</CardTitle>
          <CardDescription className="text-base leading-7 text-slate-600">
            Sign in with your RKNEC account and continue browsing campus listings.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email (@rknec.edu only)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@rknec.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        <div className="rounded-[1.4rem] border border-slate-200 bg-orange-50 p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
            <ShieldCheck className="h-4 w-4 text-orange-500" />
            Demo accounts
          </p>
          <div className="space-y-2">
            {demoAccounts.map((account) => (
              <Button
                key={account.email}
                type="button"
                variant="outline"
                className="w-full justify-start rounded-2xl text-left text-sm"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
              >
                <span className="font-mono text-xs">
                  {account.email} / {account.password}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="font-semibold text-orange-600 hover:text-orange-700">
            Sign up
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
