'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

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

  const handleDemoLogin = async () => {
    setEmail('rahul@rknec.edu');
    setPassword('demo123');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
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
          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600 mb-3 text-center">Demo Accounts:</p>
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={handleDemoLogin}
            >
              <span className="font-mono text-xs mr-2">rahul@rknec.edu / demo123</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={() => {
                setEmail('priya@rknec.edu');
                setPassword('demo123');
              }}
            >
              <span className="font-mono text-xs mr-2">priya@rknec.edu / demo123</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={() => {
                setEmail('admin@rknec.edu');
                setPassword('demo123');
              }}
            >
              <span className="font-mono text-xs mr-2">admin@rknec.edu / demo123 (Admin)</span>
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{' '}
          <a href="/signup" className="text-orange-500 hover:underline font-medium">
            Sign up
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
