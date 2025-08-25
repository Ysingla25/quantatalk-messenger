import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  Timestamp,
  getDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Group, GroupMember, CreateGroupData } from '../types/groups';
import { getUserByEmail, getUserByUid } from './userService';

export class GroupService {
  private static instance: GroupService;
  
  private constructor() {}

  static getInstance(): GroupService {
    if (!GroupService.instance) {
      GroupService.instance = new GroupService();
    }
    return GroupService.instance;
  }

  async createGroup(groupData: CreateGroupData): Promise<Group> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Get member details
      const members: GroupMember[] = [];
      
      // Add creator as admin
      members.push({
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Unknown',
        email: user.email || '',
        avatar: user.photoURL || '',
        role: 'admin',
        joinedAt: new Date()
      });

      // Add other members
      for (const memberId of groupData.memberIds) {
        if (memberId !== user.uid) {
          try {
            const memberUser = await getUserByUid(memberId);
            if (memberUser) {
              members.push({
                id: memberUser.uid,
                name: memberUser.displayName || memberUser.email?.split('@')[0] || 'Unknown',
                email: memberUser.email || '',
                avatar: memberUser.photoURL || '',
                role: 'member',
                joinedAt: new Date()
              });
            } else {
              console.warn(`User with ID ${memberId} not found`);
            }
          } catch (error) {
            console.warn(`Failed to add member ${memberId}:`, error);
          }
        }
      }

      const now = new Date();
      const groupDoc = {
        name: groupData.name,
        description: groupData.description || '',
        avatar: '',
        members: members.map(member => ({
          ...member,
          joinedAt: Timestamp.fromDate(member.joinedAt)
        })),
        createdBy: user.uid,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        isActive: true
      };

      const docRef = await addDoc(collection(db, 'groups'), groupDoc);

      return {
        id: docRef.id,
        name: groupData.name,
        description: groupData.description,
        avatar: '',
        members,
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now,
        isActive: true
      };
    } catch (error) {
      console.error('Error in createGroup:', error);
      throw error;
    }
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    try {
      // Remove orderBy to avoid composite index requirement
      // We'll sort on the client side instead
      const q = query(
        collection(db, 'groups'),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      const groups: Group[] = [];

      snapshot.forEach(doc => {
        const data = doc.data() as any;

        // Normalize members to an array (some older docs might store as object or be missing)
        const rawMembers = (data && data.members) ?? [];
        const membersArray: any[] = Array.isArray(rawMembers)
          ? rawMembers
          : (rawMembers && typeof rawMembers === 'object' ? Object.values(rawMembers) : []);

        // Check if user is a member of this group
        const isMember = membersArray.some((member: any) => member?.id === userId);

        const toDateSafe = (ts: any) =>
          ts && typeof ts.toDate === 'function' ? ts.toDate() : (ts instanceof Date ? ts : new Date());
        
        if (isMember) {
          groups.push({
            id: doc.id,
            name: data.name || '',
            description: data.description || '',
            avatar: data.avatar || '',
            members: membersArray.map((member: any) => ({
              ...member,
              joinedAt: toDateSafe(member?.joinedAt)
            })),
            createdBy: data.createdBy,
            createdAt: toDateSafe(data.createdAt),
            updatedAt: toDateSafe(data.updatedAt),
            isActive: !!data.isActive
          });
        }
      });

      // Sort by updatedAt on the client side
      groups.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return groups;
    } catch (error) {
      console.error('Error in getUserGroups:', error);
      throw error;
    }
  }

  async getGroupById(groupId: string): Promise<Group | null> {
    try {
      const docRef = doc(db, 'groups', groupId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data() as any;

      const rawMembers = (data && data.members) ?? [];
      const membersArray: any[] = Array.isArray(rawMembers)
        ? rawMembers
        : (rawMembers && typeof rawMembers === 'object' ? Object.values(rawMembers) : []);

      const toDateSafe = (ts: any) =>
        ts && typeof ts.toDate === 'function' ? ts.toDate() : (ts instanceof Date ? ts : new Date());

      return {
        id: docSnap.id,
        name: data.name || '',
        description: data.description || '',
        avatar: data.avatar || '',
        members: membersArray.map((member: any) => ({
          ...member,
          joinedAt: toDateSafe(member?.joinedAt)
        })),
        createdBy: data.createdBy,
        createdAt: toDateSafe(data.createdAt),
        updatedAt: toDateSafe(data.updatedAt),
        isActive: !!data.isActive
      };
    } catch (error) {
      console.error('Error in getGroupById:', error);
      throw error;
    }
  }

  async addMemberToGroup(groupId: string, memberEmail: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Get the user to add
      const memberUser = await getUserByEmail(memberEmail);
      if (!memberUser) {
        throw new Error('User not found');
      }

      // Check if user is already a member
      const group = await this.getGroupById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      const isAlreadyMember = group.members.some(member => member.id === memberUser.uid);
      if (isAlreadyMember) {
        throw new Error('User is already a member of this group');
      }

      // Check if current user is admin
      const currentUserMember = group.members.find(member => member.id === user.uid);
      if (!currentUserMember || currentUserMember.role !== 'admin') {
        throw new Error('Only admins can add members');
      }

      const newMember: GroupMember = {
        id: memberUser.uid,
        name: memberUser.displayName || memberUser.email?.split('@')[0] || 'Unknown',
        email: memberUser.email || '',
        avatar: memberUser.photoURL || '',
        role: 'member',
        joinedAt: new Date()
      };

      const docRef = doc(db, 'groups', groupId);
      await updateDoc(docRef, {
        members: arrayUnion({
          ...newMember,
          joinedAt: Timestamp.fromDate(newMember.joinedAt)
        }),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error in addMemberToGroup:', error);
      throw error;
    }
  }

  async removeMemberFromGroup(groupId: string, memberId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const group = await this.getGroupById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Check if current user is admin or removing themselves
      const currentUserMember = group.members.find(member => member.id === user.uid);
      const memberToRemove = group.members.find(member => member.id === memberId);
      
      if (!currentUserMember || !memberToRemove) {
        throw new Error('Member not found');
      }

      if (currentUserMember.role !== 'admin' && user.uid !== memberId) {
        throw new Error('Only admins can remove other members');
      }

      // Don't allow removing the last admin
      const adminCount = group.members.filter(member => member.role === 'admin').length;
      if (memberToRemove.role === 'admin' && adminCount === 1) {
        throw new Error('Cannot remove the last admin');
      }

      const docRef = doc(db, 'groups', groupId);
      await updateDoc(docRef, {
        members: arrayRemove({
          ...memberToRemove,
          joinedAt: Timestamp.fromDate(memberToRemove.joinedAt)
        }),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error in removeMemberFromGroup:', error);
      throw error;
    }
  }

  async updateGroupInfo(groupId: string, updates: { name?: string; description?: string }): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const group = await this.getGroupById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Check if current user is admin
      const currentUserMember = group.members.find(member => member.id === user.uid);
      if (!currentUserMember || currentUserMember.role !== 'admin') {
        throw new Error('Only admins can update group info');
      }

      const docRef = doc(db, 'groups', groupId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error in updateGroupInfo:', error);
      throw error;
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const group = await this.getGroupById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Check if current user is admin
      const currentUserMember = group.members.find(member => member.id === user.uid);
      if (!currentUserMember || currentUserMember.role !== 'admin') {
        throw new Error('Only admins can delete groups');
      }

      const docRef = doc(db, 'groups', groupId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error in deleteGroup:', error);
      throw error;
    }
  }
}
