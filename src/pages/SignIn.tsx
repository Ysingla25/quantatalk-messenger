import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import LoginForm from '@/pages/LoginForm';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const SignIn = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User authenticated:', user.email);
        // Ensure we're not on the chat page before navigating
        if (window.location.pathname !== '/chat') {
          navigate('/chat', { replace: true });
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLoginSuccess = () => {
    setIsLoading(true);
  };

  return (
    <Layout className="flex items-center justify-center p-4 md:p-8 pt-8">
      <div className="w-full max-w-lg mx-auto">
        <LoginForm 
          onSuccess={handleLoginSuccess} 
          isLoading={isLoading}
        />
      </div>
    </Layout>
  );
};

export default SignIn;