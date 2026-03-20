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
import { HomePage } from "./pages/HomePage";
import { NewTripPage } from "./pages/NewTripPage";
import { TripDetailPage } from "./pages/TripDetailPage";
import { TripHistoryPage } from "./pages/TripHistoryPage";

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const newTripRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/new-trip",
  component: NewTripPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: TripHistoryPage,
});

const tripDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/trip/$id",
  component: TripDetailPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  newTripRoute,
  historyRoute,
  tripDetailRoute,
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
