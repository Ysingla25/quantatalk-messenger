import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '@/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Basic validation
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Password strength validation
    if (trimmedPassword.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const user = userCredential.user;

      // Update user profile with name
      await updateProfile(user, {
        displayName: trimmedName,
      });

      // Store additional user data in Firestore
      const usersCollection = collection(db, 'users');
      const userDocRef = doc(usersCollection, user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        name: trimmedName,
        email: trimmedEmail,
        createdAt: new Date(),
        lastActive: new Date()
      });

      toast({
        title: "Account created successfully",
        description: "Welcome to QuantaTalk!",
      });
      
      // Navigate to chat page
      navigate('/chat');
    } catch (error: any) {
      console.error('Error during signup:', error);
      // Only show error toast if there was an actual error
      if (error.code) {
        let errorMessage = "An error occurred while creating your account";
        
        // Handle specific Firebase errors
        if (error.code === 'auth/invalid-email') {
          errorMessage = "Please enter a valid email address";
        } else if (error.code === 'auth/weak-password') {
          errorMessage = "Password must be at least 6 characters long";
        } else if (error.code === 'auth/email-already-in-use') {
          errorMessage = "This email is already registered";
        }

        toast({
          title: "Error creating account",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout className="flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-lg glass-effect p-8 rounded-lg animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-6 text-gradient">Join QuantaTalk</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary/50 border-secondary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary/50 border-secondary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary/50 border-secondary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-secondary/50 border-secondary"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account? <Link to="/sign-in" className="text-primary hover:underline">Sign In</Link>
            </p>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default SignUp;
