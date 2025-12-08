import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Monitor, LogOut, ShieldX, Mail } from "lucide-react";

interface DeviceBlockedModalProps {
  open: boolean;
  onLogout: () => void;
  isRevoked?: boolean;
}

export const DeviceBlockedModal = ({ open, onLogout, isRevoked = false }: DeviceBlockedModalProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {isRevoked ? (
              <div className="p-3 bg-red-100 rounded-full">
                <ShieldX className="h-8 w-8 text-red-600" />
              </div>
            ) : (
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            )}
          </div>
          <DialogTitle className="text-center">
            {isRevoked ? "Device Access Blocked" : "Device Pending Approval"}
          </DialogTitle>
          <DialogDescription className="text-center space-y-4">
            {isRevoked ? (
              <>
                <p>
                  Your access from this device has been revoked by an administrator.
                </p>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-3 text-sm text-red-700">
                    <ShieldX className="h-5 w-5" />
                    <span>This device has been blocked</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-red-700">
                    <Mail className="h-5 w-5" />
                    <span>Please contact support for assistance</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  If you believe this is an error, please reach out to our support team
                  to resolve this issue.
                </p>
              </>
            ) : (
              <>
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
              </>
            )}
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
