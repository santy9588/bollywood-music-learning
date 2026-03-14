import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Edit,
  Loader2,
  Plus,
  ShieldAlert,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Course } from "../backend.d";
import { CourseCategory } from "../backend.d";
import { AuthGuard } from "../components/AuthGuard";
import { CATEGORY_LABELS } from "../components/CourseCard";
import {
  SEED_COURSES,
  useCreateOrUpdateCourse,
  useDeleteCourse,
  useGetAllCourses,
  useGetAllEnrollments,
  useIsCallerAdmin,
} from "../hooks/useQueries";

const EMPTY_COURSE: Omit<Course, "id" | "createdTimestamp" | "lessonIds"> = {
  title: "",
  description: "",
  instructorName: "",
  category: CourseCategory.vocals,
  priceCents: BigInt(2900),
  thumbnailUrl: "",
};

function AdminContent() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: courses, isLoading: coursesLoading } = useGetAllCourses();
  const { data: enrollments, isLoading: enrollLoading } =
    useGetAllEnrollments();
  const { mutateAsync: createOrUpdate, isPending: saving } =
    useCreateOrUpdateCourse();
  const { mutateAsync: deleteCourse, isPending: deleting } = useDeleteCourse();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<typeof EMPTY_COURSE>({ ...EMPTY_COURSE });

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-sm px-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="font-display text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground text-sm">
            You don't have admin permissions to access this page.
          </p>
          <Link to="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const openAdd = () => {
    setEditingCourse(null);
    setForm({ ...EMPTY_COURSE });
    setDialogOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({
      title: course.title,
      description: course.description,
      instructorName: course.instructorName,
      category: course.category,
      priceCents: course.priceCents,
      thumbnailUrl: course.thumbnailUrl,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Course title is required");
      return;
    }
    const course: Course = {
      id: editingCourse?.id ?? `course-${Date.now()}`,
      createdTimestamp: editingCourse?.createdTimestamp ?? BigInt(Date.now()),
      lessonIds: editingCourse?.lessonIds ?? [],
      ...form,
    };
    try {
      await createOrUpdate(course);
      toast.success(editingCourse ? "Course updated!" : "Course created!");
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save course.");
    }
  };

  const handleDelete = async (courseId: string) => {
    try {
      await deleteCourse(courseId);
      toast.success("Course deleted.");
    } catch {
      toast.error("Failed to delete course.");
    }
  };

  const displayCourses = courses ?? SEED_COURSES;

  return (
    <div className="min-h-screen bg-background">
      <div className="bollywood-gradient text-white py-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-1">
            Admin Dashboard
          </h1>
          <p className="text-white/70">
            Manage courses, enrollments, and platform settings
          </p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/60 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-crimson/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-crimson" />
              </div>
              <span className="text-sm text-muted-foreground">
                Total Courses
              </span>
            </div>
            <div className="font-display text-3xl font-bold">
              {coursesLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                displayCourses.length
              )}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="bg-card border border-border/60 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-700" />
              </div>
              <span className="text-sm text-muted-foreground">
                Total Enrollments
              </span>
            </div>
            <div className="font-display text-3xl font-bold">
              {enrollLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                (enrollments?.length ?? 0)
              )}
            </div>
          </motion.div>
        </div>

        {/* Courses Table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Courses</h2>
            <Button
              onClick={openAdd}
              className="bg-crimson hover:bg-crimson/90 text-white border-0"
              data-ocid="admin.add_course_button"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Course
            </Button>
          </div>

          <div
            className="border border-border/60 rounded-xl overflow-hidden"
            data-ocid="admin.course_table"
          >
            {coursesLoading ? (
              <div className="p-4 space-y-2">
                {(["a", "b", "c", "d"] as const).map((k) => (
                  <Skeleton key={k} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold">Course</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Instructor</TableHead>
                    <TableHead className="font-semibold">Price</TableHead>
                    <TableHead className="font-semibold">Lessons</TableHead>
                    <TableHead className="font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayCourses.map((course, i) => (
                    <TableRow key={course.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium max-w-xs">
                        <span className="line-clamp-1">{course.title}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium"
                        >
                          {CATEGORY_LABELS[course.category] ?? course.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {course.instructorName}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${(Number(course.priceCents) / 100).toFixed(0)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {course.lessonIds.length}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(course)}
                            data-ocid={`admin.edit_button.${i + 1}`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                data-ocid={`admin.delete_button.${i + 1}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Course?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{course.title}"
                                  and all its data. This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-ocid="admin.cancel_button">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(course.id)}
                                  className="bg-destructive text-white hover:bg-destructive/90"
                                  data-ocid="admin.confirm_button"
                                >
                                  {deleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    "Delete"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>

        {/* Enrollments */}
        <section>
          <h2 className="font-display text-xl font-bold mb-4">
            Recent Enrollments
          </h2>
          <div className="border border-border/60 rounded-xl overflow-hidden">
            {enrollLoading ? (
              <div className="p-4 space-y-2">
                {(["a", "b", "c"] as const).map((k) => (
                  <Skeleton key={k} className="h-10 w-full" />
                ))}
              </div>
            ) : !enrollments || enrollments.length === 0 ? (
              <div
                className="text-center py-10 text-muted-foreground text-sm"
                data-ocid="admin.empty_state"
              >
                No enrollments yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold">Course ID</TableHead>
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Enrolled At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.slice(0, 10).map((enr) => (
                    <TableRow key={`${enr.userId}-${enr.courseId}`}>
                      <TableCell className="font-mono text-xs">
                        {enr.courseId}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {enr.userId.toString().slice(0, 16)}…
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            enr.paymentStatus === "completed"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-amber-100 text-amber-700 border-amber-200"
                          }
                          variant="outline"
                        >
                          {enr.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(
                          Number(enr.enrolledAt) / 1_000_000,
                        ).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>
      </div>

      {/* Add/Edit Course Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="sm:max-w-lg"
          data-ocid="admin.add_course_dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingCourse ? "Edit Course" : "Add New Course"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Course Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Bollywood Vocals Mastery"
                data-ocid="admin.course_title_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Course description…"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Instructor</Label>
                <Input
                  value={form.instructorName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, instructorName: e.target.value }))
                  }
                  placeholder="Instructor name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, category: v as CourseCategory }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CourseCategory).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat] ?? cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Price (in cents)</Label>
              <Input
                type="number"
                value={Number(form.priceCents)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    priceCents: BigInt(e.target.value || "0"),
                  }))
                }
                placeholder="e.g. 4900 = $49"
              />
              <p className="text-xs text-muted-foreground">
                ${(Number(form.priceCents) / 100).toFixed(2)} USD
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Thumbnail URL</Label>
              <Input
                value={form.thumbnailUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))
                }
                placeholder="https://…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-crimson hover:bg-crimson/90 text-white border-0"
              data-ocid="admin.course_submit_button"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : editingCourse ? (
                "Update Course"
              ) : (
                "Create Course"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AdminPage() {
  return (
    <AuthGuard>
      <AdminContent />
    </AuthGuard>
  );
}
