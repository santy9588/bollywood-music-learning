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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import {
  Bike,
  Car,
  Clock,
  Footprints,
  MapPin,
  Route,
  Search,
  Trash2,
  Truck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Trip, VehicleType } from "../types";
import { formatDate, formatDistance, formatDuration } from "../utils/geo";
import { deleteTrip, loadTrips } from "../utils/storage";

const vehicleIcons: Record<VehicleType, React.ReactNode> = {
  car: <Car className="w-4 h-4" />,
  bike: <Bike className="w-4 h-4" />,
  truck: <Truck className="w-4 h-4" />,
  walk: <Footprints className="w-4 h-4" />,
};

const vehicleColors: Record<VehicleType, string> = {
  car: "bg-primary/15 text-primary",
  bike: "bg-chart-2/15 text-chart-2",
  truck: "bg-chart-3/15 text-chart-3",
  walk: "bg-chart-4/15 text-chart-4",
};

const vehicleLabels: Record<VehicleType, string> = {
  car: "Car",
  bike: "Bike",
  truck: "Truck",
  walk: "Walk",
};

export function TripHistoryPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<VehicleType | "all">("all");

  useEffect(() => {
    setTrips(loadTrips());
  }, []);

  function handleDelete(id: string) {
    const updated = deleteTrip(id);
    setTrips(updated);
    toast.success("Trip deleted");
  }

  const filtered = trips.filter((t) => {
    const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filterType === "all" || t.vehicleType === filterType;
    return matchesQuery && matchesFilter;
  });

  const filters: Array<{ value: VehicleType | "all"; label: string }> = [
    { value: "all", label: "All" },
    { value: "car", label: "Car" },
    { value: "bike", label: "Bike" },
    { value: "truck", label: "Truck" },
    { value: "walk", label: "Walk" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          Trip History
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {trips.length} trips recorded
        </p>
      </motion.div>

      {/* Search + filter */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search trips..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-card border-border focus:border-primary"
            data-ocid="history.search_input"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filterType === f.value ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilterType(f.value)}
              className={
                filterType === f.value
                  ? "bg-primary text-primary-foreground"
                  : ""
              }
              data-ocid="history.tab"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Trip list */}
      {filtered.length === 0 ? (
        <Card className="bg-card border-border" data-ocid="history.empty_state">
          <CardContent className="p-12 text-center">
            <Route className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No trips found</p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Try adjusting your search or start a new journey
            </p>
            <Link to="/new-trip">
              <Button
                className="mt-4 bg-primary text-primary-foreground"
                data-ocid="history.primary_button"
              >
                Start New Trip
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence>
          <div className="space-y-3" data-ocid="history.list">
            {filtered.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.04 * i }}
                data-ocid={`history.item.${i + 1}`}
              >
                <Card className="bg-card border-border hover:border-primary/40 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-lg shrink-0 ${vehicleColors[trip.vehicleType]}`}
                      >
                        {vehicleIcons[trip.vehicleType]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link to="/trip/$id" params={{ id: trip.id }}>
                            <span className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                              {trip.title}
                            </span>
                          </Link>
                          {!trip.endTime && (
                            <Badge className="bg-primary/20 text-primary border-0 text-xs animate-pulse-slow">
                              Live
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {vehicleLabels[trip.vehicleType]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />{" "}
                            {formatDate(trip.startTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Route className="w-3 h-3" />{" "}
                            {formatDistance(trip.distanceMeters)}
                          </span>
                          {trip.endTime && (
                            <span>
                              {formatDuration(trip.endTime - trip.startTime)}
                            </span>
                          )}
                          {trip.checkpoints.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{" "}
                              {trip.checkpoints.length} checkpoints
                            </span>
                          )}
                        </div>
                        {trip.notes && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {trip.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link to="/trip/$id" params={{ id: trip.id }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs"
                            data-ocid="history.secondary_button"
                          >
                            View
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              data-ocid={`history.delete_button.${i + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            className="bg-card border-border"
                            data-ocid="history.dialog"
                          >
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete trip?</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                This will permanently delete &quot;{trip.title}
                                &quot; and cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                className="bg-secondary"
                                data-ocid="history.cancel_button"
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(trip.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                data-ocid="history.confirm_button"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
