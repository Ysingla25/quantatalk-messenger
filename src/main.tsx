import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useHeaderScroll } from './utils/headerScroll';
import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);

function Root() {
  useHeaderScroll();
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);