import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import { AuthGuard } from "../components/AuthGuard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetUserProfile, useSaveUserProfile } from "../hooks/useQueries";

function ProfileContent() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetUserProfile();
  const { mutateAsync: saveProfile, isPending } = useSaveUserProfile();

  const [form, setForm] = useState<UserProfile>({
    name: "",
    email: "",
    bio: "",
    role: "user",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        email: profile.email ?? "",
        bio: profile.bio ?? "",
        role: profile.role ?? "user",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await saveProfile(form);
      toast.success("Profile saved successfully!");
    } catch {
      toast.error("Failed to save profile.");
    }
  };

  const initials = form.name
    ? form.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (identity?.getPrincipal().toString().slice(0, 2).toUpperCase() ?? "??");

  return (
    <div className="min-h-screen bg-background">
      <div className="bollywood-gradient text-white py-12">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-1">
              Your Profile
            </h1>
            <p className="text-white/70">
              Manage your account details and preferences
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8"
        >
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-crimson text-white text-xl font-bold font-display">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-display font-bold text-lg">
                {form.name || "Your Name"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {identity?.getPrincipal().toString().slice(0, 24)}…
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Your full name"
                  data-ocid="profile.name_input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="your@email.com"
                  data-ocid="profile.email_input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  placeholder="Tell us about your musical journey…"
                  rows={4}
                  data-ocid="profile.bio_textarea"
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSave}
                  disabled={isPending}
                  className="bg-crimson hover:bg-crimson/90 text-white border-0"
                  data-ocid="profile.save_button"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
