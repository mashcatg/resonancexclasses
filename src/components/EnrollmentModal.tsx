import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, CheckCircle } from "lucide-react";

interface Course {
  id: string;
  title: string;
  price: number;
}

interface EnrollmentModalProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const BKASH_NUMBER = "01950095883";

const EnrollmentModal = ({ course, open, onOpenChange, onSuccess }: EnrollmentModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${timestamp}-${random}`;
  };

  const handleSubmit = async () => {
    if (!user || !course) return;

    if (!transactionId.trim()) {
      toast({
        title: "Transaction ID Required",
        description: "Please enter your bKash transaction ID.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        course_id: course.id,
        amount: course.price,
        trx_id: transactionId.trim(),
        merchant_invoice_number: generateInvoiceNumber(),
        status: "pending",
        payment_method: "bkash",
        currency: "BDT",
      });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Request Submitted!",
        description: "Your enrollment request has been submitted. We'll verify your payment soon.",
      });
      
      setTimeout(() => {
        onSuccess();
        setSubmitted(false);
        setTransactionId("");
        onOpenChange(false);
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting enrollment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit enrollment request.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setTransactionId("");
      setSubmitted(false);
      onOpenChange(false);
    }
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll in Course</DialogTitle>
          <DialogDescription>
            Complete payment via bKash to enroll in this course.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Request Submitted!
            </h3>
            <p className="text-muted-foreground text-sm">
              Your payment verification is in progress. You'll get access once approved.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {/* Course Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-medium text-foreground">{course.title}</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  ৳{course.price.toLocaleString("en-BD")}
                </p>
              </div>

              {/* bKash Number */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">Make Bkash Payment</span>
                </div>
                <p className="text-2xl font-bold text-primary tracking-wider">
                  {BKASH_NUMBER}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Send exactly ৳{course.price.toLocaleString("en-BD")} via bKash
                </p>
              </div>

              {/* Transaction ID Input */}
              <div className="space-y-2">
                <Label htmlFor="transactionId">bKash Transaction ID</Label>
                <Input
                  id="transactionId"
                  placeholder="Enter your transaction ID (e.g., ABC123XYZ)"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  You'll receive this ID after completing the bKash payment.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || !transactionId.trim()}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentModal;
