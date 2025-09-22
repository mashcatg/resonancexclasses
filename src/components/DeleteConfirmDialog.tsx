import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, DollarSign, BookOpen } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  impact?: {
    enrollments?: number;
    revenue?: number;
    modules?: number;
    lessons?: number;
  };
  loading?: boolean;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  impact,
  loading = false
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle className="text-destructive">
              Confirm Deletion
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            <div className="space-y-3">
              <p>{description}</p>
              <p className="font-medium text-foreground">"{title}"</p>
              
              {impact && (
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm text-foreground">Impact Assessment:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {impact.enrollments !== undefined && (
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{impact.enrollments} students</span>
                      </div>
                    )}
                    {impact.revenue !== undefined && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">${impact.revenue}</span>
                      </div>
                    )}
                    {impact.modules !== undefined && (
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{impact.modules} modules</span>
                      </div>
                    )}
                    {impact.lessons !== undefined && (
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{impact.lessons} lessons</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2 p-2 bg-destructive/10 rounded">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive font-medium">
                  This action cannot be undone.
                </span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;