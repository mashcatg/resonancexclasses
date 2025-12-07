import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastViewport } from "@/components/ui/toast";
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  const getIconAndColor = (variant?: string) => {
    switch (variant) {
      case "destructive":
        return { icon: AlertTriangle, bgColor: "bg-red-50", borderColor: "border-red-200", iconColor: "text-red-600" };
      case "success":
        return { icon: CheckCircle2, bgColor: "bg-green-50", borderColor: "border-green-200", iconColor: "text-green-600" };
      case "warning":
        return { icon: AlertCircle, bgColor: "bg-yellow-50", borderColor: "border-yellow-200", iconColor: "text-yellow-600" };
      default:
        return { icon: Info, bgColor: "bg-blue-50", borderColor: "border-blue-200", iconColor: "text-blue-600" };
    }
  };

  return (
    <ToastProvider>
      {toasts.map(function ({ id, description, action, variant, ...props }) {
        const { icon: Icon, bgColor, borderColor, iconColor } = getIconAndColor(variant);
        return (
          <Toast 
            key={id} 
            {...props} 
            className={`${bgColor} ${borderColor} border shadow-lg rounded-lg pointer-events-auto`}
          >
            <div className="flex items-center gap-3 flex-1">
              <Icon className={`h-5 w-5 flex-shrink-0 ${iconColor}`} />
              {description && <ToastDescription className="text-foreground font-medium">{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport className="fixed top-4 right-4 flex flex-col gap-2 w-full max-w-sm pointer-events-none" />
    </ToastProvider>
  );
}
