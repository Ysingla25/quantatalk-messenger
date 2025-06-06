import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth, googleProvider } from '@/firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';

interface LoginFormProps {
  onSuccess: () => void;
  isLoading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, isLoading = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setLocalLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Successfully authenticated",
        description: "Welcome to QuantaTalk!",
      });
      onSuccess();
    } catch (error: any) {
      let errorMessage = "Invalid credentials";
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No user found with this email";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      toast({
        title: "Authentication failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast({
        title: "Successfully authenticated",
        description: "Welcome to QuantaTalk!",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "An error occurred during Google sign-in.",
        variant: "destructive",
      });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-lg glass-effect animate-fade-in">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Lock className="h-8 w-8 text-white" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-6 text-gradient">Welcome to QuantaTalk</h2>
      
      <div className="text-xs px-4 py-3 rounded-md bg-secondary mb-6 text-center">
        <p className="text-muted-foreground">
          <strong>Demo account:</strong> demo@quantatalk.com / password
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-secondary/50 border-secondary"
            disabled={isLoading || localLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-secondary/50 border-secondary"
            disabled={isLoading || localLoading}
          />
        </div>
        
        <Button 
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isLoading || localLoading}
        >
          {isLoading || localLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/sign-up" className="text-primary hover:text-primary/90">
            Sign up
          </Link>
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
        onClick={handleGoogleSignIn}
        className="w-full flex items-center gap-2 border border-primary"
        disabled={isLoading || localLoading}
      >
      <FcGoogle className="h-5 w-5" />
        Continue with Google
      </Button>
    </div>
  );
};

export default LoginForm;
