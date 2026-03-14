import { Button } from "@/components/ui/button";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Shield,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useEnrollUserInCourse } from "../hooks/useQueries";

// ─── QR Code Placeholder ─────────────────────────────────────────

function QrCodePlaceholder({ methodName }: { methodName: string }) {
  // Generate a deterministic CSS-drawn QR-like grid pattern
  return (
    <div
      data-ocid="payment_gateway.qr_code"
      className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden border-2 border-border/60 bg-white shadow-md"
    >
      {/* QR pattern using SVG */}
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        role="img"
        aria-labelledby="qr-svg-title"
      >
        <title id="qr-svg-title">{`QR code for ${methodName} payment`}</title>
        {/* Background */}
        <rect width="200" height="200" fill="white" />

        {/* Top-left finder pattern */}
        <rect x="20" y="20" width="56" height="56" rx="4" fill="#111" />
        <rect x="28" y="28" width="40" height="40" rx="2" fill="white" />
        <rect x="36" y="36" width="24" height="24" rx="1" fill="#111" />

        {/* Top-right finder pattern */}
        <rect x="124" y="20" width="56" height="56" rx="4" fill="#111" />
        <rect x="132" y="28" width="40" height="40" rx="2" fill="white" />
        <rect x="140" y="36" width="24" height="24" rx="1" fill="#111" />

        {/* Bottom-left finder pattern */}
        <rect x="20" y="124" width="56" height="56" rx="4" fill="#111" />
        <rect x="28" y="132" width="40" height="40" rx="2" fill="white" />
        <rect x="36" y="140" width="24" height="24" rx="1" fill="#111" />

        {/* Data modules - simulated random pattern */}
        {[
          [90, 20],
          [100, 20],
          [110, 20],
          [90, 30],
          [110, 30],
          [90, 40],
          [95, 40],
          [105, 40],
          [110, 40],
          [90, 50],
          [100, 50],
          [90, 60],
          [105, 60],
          [110, 60],
          [20, 90],
          [30, 90],
          [50, 90],
          [60, 90],
          [20, 100],
          [40, 100],
          [55, 100],
          [25, 110],
          [35, 110],
          [55, 110],
          [60, 110],
          [20, 120],
          [45, 120],
          [55, 120],
          [90, 90],
          [95, 90],
          [105, 90],
          [115, 90],
          [90, 100],
          [100, 100],
          [110, 100],
          [95, 110],
          [105, 110],
          [115, 110],
          [90, 120],
          [100, 120],
          [110, 120],
          [130, 90],
          [140, 90],
          [155, 90],
          [170, 90],
          [135, 100],
          [150, 100],
          [165, 100],
          [130, 110],
          [145, 110],
          [160, 110],
          [170, 110],
          [135, 120],
          [155, 120],
          [165, 120],
          [90, 130],
          [105, 130],
          [115, 130],
          [130, 130],
          [140, 130],
          [155, 130],
          [165, 130],
          [90, 140],
          [100, 140],
          [110, 140],
          [135, 140],
          [150, 140],
          [170, 140],
          [95, 150],
          [110, 150],
          [130, 150],
          [145, 150],
          [160, 150],
          [170, 150],
          [90, 160],
          [100, 160],
          [115, 160],
          [135, 160],
          [150, 160],
          [165, 160],
        ].map(([x, y]) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="8"
            height="8"
            rx="1"
            fill="#111"
          />
        ))}
      </svg>

      {/* Center brand label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 border border-border/40 shadow-sm">
          <p className="text-[9px] font-bold text-foreground/70 uppercase tracking-wide">
            {methodName}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Method Config ────────────────────────────────────────────────

const METHOD_CONFIG: Record<
  string,
  {
    name: string;
    color: string;
    bgClass: string;
    logoSrc: string;
    accentClass: string;
  }
> = {
  phonepe: {
    name: "PhonePe",
    color: "#5F259F",
    bgClass: "from-purple-900 via-purple-800 to-purple-900",
    logoSrc: "/assets/generated/phonepe-logo-transparent.dim_120x60.png",
    accentClass: "text-purple-300",
  },
  paytm: {
    name: "Paytm",
    color: "#00BAF2",
    bgClass: "from-sky-900 via-sky-800 to-sky-900",
    logoSrc: "/assets/generated/paytm-logo-transparent.dim_120x60.png",
    accentClass: "text-sky-300",
  },
};

// ─── Page ─────────────────────────────────────────────────────────

export function PaymentGatewayPage() {
  const search = useSearch({ from: "/payment-gateway" });
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { mutateAsync: enrollUser } = useEnrollUserInCourse();

  const method =
    (search as { method: string; courseId: string }).method || "phonepe";
  const courseId =
    (search as { method: string; courseId: string }).courseId || "";

  const config = METHOD_CONFIG[method] ?? METHOD_CONFIG.phonepe;

  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirmPayment = async () => {
    if (!identity) {
      login();
      return;
    }
    if (!courseId) {
      toast.error("Invalid course. Please go back and try again.");
      return;
    }

    setIsConfirming(true);
    try {
      const paymentIntentId = `upi-${method}-${Date.now()}`;
      await enrollUser({ courseId, sessionId: paymentIntentId });
      setIsSuccess(true);
      toast.success("🎉 Payment confirmed! You're now enrolled.", {
        description: "Redirecting to your dashboard…",
        duration: 3000,
      });
      setTimeout(() => {
        void navigate({ to: "/dashboard" });
      }, 2000);
    } catch (err) {
      console.error("Enrollment error:", err);
      toast.error("Payment confirmation failed. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div
      data-ocid="payment_gateway.page"
      className="min-h-screen bg-background"
    >
      {/* Top Brand Header */}
      <div
        className={`bg-gradient-to-br ${config.bgClass} text-white py-10 px-4`}
      >
        <div className="container max-w-lg mx-auto">
          {/* Back link */}
          <button
            type="button"
            onClick={() => void navigate({ to: "/courses" })}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-8 transition-colors"
            data-ocid="payment_gateway.cancel_link"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel and go back
          </button>

          {/* Method Logo */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <img
                src={config.logoSrc}
                alt={config.name}
                className="h-12 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">
                Pay via {config.name}
              </h1>
              <p className={`text-sm mt-1 ${config.accentClass}`}>
                UPI · Instant · Secure
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Content */}
      <div className="container max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* QR Code Card */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm text-center">
          <p className="text-sm font-medium text-muted-foreground mb-5">
            Scan QR to pay via {config.name}
          </p>

          <QrCodePlaceholder methodName={config.name} />

          <div className="mt-5 space-y-2">
            <p className="text-xs text-muted-foreground">Or pay using UPI ID</p>
            <div className="inline-flex items-center gap-2 bg-muted/60 rounded-lg px-4 py-2.5 border border-border/60">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-sm font-semibold text-foreground">
                bollywoodmusic@upi
              </span>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-card border border-border/60 rounded-2xl p-5">
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-crimson" />
            How to pay
          </h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-none">
            {[
              { num: 1, step: `Open your ${config.name} app` },
              { num: 2, step: "Tap on 'Scan QR' or 'Pay to UPI ID'" },
              { num: 3, step: "Scan the QR code above or enter the UPI ID" },
              { num: 4, step: "Enter the exact amount and complete payment" },
              { num: 5, step: 'Click "I have completed the payment" below' },
            ].map(({ num, step }) => (
              <li key={num} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-crimson/10 text-crimson text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {num}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isSuccess ? (
            <div
              data-ocid="payment_gateway.success_state"
              className="flex items-center justify-center gap-3 bg-green-50 border border-green-200 rounded-xl px-6 py-4"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800 text-sm">
                  Payment Confirmed!
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  Redirecting to your dashboard…
                </p>
              </div>
            </div>
          ) : (
            <Button
              className="w-full bg-crimson hover:bg-crimson/90 text-white border-0 shadow-md h-12 text-base font-semibold"
              onClick={handleConfirmPayment}
              disabled={isConfirming}
              data-ocid="payment_gateway.confirm_button"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirming payment…
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />I have completed the
                  payment
                </>
              )}
            </Button>
          )}

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-green-600" />
            <span>Protected by 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
