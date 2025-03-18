
import React from 'react';
import Layout from '@/components/layout/Layout';
import LoginForm from '@/components/auth/LoginForm';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();
  
  const handleLoginSuccess = () => {
    navigate('/chat');
  };

  return (
    <Layout className="flex items-center justify-center p-4 md:p-8 pt-8">
      <div className="w-full max-w-lg mx-auto">
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </Layout>
  );
};

export default SignIn;
