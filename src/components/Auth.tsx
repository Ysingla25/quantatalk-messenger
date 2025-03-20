// src/components/Auth.tsx
import React, { useState } from 'react';
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";


const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in!');
    } catch (error) {
      console.error('Error logging in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up!');
    } catch (error) {
      console.error('Error signing up:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' />
      <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' />
      <button onClick={handleLogin} disabled={isLoading}>Login</button>
      <button onClick={handleSignUp} disabled={isLoading}>Sign Up</button>
    </div>
  );
};

export default Auth;