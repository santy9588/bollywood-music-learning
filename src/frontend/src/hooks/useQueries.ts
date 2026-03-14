import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Course,
  Enrollment,
  Lesson,
  Progress,
  UserProfile,
} from "../backend.d";
import { CourseCategory } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ─── Seed Data ──────────────────────────────────────────────────
export const SEED_COURSES: Course[] = [
  {
    id: "seed-1",
    title: "Bollywood Vocals Mastery",
    description:
      "Master the art of Bollywood singing from fundamentals to advanced techniques. Learn classical and contemporary Bollywood vocal styles with AI-guided feedback.",
    category: CourseCategory.vocals,
    priceCents: BigInt(4900),
    instructorName: "Priya Sharma",
    thumbnailUrl: "/assets/generated/course-vocals.dim_600x400.jpg",
    lessonIds: ["l1-1", "l1-2", "l1-3", "l1-4", "l1-5"],
    createdTimestamp: BigInt(Date.now()),
  },
  {
    id: "seed-2",
    title: "Tabla & Harmonium Fundamentals",
    description:
      "Learn to play the iconic tabla and harmonium, the backbone of Bollywood music. From basic rhythms to complex compositions.",
    category: CourseCategory.instruments,
    priceCents: BigInt(3900),
    instructorName: "Ravi Kumar",
    thumbnailUrl: "/assets/generated/course-instruments.dim_600x400.jpg",
    lessonIds: ["l2-1", "l2-2", "l2-3", "l2-4"],
    createdTimestamp: BigInt(Date.now()),
  },
  {
    id: "seed-3",
    title: "Bollywood Dance Basics",
    description:
      "Discover the vibrant world of Bollywood dance. Learn iconic moves, expressions, and choreography from classic and modern films.",
    category: CourseCategory.dance,
    priceCents: BigInt(2900),
    instructorName: "Meera Patel",
    thumbnailUrl: "/assets/generated/course-dance.dim_600x400.jpg",
    lessonIds: ["l3-1", "l3-2", "l3-3"],
    createdTimestamp: BigInt(Date.now()),
  },
  {
    id: "seed-4",
    title: "Bollywood Music Theory",
    description:
      "Understand the theory behind Bollywood music — ragas, talas, chord progressions, and how film composers craft unforgettable scores.",
    category: CourseCategory.theory,
    priceCents: BigInt(1900),
    instructorName: "Arjun Singh",
    thumbnailUrl: "/assets/generated/course-theory.dim_600x400.jpg",
    lessonIds: ["l4-1", "l4-2", "l4-3", "l4-4"],
    createdTimestamp: BigInt(Date.now()),
  },
];

export const SEED_LESSONS: Lesson[] = [
  // Vocals
  {
    id: "l1-1",
    courseId: "seed-1",
    title: "Introduction to Bollywood Vocals",
    description: "Overview of Bollywood vocal styles and techniques",
    contentUrl: "",
    durationMinutes: BigInt(15),
    orderIndex: BigInt(1),
  },
  {
    id: "l1-2",
    courseId: "seed-1",
    title: "Sa Re Ga Ma — Scale Fundamentals",
    description: "Indian sargam and its connection to Bollywood music",
    contentUrl: "",
    durationMinutes: BigInt(20),
    orderIndex: BigInt(2),
  },
  {
    id: "l1-3",
    courseId: "seed-1",
    title: "Breath Control & Projection",
    description: "Master diaphragmatic breathing for powerful singing",
    contentUrl: "",
    durationMinutes: BigInt(25),
    orderIndex: BigInt(3),
  },
  {
    id: "l1-4",
    courseId: "seed-1",
    title: "Iconic Song Analysis: Kal Ho Na Ho",
    description: "Dissect the vocal techniques in this classic",
    contentUrl: "",
    durationMinutes: BigInt(30),
    orderIndex: BigInt(4),
  },
  {
    id: "l1-5",
    courseId: "seed-1",
    title: "Recording Your First Cover",
    description: "Studio techniques for aspiring singers",
    contentUrl: "",
    durationMinutes: BigInt(35),
    orderIndex: BigInt(5),
  },
  // Instruments
  {
    id: "l2-1",
    courseId: "seed-2",
    title: "Tabla: History & Basics",
    description: "The tabla's origins and fundamental strokes",
    contentUrl: "",
    durationMinutes: BigInt(20),
    orderIndex: BigInt(1),
  },
  {
    id: "l2-2",
    courseId: "seed-2",
    title: "Harmonium Scales & Chords",
    description: "Playing sargam and basic chord progressions",
    contentUrl: "",
    durationMinutes: BigInt(25),
    orderIndex: BigInt(2),
  },
  {
    id: "l2-3",
    courseId: "seed-2",
    title: "Rhythm Cycles (Tala)",
    description: "Understanding teentaal and other Bollywood rhythms",
    contentUrl: "",
    durationMinutes: BigInt(30),
    orderIndex: BigInt(3),
  },
  {
    id: "l2-4",
    courseId: "seed-2",
    title: "Playing Along to a Bollywood Track",
    description: "Apply your skills to a real song",
    contentUrl: "",
    durationMinutes: BigInt(40),
    orderIndex: BigInt(4),
  },
  // Dance
  {
    id: "l3-1",
    courseId: "seed-3",
    title: "Bollywood Dance History",
    description: "From classical roots to Filmfare stage",
    contentUrl: "",
    durationMinutes: BigInt(15),
    orderIndex: BigInt(1),
  },
  {
    id: "l3-2",
    courseId: "seed-3",
    title: "Basic Hand Mudras & Footwork",
    description: "Foundation movements for Bollywood style",
    contentUrl: "",
    durationMinutes: BigInt(30),
    orderIndex: BigInt(2),
  },
  {
    id: "l3-3",
    courseId: "seed-3",
    title: "Choreography: Naatu Naatu",
    description: "Learn the iconic award-winning sequence",
    contentUrl: "",
    durationMinutes: BigInt(45),
    orderIndex: BigInt(3),
  },
  // Theory
  {
    id: "l4-1",
    courseId: "seed-4",
    title: "Indian Ragas Explained",
    description: "The modal system behind Bollywood melodies",
    contentUrl: "",
    durationMinutes: BigInt(20),
    orderIndex: BigInt(1),
  },
  {
    id: "l4-2",
    courseId: "seed-4",
    title: "Film Score Composition",
    description: "How composers like A.R. Rahman create magic",
    contentUrl: "",
    durationMinutes: BigInt(25),
    orderIndex: BigInt(2),
  },
  {
    id: "l4-3",
    courseId: "seed-4",
    title: "Chord Progressions in Bollywood",
    description: "Western harmony meets Indian classical",
    contentUrl: "",
    durationMinutes: BigInt(30),
    orderIndex: BigInt(3),
  },
  {
    id: "l4-4",
    courseId: "seed-4",
    title: "Writing Your First Bollywood Song",
    description: "Putting theory into creative practice",
    contentUrl: "",
    durationMinutes: BigInt(40),
    orderIndex: BigInt(4),
  },
];

// ─── Course Queries ──────────────────────────────────────────────

export function useGetAllCourses() {
  const { actor, isFetching } = useActor();
  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor) return SEED_COURSES;
      try {
        const courses = await actor.getAllCourses();
        return courses.length > 0 ? courses : SEED_COURSES;
      } catch {
        return SEED_COURSES;
      }
    },
    enabled: !isFetching,
    staleTime: 60_000,
  });
}

export function useGetCourse(courseId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Course | null>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const seed = SEED_COURSES.find((c) => c.id === courseId);
      if (!actor) return seed ?? null;
      try {
        const course = await actor.getCourse(courseId);
        return course ?? seed ?? null;
      } catch {
        return seed ?? null;
      }
    },
    enabled: !!courseId && !isFetching,
    staleTime: 60_000,
  });
}

export function useGetLessonsForCourse(courseId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Lesson[]>({
    queryKey: ["lessons", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const seedLessons = SEED_LESSONS.filter((l) => l.courseId === courseId);
      if (!actor) return seedLessons;
      try {
        const lessons = await actor.getLessonsForCourse(courseId);
        return lessons.length > 0 ? lessons : seedLessons;
      } catch {
        return seedLessons;
      }
    },
    enabled: !!courseId && !isFetching,
    staleTime: 60_000,
  });
}

export function useGetCourseRecommendations() {
  const { actor, isFetching } = useActor();
  return useQuery<Course[]>({
    queryKey: ["recommendations"],
    queryFn: async () => {
      if (!actor) return SEED_COURSES.slice(0, 3);
      try {
        const recs = await actor.getCourseRecommendations();
        return recs.length > 0 ? recs : SEED_COURSES.slice(0, 3);
      } catch {
        return SEED_COURSES.slice(0, 3);
      }
    },
    enabled: !isFetching,
    staleTime: 60_000,
  });
}

// ─── Enrollment Queries ──────────────────────────────────────────

export function useGetUserEnrollments() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Enrollment[]>({
    queryKey: ["enrollments", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        return await actor.getEnrollmentsForUser(identity.getPrincipal());
      } catch {
        return [];
      }
    },
    enabled: !!actor && !!identity && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetAllEnrollments() {
  const { actor, isFetching } = useActor();
  return useQuery<Enrollment[]>({
    queryKey: ["all-enrollments"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllEnrollments();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetCourseProgress(courseId: string | undefined) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Progress | null>({
    queryKey: ["progress", courseId, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity || !courseId) return null;
      try {
        return await actor.getCourseProgressForUser(
          identity.getPrincipal(),
          courseId,
        );
      } catch {
        return null;
      }
    },
    enabled: !!actor && !!identity && !!courseId && !isFetching,
    staleTime: 10_000,
  });
}

export function useUpdateLessonProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      lessonId,
    }: {
      courseId: string;
      lessonId: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateLessonProgress(courseId, lessonId);
    },
    onSuccess: (_, { courseId }) => {
      void queryClient.invalidateQueries({ queryKey: ["progress", courseId] });
    },
  });
}

// ─── Profile Queries ─────────────────────────────────────────────

export function useGetUserProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<UserProfile | null>({
    queryKey: ["profile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !!identity && !isFetching,
    staleTime: 60_000,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// ─── Admin Queries ───────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<boolean>({
    queryKey: ["is-admin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !!identity && !isFetching,
    staleTime: 60_000,
  });
}

export function useCreateOrUpdateCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (course: Course) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createOrUpdateCourse(course);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useDeleteCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteCourse(courseId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useCreateOrUpdateLesson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lesson: Lesson) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createOrUpdateLesson(lesson);
    },
    onSuccess: (_, lesson) => {
      void queryClient.invalidateQueries({
        queryKey: ["lessons", lesson.courseId],
      });
    },
  });
}

// ─── Payment ─────────────────────────────────────────────────────

export function useCreatePaymentSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createCoursePaymentSession(courseId);
    },
  });
}

export function useEnrollUserInCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      sessionId,
    }: {
      courseId: string;
      sessionId: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.enrollUserInCourse(courseId, sessionId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}

export function useGetStripeSessionStatus(sessionId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stripe-session", sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) throw new Error("Missing data");
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !!sessionId && !isFetching,
    staleTime: 0,
    refetchInterval: (query) => {
      if (query.state.data?.__kind__ === "completed") return false;
      return 3000;
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["stripe-configured"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isStripeConfigured();
      } catch {
        return false;
      }
    },
    enabled: !isFetching,
    staleTime: 300_000,
  });
}
