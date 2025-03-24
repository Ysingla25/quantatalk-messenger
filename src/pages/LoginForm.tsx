import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '@/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

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
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      toast({
        title: "Successfully authenticated",
        description: "Welcome to QuantaTalk!",
      });
    
      // Call onSuccess callback to navigate to chat
      onSuccess();
    } catch (error) {
      console.error('Error during sign in:', error);
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
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
          <Link to="/signup" className="text-primary hover:text-primary/90">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
