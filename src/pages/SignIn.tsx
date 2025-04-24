import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import LoginForm from '@/pages/LoginForm';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, db } from '@/firebaseConfig';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { toast } from '@/components/ui/use-toast';
import { setDoc, doc, getDoc } from 'firebase/firestore';

const SignIn = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && window.location.pathname !== '/chat') {
        navigate('/chat', { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLoginSuccess = () => setIsLoading(true);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          createdAt: new Date(),
          lastActive: new Date()
        });
      }

      toast({
        title: 'Logged in with Google',
        description: `Welcome, ${user.displayName || 'User'}!`
      });
      navigate('/chat');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: 'Authentication failed',
        description: 'Could not sign in with Google',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout className="flex flex-col items-center justify-center gap-6 p-4 md:p-8 pt-8">
      <div className="w-full max-w-lg mx-auto">
        <LoginForm onSuccess={handleLoginSuccess} isLoading={isLoading} />
      </div>
    </Layout>
  );
};

export default SignIn;
