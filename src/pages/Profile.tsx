
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import UserAvatar from '@/components/ui/UserAvatar';
import { useNavigate } from 'react-router-dom';
import { User, Key, LogOut, Upload, Shield } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

const Profile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('quantatalk-user');
    if (!userData) {
      navigate('/sign-in');
      return;
    }
    
    const parsedUser = JSON.parse(userData) as UserData;
    setUser(parsedUser);
    setName(parsedUser.name);
    setEmail(parsedUser.email);
  }, [navigate]);
  
  const handleSaveProfile = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (user) {
        const updatedUser = {
          ...user,
          name,
          email
        };
        
        localStorage.setItem('quantatalk-user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        toast({
          title: "Profile updated",
          description: "Your profile information has been updated successfully."
        });
      }
      
      setIsLoading(false);
    }, 1000);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('quantatalk-user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    });
    navigate('/');
  };
  
  if (!user) {
    return null; // Redirect happens in useEffect
  }

  return (
    <Layout className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground">Manage your account information and settings</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="glass-effect p-6 rounded-xl flex flex-col items-center">
              <UserAvatar name={user.name} imageSrc={user.avatar} size="lg" className="mb-4" />
              <h2 className="text-xl font-medium mb-1">{user.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
              
              <Button variant="outline" className="w-full mb-3" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              
              <Button variant="destructive" size="sm" onClick={handleLogout} className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="glass-effect p-6 rounded-xl mb-6">
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 mr-2 text-primary" />
                <h2 className="text-xl font-medium">Personal Information</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-secondary/50 border-secondary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary/50 border-secondary"
                  />
                </div>
                
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
            
            <div className="glass-effect p-6 rounded-xl mb-6">
              <div className="flex items-center mb-4">
                <Key className="h-5 w-5 mr-2 text-primary" />
                <h2 className="text-xl font-medium">Security</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Enter your current password"
                    className="bg-secondary/50 border-secondary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter a new password"
                    className="bg-secondary/50 border-secondary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your new password"
                    className="bg-secondary/50 border-secondary"
                  />
                </div>
                
                <Button variant="outline">
                  Change Password
                </Button>
              </div>
            </div>
            
            <div className="glass-effect p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                <h2 className="text-xl font-medium">Privacy</h2>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Control who can see your information and how your data is used.
              </p>
              
              <Button variant="outline">
                Privacy Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
