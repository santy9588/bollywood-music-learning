import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { CourseCategory } from "../backend.d";
import { CourseCard } from "../components/CourseCard";
import { useGetAllCourses } from "../hooks/useQueries";

const TABS = [
  { value: "all", label: "All Courses" },
  { value: CourseCategory.vocals, label: "🎤 Vocals" },
  { value: CourseCategory.instruments, label: "🥁 Instruments" },
  { value: CourseCategory.dance, label: "💃 Dance" },
  { value: CourseCategory.theory, label: "🎵 Theory" },
];

export function CoursesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { data: courses, isLoading } = useGetAllCourses();

  const filtered = (courses ?? []).filter((c) => {
    const matchesCategory = category === "all" || c.category === category;
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bollywood-gradient text-white py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              All Courses
            </h1>
            <p className="text-white/70 text-lg">
              Discover your perfect Bollywood music learning path
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, instructors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-ocid="courses.search_input"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="w-4 h-4" />
            <span>{filtered.length} courses</span>
          </div>
        </div>

        <Tabs value={category} onValueChange={setCategory} className="mb-8">
          <TabsList className="bg-muted/60 p-1 flex-wrap h-auto gap-1">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                data-ocid="courses.category_tab"
                className="data-[state=active]:bg-crimson data-[state=active]:text-white rounded-md"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(["a", "b", "c", "d"] as const).map((k) => (
              <div
                key={k}
                className="rounded-xl overflow-hidden border border-border/60"
              >
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-9 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24" data-ocid="courses.empty_state">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-display text-xl font-bold mb-2">
              No courses found
            </h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                data-ocid={`courses.item.${i + 1}` as never}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
