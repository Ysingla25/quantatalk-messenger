
import { Message } from '@/components/messages/MessageList';
import { users, groups } from './users';

// Generate direct message conversation between two users
export const generateMessages = (currentUserId: string, otherUserId: string): Message[] => {
  const currentUser = users.find(u => u.id === currentUserId);
  const otherUser = users.find(u => u.id === otherUserId);
  
  if (!currentUser || !otherUser) return [];
  
  const generateRandomTime = (hoursAgo: number) => {
    const date = new Date();
    date.setHours(date.getHours() - hoursAgo);
    return date;
  };
  
  return [
    {
      id: '1',
      content: `Hi ${currentUser.name}, how are you doing today?`,
      sender: {
        id: otherUser.id,
        name: otherUser.name,
        avatar: otherUser.avatar
      },
      timestamp: generateRandomTime(5),
      status: 'read',
      isEncrypted: true
    },
    {
      id: '2',
      content: "I'm doing well, thanks for asking! How about you?",
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      timestamp: generateRandomTime(4),
      status: 'read',
      isEncrypted: true
    },
    {
      id: '3',
      content: "Pretty good! I've been working on the new QuantaTalk project. Have you had a chance to check out the secure messaging features?",
      sender: {
        id: otherUser.id,
        name: otherUser.name,
        avatar: otherUser.avatar
      },
      timestamp: generateRandomTime(3),
      status: 'read',
      isEncrypted: true
    },
    {
      id: '4',
      content: "Yes, the end-to-end encryption is really impressive. I like how seamless it is to use while still maintaining high security standards.",
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      timestamp: generateRandomTime(2),
      status: 'read',
      isEncrypted: true
    },
    {
      id: '5',
      content: "Exactly! That was our goal - security without sacrificing user experience. We should discuss this more in the next team meeting.",
      sender: {
        id: otherUser.id,
        name: otherUser.name,
        avatar: otherUser.avatar
      },
      timestamp: generateRandomTime(1),
      status: 'read',
      isEncrypted: true
    }
  ];
};

// Generate group message conversation
export const generateGroupMessages = (groupId: string, currentUserId: string): Message[] => {
  const group = groups.find(g => g.id === groupId);
  
  if (!group) return [];
  
  const generateRandomTime = (hoursAgo: number) => {
    const date = new Date();
    date.setHours(date.getHours() - hoursAgo);
    return date;
  };
  
  // Filter out current user from group members for messages
  const otherMembers = group.members.filter(m => m.id !== currentUserId);
  
  return [
    {
      id: 'g1',
      content: `Welcome everyone to the ${group.name} group chat!`,
      sender: {
        id: otherMembers[0].id,
        name: otherMembers[0].name,
        avatar: otherMembers[0].avatar
      },
      timestamp: generateRandomTime(8),
      status: 'read',
      isEncrypted: true
    },
    {
      id: 'g2',
      content: "Thanks for setting this up. It's going to be much easier to coordinate now.",
      sender: {
        id: currentUserId,
        name: users.find(u => u.id === currentUserId)?.name || 'User',
        avatar: users.find(u => u.id === currentUserId)?.avatar || null
      },
      timestamp: generateRandomTime(7),
      status: 'read',
      isEncrypted: true
    },
    {
      id: 'g3',
      content: "I agree. Having end-to-end encryption for our discussions is essential, especially for sensitive project details.",
      sender: {
        id: otherMembers[1].id,
        name: otherMembers[1].name,
        avatar: otherMembers[1].avatar
      },
      timestamp: generateRandomTime(6),
      status: 'read',
      isEncrypted: true
    },
    {
      id: 'g4',
      content: "Does everyone have access to the shared documents folder?",
      sender: {
        id: otherMembers[0].id,
        name: otherMembers[0].name,
        avatar: otherMembers[0].avatar
      },
      timestamp: generateRandomTime(5),
      status: 'read',
      isEncrypted: true
    },
    {
      id: 'g5',
      content: "I do, but I couldn't see the latest revisions. Can someone check permissions?",
      sender: {
        id: currentUserId,
        name: users.find(u => u.id === currentUserId)?.name || 'User',
        avatar: users.find(u => u.id === currentUserId)?.avatar || null
      },
      timestamp: generateRandomTime(4),
      status: 'read',
      isEncrypted: true
    },
    {
      id: 'g6',
      content: "I'll look into that right away and update the permissions.",
      sender: {
        id: otherMembers[1].id,
        name: otherMembers[1].name,
        avatar: otherMembers[1].avatar
      },
      timestamp: generateRandomTime(3),
      status: 'read',
      isEncrypted: true
    }
  ];
};
