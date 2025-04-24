
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, Shield, Users, Lock } from 'lucide-react';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('quantatalk-user');
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);
  
  if (isLoggedIn) {
    navigate('/chat');
    return null;
  }

  return (
    <Layout className="flex flex-col items-center justify-center p-4 md:p-8 pt-8">
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              <span className="text-gradient">Secure Messaging</span>{" "}
              <br />for the Digital Age
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Experience encrypted, private communication with QuantaTalk's sleek, intuitive messaging platform.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <FeatureCard 
                icon={<Shield className="h-5 w-5" />} 
                title="End-to-End Encryption" 
                description="Your messages stay private with advanced encryption." 
              />
              
              <FeatureCard 
                icon={<Users className="h-5 w-5" />} 
                title="Group Messaging" 
                description="Create secure groups for team collaboration." 
              />
              
              <FeatureCard 
                icon={<MessageSquare className="h-5 w-5" />} 
                title="Real-time Chat" 
                description="Instant messaging with read receipts." 
              />
              
              <FeatureCard 
                icon={<Lock className="h-5 w-5" />} 
                title="Privacy First" 
                description="We don't store your message content." 
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity px-8 py-6"
                asChild
              >
                <Link to="/sign-up">
                  Try it now
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="border-primary hover:bg-primary/10 py-6"
                asChild
              >
                <Link to="/features">
                  Learn more
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 lg:bg-secondary/20 lg:p-8 lg:rounded-2xl animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Get Started With QuantaTalk</h2>
              <p className="text-muted-foreground">Join thousands of users enjoying secure messaging</p>
            </div>
            
            <div className="flex flex-col space-y-4">
              <Button 
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity py-6"
                asChild
              >
                <Link to="/sign-up">
                  Create Account
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full py-6"
                asChild
              >
                <Link to="/sign-in">
                  Sign In
                </Link>
              </Button>
              
              <div className="text-center mt-4">
                <Link to="/about" className="text-sm text-primary hover:underline">
                  Learn more about QuantaTalk
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="glass-effect p-5 rounded-xl">
      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center text-primary mb-3">
        {icon}
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default Index;
