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
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
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
  }, [mounted, isLoading, isAuthenticated, user?.id]);

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
        body: JSON.stringify({
          userId: user?.id,
          ...formData,
        }),
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
      alert(error.message || 'Failed to update profile');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">
              Manage your account information and view your activity
            </p>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Account Information</CardTitle>
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
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
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
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <User className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{profileData?.name || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Mail className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{profileData?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Phone className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{profileData?.phone || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">
                        {profileData?.createdAt
                          ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold text-gray-900">
                    {profileData?.items?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Items Posted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/my-items')}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                View My Items
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? 'Deleting Account...' : 'Delete Account'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
