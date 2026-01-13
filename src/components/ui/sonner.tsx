import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:p-4",
           description: "group-[.toast]:text-foreground group-[.toast]:text-sm",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
           title: "group-[.toast]:font-bold group-[.toast]:text-foreground group-[.toast]:block",
           error: "group-[.toaster]:bg-red-50 group-[.toaster]:border-red-200",
           success: "group-[.toaster]:bg-green-50 group-[.toaster]:border-green-200",
           warning: "group-[.toaster]:bg-yellow-50 group-[.toaster]:border-yellow-200",
           info: "group-[.toaster]:bg-blue-50 group-[.toaster]:border-blue-200",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
