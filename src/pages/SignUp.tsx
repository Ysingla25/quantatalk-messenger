import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from '@/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { FcGoogle } from 'react-icons/fc';
import { GoogleAuthProvider } from 'firebase/auth';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize Google provider
  const googleAuthProvider = new GoogleAuthProvider();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      toast({ title: 'Missing information', description: 'Please fill in all fields', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      toast({ title: "Passwords don't match", description: 'Please make sure your passwords match', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    if (trimmedPassword.length < 6) {
      toast({ title: 'Weak password', description: 'Password must be at least 6 characters long', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const user = userCredential.user;

      await updateProfile(user, { displayName: trimmedName });

      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        name: trimmedName,
        email: trimmedEmail,
        createdAt: new Date(),
        lastActive: new Date()
      });

      toast({ title: 'Account created', description: 'Welcome to QuantaTalk!' });
      navigate('/chat');
    } catch (error: any) {
      let errorMessage = 'An error occurred while creating your account';
      if (error.code === 'auth/email-already-in-use') errorMessage = 'This email is already registered';
      else if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address';
      else if (error.code === 'auth/weak-password') errorMessage = 'Password too weak';
      else if (error.code === 'auth/too-many-requests') errorMessage = 'Too many attempts, please try again later';
      else if (error.code === 'auth/network-request-failed') errorMessage = 'Network error, please check your connection';

      toast({ title: 'Error creating account', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;

      if (!user) {
        throw new Error('No user data received from Google');
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        if (!user.displayName || !user.email) {
          throw new Error('Invalid Google profile data');
        }

        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          createdAt: new Date(),
          lastActive: new Date()
        });
      }

      toast({ title: 'Signed up with Google', description: `Welcome, ${user.displayName}!` });
      navigate('/chat');
    } catch (error: any) {
      let errorMessage = 'An error occurred while signing up with Google';
      if (error.code === 'auth/popup-closed-by-user') errorMessage = 'Popup was closed by user';
      else if (error.code === 'auth/cancelled-popup-request') errorMessage = 'Operation cancelled';
      else if (error.code === 'auth/network-request-failed') errorMessage = 'Network error, please check your connection';

      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
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
            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" />
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account? <Link to="/sign-in" className="text-primary hover:underline">Sign In</Link>
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted-foreground/50" />
            </div>
            <div className="relative flex justify-center text-sm text-muted-foreground">
              <span>OR</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full flex items-center gap-2 border border-primary"
            disabled={isLoading}
          >
            <FcGoogle className="h-5 w-5" />
            Continue with Google
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default SignUp;
