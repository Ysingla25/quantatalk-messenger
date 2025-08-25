import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { GroupService } from '@/services/groupService';
import { Group, GroupMember } from '@/types/groups';
import { Users, UserPlus, UserMinus, Crown as CrownIcon, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface GroupMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  onGroupUpdated: (group: Group) => void;
  onGroupDeleted: (groupId: string) => void;
}

const GroupMembersDialog: React.FC<GroupMembersDialogProps> = ({
  isOpen,       
  onClose,
  group,
  onGroupUpdated,   
  onGroupDeleted
}) => {
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const groupService = GroupService.getInstance();

  // 🛑 FIX: Add a check to ensure group and group.members exist and are valid.
  if (!group || !Array.isArray(group.members)) {
    return null;
  }

  const currentUserMember = group.members.find(member => member.id === currentUser?.uid);
  const isAdmin = currentUserMember?.role === 'admin';

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMemberEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await groupService.addMemberToGroup(group.id, newMemberEmail.trim());
      
      // Refresh group data
      const updatedGroup = await groupService.getGroupById(group.id);
      if (updatedGroup) {
        onGroupUpdated(updatedGroup);
      }

      setNewMemberEmail('');
      toast({
        title: "Success",
        description: "Member added successfully",
      });
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    try {
      setRemovingMember(memberId);
      await groupService.removeMemberFromGroup(group.id, memberId);
      
      // Refresh group data
      const updatedGroup = await groupService.getGroupById(group.id);
      if (updatedGroup) {
        onGroupUpdated(updatedGroup);
      }

      toast({
        title: "Success",
        description: `${memberName} removed from group`,
      });
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      });
    } finally {
      setRemovingMember(null);
    }
  };

  const handleDeleteGroup = async () => {
    if (!group) return;

    try {
      setLoading(true);
      await groupService.deleteGroup(group.id);
      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
      onGroupDeleted(group.id);
      onClose();
    } catch (error: any) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete group",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Members ({group.members.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Member Form - Only for admins */}
          {isAdmin && (
            <form onSubmit={handleAddMember} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={loading || !newMemberEmail.trim()}
                  size="sm"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Members List */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Members</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {group.members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        {member.role === 'admin' && (
                          <span title="Admin">
                              <CrownIcon className="h-4 w-4 text-yellow-500" />
                          </span>
                        )}
                        {member.id === currentUser?.uid && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Remove button - Only for admins and not for themselves */}
                  {isAdmin && member.id !== currentUser?.uid && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveMember(member.id, member.name)}
                      disabled={removingMember === member.id}
                    >
                      {removingMember === member.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <UserMinus className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-4 flex justify-between">
            {isAdmin && (
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                Delete Group
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the group.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDeleteGroup} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default GroupMembersDialog;
