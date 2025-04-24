// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchContacts } from '@/services/googleApi';

export default function AuthCallback() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get('code');

  useEffect(() => {
    if (code) {
      // Handle the OAuth code here
      // You'll need to exchange this code for an access token
      // Then use the access token to fetch contacts
    } else {
      navigate('/error');
    }
  }, [code, navigate]);

  return <div>Loading contacts...</div>;
}