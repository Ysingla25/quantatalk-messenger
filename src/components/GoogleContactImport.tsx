// src/components/GoogleContactImport.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getGoogleAuthUrl, fetchContacts } from '@/services/googleApi';

export function GoogleContactImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    try {
      const authUrl = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      setError('Failed to initiate Google authentication');
    }
  };

  return (
    <div>
      <Button onClick={handleImport} disabled={loading}>
        Import Contacts from Google
      </Button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}