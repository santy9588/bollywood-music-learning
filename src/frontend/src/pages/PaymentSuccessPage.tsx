import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  useEnrollUserInCourse,
  useGetStripeSessionStatus,
} from "../hooks/useQueries";

export function PaymentSuccessPage() {
  const search = useSearch({ from: "/payment-success" });
  const sessionId =
    (search as { session_id?: string; course_id?: string }).session_id ?? null;
  const courseId =
    (search as { session_id?: string; course_id?: string }).course_id ?? null;
  const [enrolled, setEnrolled] = useState(false);

  const { data: sessionStatus, isLoading } =
    useGetStripeSessionStatus(sessionId);
  const { mutateAsync: enrollUser } = useEnrollUserInCourse();

  useEffect(() => {
    if (
      sessionStatus?.__kind__ === "completed" &&
      sessionId &&
      courseId &&
      !enrolled
    ) {
      setEnrolled(true);
      void enrollUser({ courseId, sessionId }).catch(() => {
        // Enrollment may already exist
      });
    }
  }, [sessionStatus, sessionId, courseId, enrolled, enrollUser]);

  const isCompleted = sessionStatus?.__kind__ === "completed";
  const isFailed = sessionStatus?.__kind__ === "failed";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        {isLoading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            </div>
            <h2 className="font-display text-2xl font-bold">
              Confirming Payment…
            </h2>
            <p className="text-muted-foreground text-sm">
              Please wait while we confirm your payment.
            </p>
          </div>
        ) : isCompleted ? (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">
                Payment Successful! 🎉
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You're now enrolled! Start your Bollywood music journey right
                away.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              <strong>Congratulations!</strong> Your course access has been
              activated. Head to your dashboard to begin learning.
            </div>
            <Link to="/dashboard">
              <Button
                className="w-full bg-crimson hover:bg-crimson/90 text-white border-0"
                data-ocid="payment_success.dashboard_button"
              >
                Go to Dashboard
              </Button>
            </Link>
          </div>
        ) : isFailed ? (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">
                Payment Failed
              </h2>
              <p className="text-muted-foreground">
                {(
                  sessionStatus as {
                    __kind__: "failed";
                    failed: { error: string };
                  }
                ).failed?.error ?? "Something went wrong with your payment."}
              </p>
            </div>
            <Link to="/courses">
              <Button variant="outline" className="w-full">
                Try Again
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="font-display text-2xl font-bold">
              Payment Received
            </h2>
            <p className="text-muted-foreground text-sm">
              Your payment was received. Check your dashboard for course access.
            </p>
            <Link to="/dashboard">
              <Button
                className="bg-crimson hover:bg-crimson/90 text-white border-0"
                data-ocid="payment_success.dashboard_button"
              >
                Go to Dashboard
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
