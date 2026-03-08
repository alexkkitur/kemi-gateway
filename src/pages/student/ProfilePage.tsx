import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/use-data';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '');
      setPhone(profile.phone || '');
      setIdNumber(profile.id_number || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const error = await updateProfile({ full_name: name, phone, id_number: idNumber });
    setSaving(false);
    if (error) toast.error('Failed to update profile');
    else toast.success('Profile updated!');
  };

  if (loading) {
    return <DashboardLayout><div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-heading font-bold text-foreground">Profile</h1>

        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {name?.charAt(0) || '?'}
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-foreground">{name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="+254 7XX XXX XXX" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>ID Number</Label>
                <Input placeholder="National ID" value={idNumber} onChange={e => setIdNumber(e.target.value)} />
              </div>
            </div>
            <Button className="gradient-primary text-primary-foreground" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
