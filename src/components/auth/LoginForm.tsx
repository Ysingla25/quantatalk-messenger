
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Lock } from 'lucide-react';

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        // Demo credentials for easy testing
        if (email === 'demo@quantatalk.com' && password === 'password') {
          toast({
            title: "Successfully authenticated",
            description: "Welcome to QuantaTalk!",
          });
          localStorage.setItem('quantatalk-user', JSON.stringify({
            id: '1',
            name: 'Demo User',
            email: 'demo@quantatalk.com',
            avatar: null
          }));
          onSuccess();
        } else {
          toast({
            title: "Authentication failed",
            description: "Invalid credentials. Try demo@quantatalk.com / password",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Missing information",
          description: "Please fill in all fields",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
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
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          disabled={isLoading}
        >
          {isLoading ? 'Authenticating...' : 'Sign In'}
        </Button>
        
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account? <span className="text-primary cursor-pointer hover:underline">Create one</span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
