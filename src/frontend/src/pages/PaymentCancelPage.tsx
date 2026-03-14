import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, XCircle } from "lucide-react";
import { motion } from "motion/react";

export function PaymentCancelPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10 text-amber-600" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold mb-2">
            Payment Cancelled
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Your payment was cancelled. No charges were made. You can try again
            whenever you're ready.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Your cart has been saved. Return to the course page to try again.
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/courses" className="flex-1">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Courses
            </Button>
          </Link>
          <Link to="/dashboard" className="flex-1">
            <Button className="w-full bg-crimson hover:bg-crimson/90 text-white border-0">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
