# 🌐 Network Access Guide for QuantaTalk Messenger

## How Other Users Can Sign Up on Your Local Project

Since you're using Firebase, other users can access your app directly through your local network. Here's how to set it up:

### 🚀 **Option 1: Direct Network Access (Recommended)**

#### **Step 1: Start Your Development Server**
```bash
npm run dev
```

#### **Step 2: Share Your Local URL**
Other users can access your app using:
```
http://172.30.46.175:8080
```

**Important Notes:**
- ✅ Both users must be on the same WiFi network
- ✅ Your firewall must allow connections on port 8080
- ✅ Users can sign up using email/password or Google OAuth
- ✅ All data is stored in your Firebase project

#### **Step 3: For Users to Sign Up**
1. Users visit: `http://172.30.46.175:8080`
2. Click "Sign Up" 
3. Choose either:
   - **Email/Password**: Fill out the form
   - **Google OAuth**: Click "Continue with Google"

### 🔧 **Option 2: Deploy to Firebase Hosting (Production-like)**

If you want a more permanent solution:

#### **Step 1: Build the Project**
```bash
npm run build
```

#### **Step 2: Deploy to Firebase Hosting**
```bash
firebase deploy --only hosting
```

#### **Step 3: Share the Firebase URL**
Users can access: `https://quantatalk-messaging.web.app`

### 🔒 **Option 3: Local Development with ngrok (Temporary)**

For testing with users outside your network:

#### **Step 1: Install ngrok**
```bash
npm install -g ngrok
```

#### **Step 2: Start your dev server**
```bash
npm run dev
```

#### **Step 3: Create tunnel**
```bash
ngrok http 8080
```

#### **Step 4: Share the ngrok URL**
Users get a URL like: `https://abc123.ngrok.io`

### 📱 **Testing the Contact Features**

Once users sign up, they can:

1. **Add Contacts Manually:**
   - Click "Add Contact" button
   - Enter name, email, and optional avatar URL
   - Contact is saved to their personal list

2. **Start New Chats:**
   - Click "New Chat" button
   - Search by name or email
   - Select a contact to start messaging

3. **Import Google Contacts:**
   - Click "Import Google" button
   - Grant permission to access Google contacts
   - Select which contacts to import

### 🔐 **Security Considerations**

- **Firebase Rules**: Ensure your Firestore rules allow user creation
- **Authentication**: Users can only access their own data
- **Network Security**: Only share with trusted users on your network

### 🛠️ **Troubleshooting**

#### **If users can't connect:**
1. Check Windows Firewall settings
2. Ensure both devices are on same network
3. Try using `localhost` instead of IP if on same machine

#### **If sign-up fails:**
1. Check Firebase console for errors
2. Verify Firebase project settings
3. Check browser console for detailed errors

### 📊 **Monitoring Users**

You can monitor new users in:
- **Firebase Console** → Authentication → Users
- **Firebase Console** → Firestore → users collection

### 🎯 **Quick Start Commands**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Firebase
firebase deploy

# Check network access
curl http://172.30.46.175:8080
```

---

**Current Setup:**
- ✅ Firebase Authentication enabled
- ✅ Email/Password sign-up working
- ✅ Google OAuth sign-up working
- ✅ Network access configured
- ✅ Contact management features added

**Users can now:**
1. Sign up at `http://172.30.46.175:8080`
2. Add contacts manually
3. Start chats with other users
4. Import Google contacts
