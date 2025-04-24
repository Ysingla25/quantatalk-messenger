import { useEffect } from 'react';

export const useHeaderScroll = () => {
  useEffect(() => {
    const header = document.querySelector('header');
    
    if (header) {
      const handleScroll = () => {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      };

      window.addEventListener('scroll', handleScroll);
      
      // Initial check
      handleScroll();
      
      // Cleanup
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);
};
