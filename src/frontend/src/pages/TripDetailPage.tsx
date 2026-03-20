import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bike,
  Car,
  CheckSquare,
  Clock,
  ExternalLink,
  Flag,
  Footprints,
  MapPin,
  Navigation,
  Route,
  Square,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapView } from "../components/MapView";
import type { Trip, VehicleType } from "../types";
import {
  formatDate,
  formatDistance,
  formatDuration,
  formatTime,
} from "../utils/geo";
import { getTripById, upsertTrip } from "../utils/storage";

const vehicleIcons: Record<VehicleType, React.ReactNode> = {
  car: <Car className="w-5 h-5" />,
  bike: <Bike className="w-5 h-5" />,
  truck: <Truck className="w-5 h-5" />,
  walk: <Footprints className="w-5 h-5" />,
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

export function TripDetailPage() {
  const { id } = useParams({ from: "/trip/$id" });
  // biome-ignore lint/correctness/useExhaustiveDependencies: navigate is stable
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    const found = getTripById(id);
    if (found) {
      setTrip(found);
    } else {
      toast.error("Trip not found");
      navigate({ to: "/history" });
    }
  }, [id, navigate]);

  function toggleChecklist(itemId: string) {
    if (!trip) return;
    const updated = {
      ...trip,
      checklist: trip.checklist.map((c) =>
        c.id === itemId ? { ...c, done: !c.done } : c,
      ),
    };
    upsertTrip(updated);
    setTrip(updated);
  }

  function returnNavigation() {
    if (!trip) return;
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const url = `https://maps.google.com/maps?saddr=${pos.coords.latitude},${pos.coords.longitude}&daddr=${trip.startLat},${trip.startLng}&dirflg=d`;
        window.open(url, "_blank");
      },
      () => {
        const url = `https://maps.google.com/maps?q=${trip.startLat},${trip.startLng}`;
        window.open(url, "_blank");
      },
    );
  }

  if (!trip) {
    return (
      <div
        className="flex items-center justify-center min-h-64"
        data-ocid="tripdetail.loading_state"
      >
        <div className="text-center">
          <Route
            className="w-10 h-10 text-muted-foreground mx-auto mb-3"
            style={{ animation: "spin 2s linear infinite" }}
          />
          <p className="text-muted-foreground">Loading trip...</p>
        </div>
      </div>
    );
  }

  const mapCenter: [number, number] = [trip.startLat, trip.startLng];
  const startPoint: [number, number] = [trip.startLat, trip.startLng];
  const endPoint: [number, number] | undefined =
    trip.endLat && trip.endLng ? [trip.endLat, trip.endLng] : undefined;

  const statItems = [
    {
      id: "distance",
      label: "Distance",
      value: formatDistance(trip.distanceMeters),
      icon: Route,
      color: "text-primary",
    },
    {
      id: "duration",
      label: "Duration",
      value: trip.endTime
        ? formatDuration(trip.endTime - trip.startTime)
        : "In progress",
      icon: Clock,
      color: "text-chart-2",
    },
    {
      id: "checkpoints",
      label: "Checkpoints",
      value: trip.checkpoints.length,
      icon: MapPin,
      color: "text-amber-400",
    },
    {
      id: "routepoints",
      label: "Route Points",
      value: trip.routePoints.length,
      icon: Navigation,
      color: "text-chart-3",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/history" })}
          className="text-muted-foreground hover:text-foreground p-1 h-auto mt-1"
          data-ocid="tripdetail.secondary_button"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {trip.title}
            </h1>
            {!trip.endTime && (
              <Badge className="bg-primary/20 text-primary border-0 animate-pulse-slow">
                Live
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div
              className={`p-1.5 rounded-md ${vehicleColors[trip.vehicleType]}`}
            >
              {vehicleIcons[trip.vehicleType]}
            </div>
            <span className="text-muted-foreground text-sm">
              {vehicleLabels[trip.vehicleType]} • {formatDate(trip.startTime)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <MapView
          center={mapCenter}
          routePoints={trip.routePoints}
          checkpoints={trip.checkpoints}
          startPoint={startPoint}
          endPoint={endPoint}
          className="h-72 md:h-96 w-full"
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {statItems.map((s) => (
          <Card key={s.id} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-secondary ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Return Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          onClick={returnNavigation}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
          data-ocid="tripdetail.primary_button"
        >
          <Navigation className="w-4 h-4" />
          Return to Start Point
          <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Checkpoints */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Flag className="w-4 h-4 text-amber-400" />
                Checkpoints ({trip.checkpoints.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {trip.checkpoints.length === 0 ? (
                <p
                  className="text-muted-foreground text-sm"
                  data-ocid="tripdetail.empty_state"
                >
                  No checkpoints recorded
                </p>
              ) : (
                <div className="space-y-3">
                  {trip.checkpoints.map((cp, i) => (
                    <div
                      key={cp.id}
                      className="flex items-start gap-2"
                      data-ocid={`tripdetail.item.${i + 1}`}
                    >
                      <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {cp.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cp.lat.toFixed(4)}, {cp.lng.toFixed(4)} •{" "}
                          {formatTime(cp.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" />
                Checklist ({trip.checklist.filter((c) => c.done).length}/
                {trip.checklist.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {trip.checklist.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No checklist items
                </p>
              ) : (
                <div className="space-y-2">
                  {trip.checklist.map((item, i) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleChecklist(item.id)}
                      className="flex items-center gap-2 w-full text-left group"
                      data-ocid={`tripdetail.checkbox.${i + 1}`}
                    >
                      {item.done ? (
                        <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                      )}
                      <span
                        className={`text-sm ${
                          item.done
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {item.text}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Notes */}
      {trip.notes && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Notes</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {trip.notes}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Trip metadata */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">
              Journey Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start</span>
              <span className="text-foreground font-mono text-xs">
                {trip.startLat.toFixed(5)}, {trip.startLng.toFixed(5)} •{" "}
                {formatTime(trip.startTime)}
              </span>
            </div>
            {trip.endLat && trip.endLng && trip.endTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">End</span>
                <span className="text-foreground font-mono text-xs">
                  {trip.endLat.toFixed(5)}, {trip.endLng.toFixed(5)} •{" "}
                  {formatTime(trip.endTime)}
                </span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trip ID</span>
              <span className="text-muted-foreground font-mono text-xs">
                {trip.id}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
