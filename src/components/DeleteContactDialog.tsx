import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contactName: string;
  loading?: boolean;
}

export default function DeleteContactDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  contactName,
  loading = false 
}: DeleteContactDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Contact
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{contactName}</strong> from your contacts?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            This action cannot be undone. The contact will be permanently removed from your list.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Contact'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
