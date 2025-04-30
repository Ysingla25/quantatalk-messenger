// src/services/googleContacts.ts

export const getGoogleContacts = async (token: string) => {
  const response = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch contacts');
  }

  const data = await response.json();
  return data.connections?.map((person: any) => ({
    name: person.names?.[0]?.displayName || 'Unknown',
    email: person.emailAddresses?.[0]?.value || 'No Email',
  })) || [];
};
