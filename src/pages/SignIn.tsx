import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import LoginForm from '@/pages/LoginForm';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from '@/components/ui/use-toast';

const SignIn = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already authenticated
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/chat');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLoginSuccess = () => {
    setIsLoading(true);
    // Small delay to show loading state
    setTimeout(() => {
      navigate('/chat');
      setIsLoading(false);
    }, 500);
  };

  return (
    <Layout className="flex items-center justify-center p-4 md:p-8 pt-8">
      <div className="w-full max-w-lg mx-auto">
        <LoginForm 
          onSuccess={handleLoginSuccess} 
        />
      </div>
    </Layout>
  );
};

export default SignIn;