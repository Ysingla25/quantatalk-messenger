import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { auth, db } from '@/firebaseConfig';
import { updateProfile, updateEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User } from 'lucide-react';

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: displayName || user.displayName
      });

      // Update Firestore user document
      await setDoc(doc(db, 'users', user.uid), {
        displayName: displayName || user.displayName,
        bio,
        profileCompleted: true,
        lastActive: new Date()
      }, { merge: true });

      toast({
        title: 'Profile completed',
        description: 'Your profile has been successfully completed!'
      });

      // Navigate to chat
      navigate('/chat');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-lg glass-effect p-8 rounded-lg animate-fade-in">
        <div className="text-center mb-8">
          <User className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gradient">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Add some details to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="mt-2"
              rows={4}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Completing...' : 'Complete Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletion;