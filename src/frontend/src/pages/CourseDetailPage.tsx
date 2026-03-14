import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  Star,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../components/CourseCard";
import { PaymentMethodSelector } from "../components/PaymentMethodSelector";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreatePaymentSession,
  useGetCourse,
  useGetLessonsForCourse,
  useGetUserEnrollments,
} from "../hooks/useQueries";

export function CourseDetailPage() {
  const { id } = useParams({ from: "/courses/$id" });
  const { identity, login } = useInternetIdentity();
  const { data: course, isLoading } = useGetCourse(id);
  const { data: lessons, isLoading: lessonsLoading } =
    useGetLessonsForCourse(id);
  const { data: enrollments } = useGetUserEnrollments();
  const { mutateAsync: createSession, isPending } = useCreatePaymentSession();

  const [paymentSelectorOpen, setPaymentSelectorOpen] = useState(false);

  const isEnrolled = enrollments?.some((e) => e.courseId === id);

  const totalMinutes =
    lessons?.reduce((acc, l) => acc + Number(l.durationMinutes), 0) ?? 0;

  const handleEnroll = () => {
    if (!identity) {
      login();
      return;
    }
    setPaymentSelectorOpen(true);
  };

  const handleStripeCheckout = async () => {
    if (!id) return;
    try {
      const sessionUrl = await createSession(id);
      window.location.href = sessionUrl;
    } catch {
      toast.error("Failed to start payment. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-24 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">😔</div>
        <h2 className="font-display text-2xl font-bold mb-2">
          Course Not Found
        </h2>
        <p className="text-muted-foreground mb-6">
          This course doesn't exist or has been removed.
        </p>
        <Link to="/courses">
          <Button>Browse All Courses</Button>
        </Link>
      </div>
    );
  }

  const priceDisplay = `$${(Number(course.priceCents) / 100).toFixed(0)}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Hero Image */}
            <div className="rounded-2xl overflow-hidden h-64 sm:h-80">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full hero-gradient flex items-center justify-center">
                  <span className="text-7xl">🎶</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    CATEGORY_COLORS[course.category] ??
                    "bg-gray-100 text-gray-700"
                  }`}
                >
                  {CATEGORY_LABELS[course.category] ?? course.category}
                </span>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">4.8</span>
                  <span className="text-muted-foreground">(234 reviews)</span>
                </div>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                {course.title}
              </h1>

              <p className="text-muted-foreground leading-relaxed text-base mb-6">
                {course.description}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-crimson" />
                  <span>
                    Instructor:{" "}
                    <strong className="text-foreground">
                      {course.instructorName}
                    </strong>
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-crimson" />
                  <span>
                    <strong className="text-foreground">
                      {lessons?.length ?? 0}
                    </strong>{" "}
                    lessons
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-crimson" />
                  <span>
                    <strong className="text-foreground">{totalMinutes}</strong>{" "}
                    minutes total
                  </span>
                </span>
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <h2 className="font-display text-2xl font-bold mb-4">
                Course Curriculum
              </h2>
              {lessonsLoading ? (
                <div className="space-y-2">
                  {(["a", "b", "c", "d"] as const).map((k) => (
                    <Skeleton key={k} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <Accordion
                  type="multiple"
                  className="border border-border/60 rounded-xl overflow-hidden"
                  data-ocid="course_detail.lesson_accordion"
                >
                  {(lessons ?? []).map((lesson, i) => (
                    <AccordionItem
                      key={lesson.id}
                      value={lesson.id}
                      className="border-b border-border/60 last:border-0"
                    >
                      <AccordionTrigger className="px-5 py-4 text-sm font-medium hover:no-underline hover:bg-muted/30">
                        <div className="flex items-center gap-3 text-left">
                          <span className="w-6 h-6 rounded-full bg-crimson/10 text-crimson text-xs flex items-center justify-center font-bold flex-shrink-0">
                            {i + 1}
                          </span>
                          {lesson.title}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-5 pb-4">
                        <div className="ml-9">
                          <p className="text-sm text-muted-foreground mb-2">
                            {lesson.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {String(lesson.durationMinutes)} minutes
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </motion.div>

          {/* Sidebar / Enrollment Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
              <div className="text-3xl font-display font-bold text-foreground mb-1">
                {priceDisplay}
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                One-time payment · Lifetime access
              </p>

              {isEnrolled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Already Enrolled
                  </div>
                  <Link to="/learn/$courseId" params={{ courseId: id }}>
                    <Button className="w-full bg-crimson hover:bg-crimson/90 text-white border-0">
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  className="w-full bg-crimson hover:bg-crimson/90 text-white border-0 shadow-md mb-4"
                  size="lg"
                  onClick={handleEnroll}
                  disabled={isPending}
                  data-ocid="course_detail.enroll_button"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing…
                    </>
                  ) : !identity ? (
                    "Sign In to Enroll"
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Enroll Now — {priceDisplay}
                    </>
                  )}
                </Button>
              )}

              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {[
                  `${lessons?.length ?? 0} video lessons`,
                  `${totalMinutes} minutes of content`,
                  "Certificate of completion",
                  "Lifetime access",
                  "AI-powered feedback",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-border/60 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <CreditCard className="w-3.5 h-3.5" />
                  Multiple payment methods accepted
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Payment Method Selector Dialog */}
      <PaymentMethodSelector
        open={paymentSelectorOpen}
        onOpenChange={setPaymentSelectorOpen}
        courseId={id}
        priceDisplay={priceDisplay}
        onStripeCheckout={() => {
          setPaymentSelectorOpen(false);
          void handleStripeCheckout();
        }}
        isPending={isPending}
      />
    </div>
  );
}
