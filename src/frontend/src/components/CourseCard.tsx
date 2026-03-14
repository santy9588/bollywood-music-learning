import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Clock, Star, User } from "lucide-react";
import { motion } from "motion/react";
import type { Course } from "../backend.d";
import { CourseCategory } from "../backend.d";

const CATEGORY_COLORS: Record<CourseCategory, string> = {
  [CourseCategory.vocals]: "bg-red-100 text-red-700 border-red-200",
  [CourseCategory.instruments]: "bg-amber-100 text-amber-700 border-amber-200",
  [CourseCategory.dance]: "bg-pink-100 text-pink-700 border-pink-200",
  [CourseCategory.theory]: "bg-blue-100 text-blue-700 border-blue-200",
};

const CATEGORY_LABELS: Record<CourseCategory, string> = {
  [CourseCategory.vocals]: "🎤 Vocals",
  [CourseCategory.instruments]: "🥁 Instruments",
  [CourseCategory.dance]: "💃 Dance",
  [CourseCategory.theory]: "🎵 Theory",
};

// Gold accent strip gradient per category — visible on hover
const CATEGORY_STRIP: Record<CourseCategory, string> = {
  [CourseCategory.vocals]: "from-red-500 via-amber-400 to-yellow-300",
  [CourseCategory.instruments]: "from-amber-500 via-yellow-400 to-orange-300",
  [CourseCategory.dance]: "from-pink-500 via-rose-400 to-amber-300",
  [CourseCategory.theory]: "from-blue-500 via-indigo-400 to-purple-300",
};

interface CourseCardProps {
  course: Course;
  index?: number;
  "data-ocid"?: string;
}

export function CourseCard({
  course,
  index = 0,
  "data-ocid": ocid,
}: CourseCardProps) {
  const priceDisplay = `$${(Number(course.priceCents) / 100).toFixed(0)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      data-ocid={ocid}
      className="h-full"
    >
      <div className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 h-full flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_oklch(0.42_0.19_18_/_0.2)] hover:border-amber-300/60">
        {/* Gold accent strip — slides in from top on hover */}
        <div
          className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
            CATEGORY_STRIP[course.category] ?? "from-amber-400 to-yellow-300"
          } opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}
        />

        {/* Thumbnail */}
        <div className="relative overflow-hidden h-48 flex-shrink-0">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full hero-gradient flex items-center justify-center">
              <span className="text-5xl">🎶</span>
            </div>
          )}
          {/* Subtle gradient overlay so badges are always readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${
                CATEGORY_COLORS[course.category] ??
                "bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              {CATEGORY_LABELS[course.category] ?? course.category}
            </span>
          </div>

          {/* Price badge — gold gradient */}
          <div className="absolute top-3 right-3">
            <span className="gold-badge text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              {priceDisplay}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 gap-0">
          <h3 className="font-display font-bold text-base text-foreground line-clamp-2 leading-snug group-hover:text-crimson transition-colors duration-200 mb-2">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1 mb-4">
            {course.description}
          </p>

          {/* Divider */}
          <div className="border-t border-border/50 pt-3 mb-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-crimson/60" />
                <span className="font-medium text-foreground/70">
                  {course.instructorName}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {course.lessonIds.length} lessons
              </span>
              <span className="flex items-center gap-1 ml-auto">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-foreground">4.8</span>
              </span>
            </div>
          </div>

          <Link to="/courses/$id" params={{ id: course.id }}>
            <Button
              className="w-full bg-crimson hover:bg-crimson/85 text-white border-0 font-semibold transition-all duration-200 group-hover:shadow-md group-hover:shadow-crimson/25"
              size="sm"
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export { CATEGORY_LABELS, CATEGORY_COLORS };
