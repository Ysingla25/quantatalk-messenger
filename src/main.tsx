import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useHeaderScroll } from './utils/headerScroll';
import React from 'react';

function Root() {
  useHeaderScroll();
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
