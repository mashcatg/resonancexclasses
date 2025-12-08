import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Monitor, LogOut } from "lucide-react";

interface DeviceBlockedModalProps {
  open: boolean;
  onLogout: () => void;
}

export const DeviceBlockedModal = ({ open, onLogout }: DeviceBlockedModalProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <DialogTitle className="text-center">Device Pending Approval</DialogTitle>
          <DialogDescription className="text-center space-y-4">
            <p>
              This device needs to be approved by an administrator before you can access your courses.
            </p>
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Monitor className="h-5 w-5 text-muted-foreground" />
                <span>Your device is pending admin approval</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>Approval typically takes 24 hours</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              You will receive a notification once your device is approved.
              If you believe this is an error, please contact support.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
