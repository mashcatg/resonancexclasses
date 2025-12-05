import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Monitor, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DeviceBlockedModalProps {
  open: boolean;
  onLogout: () => void;
}

export const DeviceBlockedModal = ({ open, onLogout }: DeviceBlockedModalProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <Shield className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <DialogTitle className="text-center">Device Not Authorized</DialogTitle>
          <DialogDescription className="text-center space-y-4">
            <p>
              You're trying to access from a new device. For security reasons,
              only one device can be used at a time.
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
              If you believe this is an error, please contact support or wait for
              an administrator to approve your device.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={onLogout}>
            Sign Out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
