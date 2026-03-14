import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { CreditCard, Loader2, Lock, Zap } from "lucide-react";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────

export interface PaymentMethodSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  priceDisplay: string;
  onStripeCheckout: () => void;
  isPending: boolean;
}

type PaymentMethodId =
  | "phonepe"
  | "paytm"
  | "googlepay"
  | "paypal"
  | "stripe"
  | "card";

interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  tagline: string;
  type: "upi" | "stripe";
  logoSrc?: string;
  bgColor: string;
  borderColor: string;
  selectedBg: string;
  selectedBorder: string;
  icon?: React.ReactNode;
}

// ─── Payment Methods Config ───────────────────────────────────────

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "phonepe",
    name: "PhonePe",
    tagline: "UPI instant transfer",
    type: "upi",
    logoSrc: "/assets/generated/phonepe-logo-transparent.dim_120x60.png",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    selectedBg: "bg-purple-50",
    selectedBorder: "border-purple-500 ring-2 ring-purple-300",
  },
  {
    id: "paytm",
    name: "Paytm",
    tagline: "Wallet & UPI payment",
    type: "upi",
    logoSrc: "/assets/generated/paytm-logo-transparent.dim_120x60.png",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    selectedBg: "bg-sky-50",
    selectedBorder: "border-sky-500 ring-2 ring-sky-300",
  },
  {
    id: "googlepay",
    name: "Google Pay",
    tagline: "Fast & secure checkout",
    type: "stripe",
    logoSrc: "/assets/generated/googlepay-logo-transparent.dim_120x60.png",
    bgColor: "bg-white",
    borderColor: "border-slate-200",
    selectedBg: "bg-slate-50",
    selectedBorder: "border-slate-500 ring-2 ring-slate-300",
  },
  {
    id: "paypal",
    name: "PayPal",
    tagline: "Buyer-protected payments",
    type: "stripe",
    logoSrc: "/assets/generated/paypal-logo-transparent.dim_120x60.png",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    selectedBg: "bg-blue-50",
    selectedBorder: "border-blue-600 ring-2 ring-blue-300",
  },
  {
    id: "stripe",
    name: "Stripe",
    tagline: "Global card processing",
    type: "stripe",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    selectedBg: "bg-indigo-50",
    selectedBorder: "border-indigo-600 ring-2 ring-indigo-300",
    icon: (
      <div className="flex items-center gap-1.5">
        <Zap className="w-5 h-5 text-indigo-600" />
        <span className="font-bold text-indigo-700 text-base tracking-tight">
          stripe
        </span>
      </div>
    ),
  },
  {
    id: "card",
    name: "Credit / Debit Card",
    tagline: "Visa, Mastercard & more",
    type: "stripe",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    selectedBg: "bg-slate-50",
    selectedBorder: "border-slate-600 ring-2 ring-slate-400",
    icon: (
      <div className="flex items-center gap-1.5">
        <CreditCard className="w-5 h-5 text-slate-600" />
        <span className="font-semibold text-slate-600 text-sm">VISA / MC</span>
      </div>
    ),
  },
];

// ─── Method Tile ──────────────────────────────────────────────────

function MethodTile({
  method,
  selected,
  onClick,
  index,
}: {
  method: PaymentMethod;
  selected: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={`payment_selector.method.item.${index}`}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "hover:scale-[1.03] hover:shadow-md active:scale-[0.99]",
        selected
          ? cn(method.selectedBg, method.selectedBorder, "shadow-sm")
          : cn("bg-card", method.borderColor, `hover:${method.bgColor}`),
      )}
      aria-pressed={selected}
      aria-label={`Pay with ${method.name}`}
    >
      {/* Selected indicator */}
      {selected && (
        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
          <svg
            viewBox="0 0 12 12"
            className="w-2.5 h-2.5 text-white"
            fill="currentColor"
            aria-hidden="true"
            role="img"
          >
            <title>Selected</title>
            <path
              d="M2 6l3 3 5-5"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      {/* Logo / Icon */}
      <div className="h-10 flex items-center justify-center">
        {method.logoSrc ? (
          <img
            src={method.logoSrc}
            alt={method.name}
            className="h-8 w-auto object-contain max-w-[100px]"
            loading="lazy"
          />
        ) : (
          method.icon
        )}
      </div>

      {/* Name & Tagline */}
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground leading-tight">
          {method.name}
        </p>
        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
          {method.tagline}
        </p>
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export function PaymentMethodSelector({
  open,
  onOpenChange,
  courseId,
  priceDisplay,
  onStripeCheckout,
  isPending,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId | null>(
    null,
  );
  const navigate = useNavigate();

  const handlePayNow = async () => {
    if (!selectedMethod) return;

    const method = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
    if (!method) return;

    if (method.type === "upi") {
      // Navigate to UPI gateway page
      await navigate({
        to: "/payment-gateway",
        search: { method: selectedMethod, courseId },
      });
      onOpenChange(false);
    } else {
      // All Stripe-powered methods
      onStripeCheckout();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg w-full p-0 overflow-hidden rounded-2xl"
        data-ocid="payment_selector.dialog"
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <DialogTitle className="font-display text-xl font-bold text-foreground">
            Choose Payment Method
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Enrolling for{" "}
            <span className="font-semibold text-foreground">
              {priceDisplay}
            </span>{" "}
            — secure checkout
          </p>
        </DialogHeader>

        {/* Method Grid */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PAYMENT_METHODS.map((method, i) => (
              <MethodTile
                key={method.id}
                method={method}
                selected={selectedMethod === method.id}
                onClick={() => setSelectedMethod(method.id)}
                index={i + 1}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 space-y-3">
          {/* Pay Button */}
          <Button
            className="w-full bg-crimson hover:bg-crimson/90 text-white border-0 shadow-md h-11 text-base font-semibold"
            onClick={handlePayNow}
            disabled={!selectedMethod || isPending}
            data-ocid="payment_selector.pay_button"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing…
              </>
            ) : (
              `Pay ${priceDisplay} Now`
            )}
          </Button>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-green-600" />
            <span>Secured by 256-bit SSL encryption</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
