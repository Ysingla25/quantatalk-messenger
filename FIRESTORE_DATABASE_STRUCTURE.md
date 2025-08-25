# Firestore Database Structure for Group Chat Functionality

## Required Collections

### 1. `groups` Collection
**Purpose**: Store group chat information and member details

```javascript
// Document ID: auto-generated
{
  name: "string",                    // Group name (max 50 chars)
  description: "string",             // Optional group description (max 200 chars)
  avatar: "string",                  // Group avatar URL (currently empty, can be added later)
  members: [                         // Array of group members
    {
      id: "string",                  // User UID from Firebase Auth
      name: "string",                // User display name
      email: "string",               // User email
      avatar: "string",              // User avatar URL
      role: "admin" | "member",      // User role in group
      joinedAt: Timestamp            // When user joined the group
    }
  ],
  createdBy: "string",               // UID of group creator (always admin)
  createdAt: Timestamp,              // Group creation timestamp
  updatedAt: Timestamp,              // Last update timestamp
  isActive: boolean,                 // Soft delete flag (true = active, false = deleted)
  memberCount: number                // Cached member count for performance
}
```

**Indexes Required**:
- `isActive` (ascending)
- `updatedAt` (descending)
- Composite: `isActive` (ascending) + `updatedAt` (descending)

### 2. `messages` Collection
**Purpose**: Store all messages (both direct and group chats)

```javascript
// Document ID: auto-generated
{
  content: "string",                 // Message content
  senderId: "string",                // UID of message sender
  senderName: "string",              // Display name of sender (cached for performance)
  senderAvatar: "string",            // Sender avatar URL (cached for performance)
  timestamp: Timestamp,              // Message timestamp
  chatId: "string",                  // Group ID or direct chat ID
  chatType: "direct" | "group",      // Type of chat
  messageType: "text",               // Future: support for "image", "file", "audio", etc.
  isEdited: boolean,                 // Whether message was edited
  editedAt: Timestamp,               // Optional: when message was edited
  replyTo: "string",                 // Optional: ID of message being replied to
  mentions: ["string"],              // Optional: Array of user IDs mentioned in message
  reactions: {                       // Optional: Message reactions
    "😀": ["userId1", "userId2"],    // Emoji as key, array of user IDs as value
    "👍": ["userId3"]
  }
}
```

**Indexes Required**:
- `chatId` (ascending) + `timestamp` (descending)
- `senderId` (ascending) + `timestamp` (descending)

### 3. `users` Collection
**Purpose**: Store user profile information (required for user lookup)

```javascript
// Document ID: should match Firebase Auth UID
{
  uid: "string",                     // Firebase Auth UID (same as document ID)
  email: "string",                   // User email
  displayName: "string",             // User display name
  photoURL: "string",                // User avatar URL
  createdAt: Timestamp,              // Account creation timestamp
  lastSeen: Timestamp,               // Last activity timestamp
  isOnline: boolean,                 // Online status
  fcmToken: "string",                // Firebase Cloud Messaging token for notifications
  preferences: {                     // User preferences
    notifications: boolean,          // Enable/disable notifications
    theme: "light" | "dark",         // UI theme preference
    language: "string"               // Preferred language
  }
}
```

**Indexes Required**:
- `email` (ascending)
- `isOnline` (ascending)

### 4. `contacts` Collection (Existing - Enhanced)
**Purpose**: Store user contact lists

```javascript
// Document ID: user UID
{
  userId: "string",                  // Owner of this contact list
  contacts: [                        // Array of contacts
    {
      id: "string",                  // Contact ID (auto-generated)
      name: "string",                // Contact name
      email: "string",               // Contact email
      avatar: "string",              // Contact avatar
      userId: "string",              // Contact's user ID (if they have an account)
      isOnline: boolean,             // Contact's online status
      addedAt: Timestamp,            // When contact was added
      lastMessageAt: Timestamp       // Last message timestamp (for sorting)
    }
  ],
  updatedAt: Timestamp               // Last update timestamp
}
```

### 5. `chats` Collection (Optional - for chat metadata)
**Purpose**: Store chat metadata and last message info

```javascript
// Document ID: auto-generated
{
  type: "direct" | "group",          // Chat type
  participants: ["string"],          // Array of participant user IDs
  name: "string",                    // Chat name (for groups) or null (for direct)
  avatar: "string",                  // Chat avatar (for groups)
  lastMessage: {                     // Last message info for quick access
    content: "string",               // Last message content
    senderId: "string",              // Last message sender ID
    senderName: "string",            // Last message sender name
    timestamp: Timestamp             // Last message timestamp
  },
  createdAt: Timestamp,              // Chat creation timestamp
  updatedAt: Timestamp,              // Last update timestamp
  isActive: boolean,                 // Whether chat is active
  unreadCount: {                     // Unread message count per user
    "userId1": 5,
    "userId2": 0
  }
}
```

## Security Rules

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Groups collection rules
    match /groups/{groupId} {
      // Allow read if user is a member of the group
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.members.map(m => m.id);
      
      // Allow create if user is authenticated
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.createdBy;
      
      // Allow update if user is admin of the group
      allow update: if request.auth != null && 
        isGroupAdmin(resource.data.members, request.auth.uid);
      
      // Allow delete if user is admin of the group
      allow delete: if request.auth != null && 
        isGroupAdmin(resource.data.members, request.auth.uid);
    }
    
    // Messages collection rules
    match /messages/{messageId} {
      // Allow read if user is participant in the chat
      allow read: if request.auth != null && 
        (isDirectChatParticipant(resource.data.chatId, request.auth.uid) ||
         isGroupMember(resource.data.chatId, request.auth.uid));
      
      // Allow create if user is authenticated and is sender
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.senderId;
      
      // Allow update if user is the sender (for editing messages)
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.senderId;
    }
    
    // Users collection rules
    match /users/{userId} {
      // Allow read for any authenticated user
      allow read: if request.auth != null;
      
      // Allow write only for the user's own document
      allow write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Contacts collection rules
    match /contacts/{userId} {
      // Allow read/write only for the user's own contacts
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Helper functions
    function isGroupAdmin(members, userId) {
      return members.filter(m => m.id == userId && m.role == 'admin').size() > 0;
    }
    
    function isGroupMember(groupId, userId) {
      return exists(/databases/$(database)/documents/groups/$(groupId)) &&
        userId in get(/databases/$(database)/documents/groups/$(groupId)).data.members.map(m => m.id);
    }
    
    function isDirectChatParticipant(chatId, userId) {
      return exists(/databases/$(database)/documents/chats/$(chatId)) &&
        userId in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    }
  }
}
```

## Additional Improvements Needed

### 1. User Registration Enhancement
Create a Cloud Function to automatically create user document when user signs up:

```javascript
// Cloud Function: onCreate user trigger
exports.createUserDocument = functions.auth.user().onCreate((user) => {
  return admin.firestore().collection('users').doc(user.uid).set({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastSeen: admin.firestore.FieldValue.serverTimestamp(),
    isOnline: true,
    fcmToken: '',
    preferences: {
      notifications: true,
      theme: 'light',
      language: 'en'
    }
  });
});
```

### 2. Real-time Presence System
Implement online/offline status tracking:

```javascript
// In your app initialization
const presenceRef = ref(database, `presence/${user.uid}`);
const userStatusDatabaseRef = ref(database, `status/${user.uid}`);

const isOfflineForDatabase = {
  state: 'offline',
  last_changed: serverTimestamp(),
};

const isOnlineForDatabase = {
  state: 'online',
  last_changed: serverTimestamp(),
};

onDisconnect(presenceRef).set(isOfflineForDatabase).then(() => {
  set(presenceRef, isOnlineForDatabase);
});
```

### 3. Push Notifications
Set up Firebase Cloud Messaging for group notifications:

```javascript
// Cloud Function: onWrite message trigger
exports.sendNotification = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    
    if (message.chatType === 'group') {
      // Get group members
      const groupDoc = await admin.firestore()
        .collection('groups')
        .doc(message.chatId)
        .get();
      
      const members = groupDoc.data().members;
      const tokens = [];
      
      // Get FCM tokens for all members except sender
      for (const member of members) {
        if (member.id !== message.senderId) {
          const userDoc = await admin.firestore()
            .collection('users')
            .doc(member.id)
            .get();
          
          if (userDoc.exists && userDoc.data().fcmToken) {
            tokens.push(userDoc.data().fcmToken);
          }
        }
      }
      
      // Send notification
      if (tokens.length > 0) {
        const payload = {
          notification: {
            title: groupDoc.data().name,
            body: `${message.senderName}: ${message.content}`,
            icon: groupDoc.data().avatar || '/default-group-icon.png'
          },
          data: {
            chatId: message.chatId,
            chatType: 'group'
          }
        };
        
        await admin.messaging().sendToDevice(tokens, payload);
      }
    }
  });
```

## Performance Optimizations

1. **Pagination**: Implement cursor-based pagination for messages
2. **Caching**: Cache frequently accessed group data
3. **Batch Operations**: Use batch writes for multiple operations
4. **Composite Indexes**: Create appropriate composite indexes for complex queries
5. **Data Denormalization**: Cache user info in messages for better performance

## Migration Script

If you need to migrate existing data, create a migration script:

```javascript
// Migration script to update existing data structure
const migrateExistingData = async () => {
  // Add any necessary data migrations here
  console.log('Migration completed');
};
```

This structure provides a robust foundation for the group chat functionality with proper security, performance, and scalability considerations.