import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { AdminPage } from "./pages/AdminPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { CoursePlayerPage } from "./pages/CoursePlayerPage";
import { CoursesPage } from "./pages/CoursesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { PaymentCancelPage } from "./pages/PaymentCancelPage";
import { PaymentGatewayPage } from "./pages/PaymentGatewayPage";
import { PaymentSuccessPage } from "./pages/PaymentSuccessPage";
import { ProfilePage } from "./pages/ProfilePage";

// ─── Root Layout ─────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  ),
});

// ─── Routes ──────────────────────────────────────────────────────
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const coursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/courses",
  component: CoursesPage,
});

const courseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/courses/$id",
  component: CourseDetailPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const learnRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/learn/$courseId",
  component: CoursePlayerPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  component: PaymentSuccessPage,
  validateSearch: (search: Record<string, unknown>) => ({
    session_id:
      typeof search.session_id === "string" ? search.session_id : undefined,
    course_id:
      typeof search.course_id === "string" ? search.course_id : undefined,
  }),
});

const paymentCancelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-cancel",
  component: PaymentCancelPage,
});

const paymentGatewayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-gateway",
  component: PaymentGatewayPage,
  validateSearch: (search: Record<string, unknown>) => ({
    method: typeof search.method === "string" ? search.method : "phonepe",
    courseId: typeof search.courseId === "string" ? search.courseId : "",
  }),
});

// ─── Router ──────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  coursesRoute,
  courseDetailRoute,
  dashboardRoute,
  learnRoute,
  adminRoute,
  profileRoute,
  paymentSuccessRoute,
  paymentCancelRoute,
  paymentGatewayRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
