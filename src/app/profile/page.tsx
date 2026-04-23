'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Calendar, ShoppingBag, Trash2 } from 'lucide-react';
import type { User as UserType } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, setUser, logout, isLoading } = useAuthStore();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.id) {
      fetchProfile();
    }
  }, [mounted, isLoading, isAuthenticated, user?.id, router]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/profile?userId=${user?.id}`);
      const data = await response.json();
      if (response.ok) {
        setProfileData(data.user);
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, ...formData }),
      });

      const data = await response.json();
      if (response.ok) {
        setProfileData(data.user);
        setUser(data.user);
        setEditing(false);
      } else {
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message || 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    const confirmed = window.confirm(
      'Delete your account permanently? This will remove your profile, items, messages, payments, ratings, watchlist, and reports.'
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      logout();
      toast({
        title: 'Account deleted',
        description: 'Your account and related data have been removed.',
      });
      router.replace('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.message || 'Failed to delete account',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="page-loader" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="page-shell flex flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="page-loader" />
        </main>
        <Footer />
      </div>
    );
  }

  const statCount = profileData?.items?.length || 0;

  return (
    <div className="page-shell flex flex-col">
      <Header />

      <main className="flex-1 page-section">
        <div className="page-container max-w-5xl space-y-6">
          <div>
            <div className="section-badge mb-3">Account</div>
            <h1 className="section-title">My profile</h1>
            <p className="section-copy">Manage your account details, marketplace activity, and account actions.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="premium-card rounded-[2rem]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-slate-900">Account information</CardTitle>
                {!editing && (
                  <Button variant="outline" onClick={() => setEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {editing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            name: profileData?.name || '',
                            phone: profileData?.phone || '',
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { icon: User, label: 'Name', value: profileData?.name || 'Not set' },
                      { icon: Mail, label: 'Email', value: profileData?.email || 'N/A' },
                      { icon: Phone, label: 'Phone', value: profileData?.phone || 'Not set' },
                      {
                        icon: Calendar,
                        label: 'Member Since',
                        value: profileData?.createdAt
                          ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A',
                      },
                    ].map((field) => (
                      <div key={field.label} className="flex items-center gap-4 rounded-[1.4rem] border border-slate-200 bg-orange-50 p-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                          <field.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">{field.label}</p>
                          <p className="font-medium text-slate-900">{field.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="premium-card rounded-[2rem]">
                <CardHeader>
                  <CardTitle className="text-slate-900">Account statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-[1.4rem] border border-slate-200 bg-orange-50 p-6 text-center">
                    <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-orange-500" />
                    <p className="text-3xl font-bold text-slate-900">{statCount}</p>
                    <p className="mt-2 text-sm text-slate-600">Items Posted</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card rounded-[2rem]">
                <CardHeader>
                  <CardTitle className="text-slate-900">Account actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/my-items')}>
                    <ShoppingBag className="h-4 w-4" />
                    View My Items
                  </Button>
                  <Button variant="destructive" className="w-full justify-start" onClick={handleDeleteAccount} disabled={deleting}>
                    <Trash2 className="h-4 w-4" />
                    {deleting ? 'Deleting Account...' : 'Delete Account'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
