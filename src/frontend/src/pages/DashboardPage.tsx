import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  Music2,
  Play,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { AuthGuard } from "../components/AuthGuard";
import { CourseCard } from "../components/CourseCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  SEED_COURSES,
  useGetAllCourses,
  useGetCourseProgress,
  useGetCourseRecommendations,
  useGetUserEnrollments,
  useGetUserProfile,
} from "../hooks/useQueries";

function EnrolledCourseCard({
  courseId,
  index,
}: {
  courseId: string;
  index: number;
}) {
  const { data: allCourses } = useGetAllCourses();
  const { data: progress } = useGetCourseProgress(courseId);

  const course =
    allCourses?.find((c) => c.id === courseId) ??
    SEED_COURSES.find((c) => c.id === courseId);

  if (!course) return null;

  const totalLessons = course.lessonIds.length;
  const completed = progress?.completedLessonIds?.length ?? 0;
  const pct =
    totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

  const statusLabel = pct === 0 ? "Start" : pct === 100 ? "Review" : "Continue";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_16px_40px_oklch(0.42_0.19_18_/_0.14)] transition-all duration-300"
      data-ocid="dashboard.enrolled_courses_section"
    >
      {/* Thumbnail with progress overlay */}
      <div className="relative h-40 overflow-hidden">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full hero-gradient" />
        )}
        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Progress overlay on bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
          <div className="flex items-center justify-between text-white text-xs mb-1.5 font-medium">
            <span className="opacity-80">
              {completed}/{totalLessons} lessons
            </span>
            <span className="font-bold text-amber-300">{pct}%</span>
          </div>
          <Progress
            value={pct}
            className="h-1 bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-orange-400"
          />
        </div>

        {/* Status chip */}
        {pct > 0 && pct < 100 && (
          <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            In Progress
          </div>
        )}
        {pct === 100 && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            ✓ Complete
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-display font-bold text-sm line-clamp-1 mb-0.5">
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          {course.instructorName}
        </p>
        <Link to="/learn/$courseId" params={{ courseId }}>
          <Button
            size="sm"
            className="w-full bg-crimson hover:bg-crimson/85 text-white border-0 font-semibold gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            {statusLabel}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

function DashboardContent() {
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetUserProfile();
  const { data: enrollments, isLoading: enrollLoading } =
    useGetUserEnrollments();
  const { data: recommendations, isLoading: recLoading } =
    useGetCourseRecommendations();

  const enrolledCourseIds = enrollments?.map((e) => e.courseId) ?? [];
  const principalShort = identity?.getPrincipal().toString().slice(0, 10);
  const displayName =
    profile?.name ||
    (principalShort ? `${principalShort}…` : undefined) ||
    "Musician";

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Immersive banner ── */}
      <div className="dashboard-banner text-white pt-12 pb-16 px-0">
        {/* Decorative musical notes */}
        <div className="absolute top-4 right-8 text-white/5 text-8xl font-display select-none pointer-events-none">
          ♪
        </div>
        <div className="absolute bottom-4 right-32 text-white/5 text-5xl font-display select-none pointer-events-none">
          ♫
        </div>

        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              {/* Left: Greeting */}
              <div>
                <p className="text-amber-300/80 text-sm font-medium uppercase tracking-widest mb-2">
                  {greeting}
                </p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold mb-1.5">
                  {displayName}
                </h1>
                <p className="text-white/50 text-sm">
                  Keep up the music — your next lesson is waiting.
                </p>
              </div>

              {/* Right: Quick stats */}
              <div className="flex items-center gap-3">
                <div className="stat-chip rounded-xl px-5 py-3 text-center min-w-[90px]">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <div className="text-xl font-display font-bold text-white">
                    {enrolledCourseIds.length}
                  </div>
                  <div className="text-xs text-white/50">Enrolled</div>
                </div>
                <div className="stat-chip rounded-xl px-5 py-3 text-center min-w-[90px]">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <div className="text-xl font-display font-bold text-white">
                    {enrolledCourseIds.length > 0 ? "Active" : "Start"}
                  </div>
                  <div className="text-xs text-white/50">Status</div>
                </div>
                <div className="stat-chip rounded-xl px-5 py-3 text-center min-w-[90px]">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Music2 className="w-3.5 h-3.5 text-saffron" />
                  </div>
                  <div className="text-xl font-display font-bold text-white">
                    4.9★
                  </div>
                  <div className="text-xs text-white/50">Platform</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-14">
        {/* ── My Courses ── */}
        <section data-ocid="dashboard.enrolled_courses_section">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-crimson/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-crimson" />
              </div>
              <h2 className="font-display text-xl font-bold">My Courses</h2>
              {enrolledCourseIds.length > 0 && (
                <span className="text-xs bg-crimson/10 text-crimson border border-crimson/20 px-2 py-0.5 rounded-full font-semibold">
                  {enrolledCourseIds.length}
                </span>
              )}
            </div>
            {enrolledCourseIds.length > 0 && (
              <Link
                to="/courses"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Browse more →
              </Link>
            )}
          </div>

          {enrollLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(["a", "b", "c"] as const).map((k) => (
                <Skeleton key={k} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : enrolledCourseIds.length === 0 ? (
            <div
              className="text-center py-16 border border-dashed border-border rounded-2xl bg-muted/20"
              data-ocid="dashboard.enrolled_courses_section"
            >
              <GraduationCap className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg mb-1.5">
                No courses enrolled yet
              </h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                Start your Bollywood music journey by enrolling in your first
                course.
              </p>
              <Link to="/courses">
                <Button className="bg-crimson hover:bg-crimson/90 text-white border-0 px-8">
                  Browse Courses
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {enrolledCourseIds.map((courseId, i) => (
                <EnrolledCourseCard
                  key={courseId}
                  courseId={courseId}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── AI Recommendations ── */}
        <section data-ocid="dashboard.recommendations_section">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="font-display text-xl font-bold">
              Recommended for You
            </h2>
            <span className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold">
              AI-Powered
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-6 ml-11">
            Personalized picks based on your learning progress
          </p>

          {recLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(["a", "b", "c"] as const).map((k) => (
                <Skeleton key={k} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(recommendations ?? [])
                .filter((c) => !enrolledCourseIds.includes(c.id))
                .slice(0, 3)
                .map((course, i) => (
                  <CourseCard key={course.id} course={course} index={i} />
                ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
