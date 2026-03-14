import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Clock,
  Loader2,
  Play,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Lesson } from "../backend.d";
import { AuthGuard } from "../components/AuthGuard";

import {
  useGetCourse,
  useGetCourseProgress,
  useGetLessonsForCourse,
  useUpdateLessonProgress,
} from "../hooks/useQueries";

function CoursePlayerContent() {
  const { courseId } = useParams({ from: "/learn/$courseId" });
  const { data: course, isLoading: courseLoading } = useGetCourse(courseId);
  const { data: lessons, isLoading: lessonsLoading } =
    useGetLessonsForCourse(courseId);
  const { data: progress } = useGetCourseProgress(courseId);
  const { mutateAsync: markComplete, isPending } = useUpdateLessonProgress();

  const sortedLessons = (lessons ?? [])
    .slice()
    .sort((a, b) => Number(a.orderIndex) - Number(b.orderIndex));

  const completedIds = new Set(progress?.completedLessonIds ?? []);
  const completedCount = completedIds.size;
  const totalCount = sortedLessons.length;
  const pct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const currentLesson =
    activeLesson ??
    sortedLessons.find((l) => !completedIds.has(l.id)) ??
    sortedLessons[0] ??
    null;

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    if (completedIds.has(currentLesson.id)) {
      toast.info("Lesson already completed");
      return;
    }
    try {
      await markComplete({ courseId, lessonId: currentLesson.id });
      toast.success("Lesson marked as complete! 🎉");
      // Auto-advance
      const currentIdx = sortedLessons.findIndex(
        (l) => l.id === currentLesson.id,
      );
      if (currentIdx < sortedLessons.length - 1) {
        setActiveLesson(sortedLessons[currentIdx + 1]);
      }
    } catch {
      toast.error("Failed to update progress.");
    }
  };

  if (courseLoading || lessonsLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-72 border-r border-border/60 p-4 space-y-2">
          {(["a", "b", "c", "d", "e"] as const).map((k) => (
            <Skeleton key={k} className="h-12 rounded-lg" />
          ))}
        </div>
        <div className="flex-1 p-8 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 border-r border-border/60 bg-card flex flex-col">
        <div className="p-4 border-b border-border/60">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h2 className="font-display font-bold text-sm line-clamp-2 mb-3">
            {course?.title}
          </h2>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {completedCount}/{totalCount} lessons
              </span>
              <span className="font-semibold text-foreground">{pct}%</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        </div>

        <ScrollArea className="flex-1" data-ocid="learn.lesson_list">
          <ul className="p-2 space-y-1">
            {sortedLessons.map((lesson, i) => {
              const isCompleted = completedIds.has(lesson.id);
              const isActive =
                currentLesson?.id === lesson.id && !activeLesson
                  ? !completedIds.has(lesson.id)
                  : activeLesson?.id === lesson.id ||
                    currentLesson?.id === lesson.id;

              return (
                <li key={lesson.id} data-ocid={`learn.lesson_item.${i + 1}`}>
                  <button
                    type="button"
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs transition-colors ${
                      isActive
                        ? "bg-crimson/10 text-crimson"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span className="mt-0.5 flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </span>
                    <span className="line-clamp-2 font-medium">
                      {i + 1}. {lesson.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </aside>

      {/* Main Player */}
      <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-10">
        {currentLesson ? (
          <motion.div
            key={currentLesson.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <span>
                Lesson{" "}
                {sortedLessons.findIndex((l) => l.id === currentLesson.id) + 1}
              </span>
              <span>•</span>
              <Clock className="w-3.5 h-3.5" />
              <span>{String(currentLesson.durationMinutes)} min</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-4">
              {currentLesson.title}
            </h1>

            {/* Video Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-border/60 overflow-hidden shadow-lg">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 hover:bg-white/20 transition-colors cursor-pointer">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
                <p className="text-white/60 text-sm">
                  Video lesson coming soon
                </p>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8">
              {currentLesson.description}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {completedIds.has(currentLesson.id) ? (
                <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </div>
              ) : (
                <Button
                  onClick={handleMarkComplete}
                  disabled={isPending}
                  className="bg-crimson hover:bg-crimson/90 text-white border-0"
                  data-ocid="learn.complete_button"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </>
                  )}
                </Button>
              )}

              {/* Next lesson */}
              {(() => {
                const idx = sortedLessons.findIndex(
                  (l) => l.id === currentLesson.id,
                );
                const next = sortedLessons[idx + 1];
                if (!next) return null;
                return (
                  <Button
                    variant="outline"
                    onClick={() => setActiveLesson(next)}
                    size="sm"
                  >
                    Next Lesson →
                  </Button>
                );
              })()}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="font-display text-2xl font-bold mb-2">
              Course Complete!
            </h2>
            <p className="text-muted-foreground mb-6">
              Congratulations on completing this course.
            </p>
            <Link to="/dashboard">
              <Button className="bg-crimson hover:bg-crimson/90 text-white border-0">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export function CoursePlayerPage() {
  return (
    <AuthGuard>
      <CoursePlayerContent />
    </AuthGuard>
  );
}
