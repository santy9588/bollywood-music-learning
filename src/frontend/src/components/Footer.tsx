import { Link } from "@tanstack/react-router";
import { Heart, Music2 } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <footer className="border-t border-border/60 bg-card mt-auto">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-crimson flex items-center justify-center shadow-md">
                <Music2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-sm text-foreground">
                  Bollywood
                </span>
                <span className="font-body text-xs text-saffron font-semibold tracking-wider uppercase">
                  Music Learning
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Learn Bollywood music from world-class instructors with AI-powered
              guidance.
            </p>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-display font-semibold text-sm mb-4 text-foreground">
              Courses
            </h3>
            <ul className="space-y-2.5">
              {["Vocals", "Instruments", "Dance", "Theory"].map((cat) => (
                <li key={cat}>
                  <Link
                    to="/courses"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-display font-semibold text-sm mb-4 text-foreground">
              Platform
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Dashboard", to: "/dashboard" },
                { label: "Profile", to: "/profile" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h3 className="font-display font-semibold text-sm mb-4 text-foreground">
              Trust & Safety
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Payments secured by Stripe. Your data is protected on the Internet
              Computer blockchain.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {year} Bollywood Music Learning. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            Built with{" "}
            <Heart className="w-3.5 h-3.5 text-crimson fill-crimson" /> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-saffron hover:text-foreground transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
