import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-crimson/10 flex items-center justify-center mx-auto animate-pulse">
            <Lock className="w-6 h-6 text-crimson" />
          </div>
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-sm mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-crimson/10 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-crimson" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold mb-2">
              Sign In Required
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You need to be signed in to access this page. Sign in to continue
              your Bollywood music journey.
            </p>
          </div>
          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="bg-crimson hover:bg-crimson/90 text-white border-0 w-full"
          >
            {isLoggingIn ? "Signing in…" : "Sign In to Continue"}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
