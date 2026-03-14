import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "@tanstack/react-router";
import { LogOut, Menu, Music2, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCallerAdmin } from "../hooks/useQueries";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const location = useLocation();
  const { data: isAdmin } = useIsCallerAdmin();
  const isAuthenticated = !!identity;

  const navLinks = [
    { to: "/courses", label: "Courses", ocid: "nav.courses_link" },
    ...(isAuthenticated
      ? [{ to: "/dashboard", label: "Dashboard", ocid: "nav.dashboard_link" }]
      : []),
    ...(isAdmin
      ? [{ to: "/admin", label: "Admin", ocid: "nav.admin_link" }]
      : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 backdrop-blur-md bg-background/90">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-crimson flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
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

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid={link.ocid}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-primary/10 text-crimson"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-9 px-3"
                    data-ocid="nav.profile_link"
                  >
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="bg-crimson text-white text-xs font-bold">
                        {identity
                          .getPrincipal()
                          .toString()
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => clear()}
                    className="text-destructive flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => login()}
                disabled={isLoggingIn || isInitializing}
                size="sm"
                className="bg-crimson hover:bg-crimson/90 text-white border-0 shadow-sm"
                data-ocid="nav.login_button"
              >
                {isLoggingIn ? "Signing in…" : "Sign In"}
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/60 bg-background"
          >
            <div className="container px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  data-ocid={link.ocid}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? "bg-primary/10 text-crimson"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border/60">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2.5 rounded-lg text-sm hover:bg-muted"
                      data-ocid="nav.profile_link"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        clear();
                        setIsOpen(false);
                      }}
                      className="px-4 py-2.5 rounded-lg text-sm text-destructive hover:bg-muted text-left"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      login();
                      setIsOpen(false);
                    }}
                    disabled={isLoggingIn || isInitializing}
                    className="w-full bg-crimson hover:bg-crimson/90 text-white"
                    data-ocid="nav.login_button"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
