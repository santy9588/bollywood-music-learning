import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Bike,
  Car,
  CheckSquare,
  Flag,
  Footprints,
  MapPin,
  Navigation,
  Pause,
  Plus,
  Square,
  Truck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MapView } from "../components/MapView";
import type {
  ChecklistItem,
  Checkpoint,
  RoutePoint,
  Trip,
  VehicleType,
} from "../types";
import {
  formatDistance,
  formatDuration,
  generateId,
  haversineMeters,
} from "../utils/geo";
import { upsertTrip } from "../utils/storage";

const vehicles: {
  type: VehicleType;
  label: string;
  Icon: React.FC<{ className?: string }>;
}[] = [
  { type: "car", label: "Car", Icon: Car },
  { type: "bike", label: "Bike", Icon: Bike },
  { type: "truck", label: "Truck", Icon: Truck },
  { type: "walk", label: "Walk", Icon: Footprints },
];

export function NewTripPage() {
  const navigate = useNavigate();

  // Form state
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: generateId(), text: "Check fuel / battery", done: false },
    { id: generateId(), text: "Carry ID & documents", done: false },
  ]);

  // Trip state
  const [isActive, setIsActive] = useState(false);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    28.6139, 77.209,
  ]);
  const [locationError, setLocationError] = useState(false);

  // Checkpoint dialog
  const [cpOpen, setCpOpen] = useState(false);
  const [cpName, setCpName] = useState("");

  const watchIdRef = useRef<number | null>(null);
  const lastPointRef = useRef<RoutePoint | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Get initial location
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setMapCenter([p.coords.latitude, p.coords.longitude]),
      () => setLocationError(true),
      { timeout: 8000 },
    );
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, []);

  function startJourney() {
    if (!title.trim()) {
      toast.error("Please enter a trip title");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported in this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const now = Date.now();
        const startPt: RoutePoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: now,
        };
        const trip: Trip = {
          id: generateId(),
          title: title.trim(),
          vehicleType,
          notes,
          startTime: now,
          startLat: pos.coords.latitude,
          startLng: pos.coords.longitude,
          routePoints: [startPt],
          checkpoints: [],
          checklist: checklist.map((c) => ({ ...c })),
          distanceMeters: 0,
        };

        setActiveTrip(trip);
        setRoutePoints([startPt]);
        lastPointRef.current = startPt;
        startTimeRef.current = now;
        setIsActive(true);
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        upsertTrip(trip);

        // Start GPS watch
        watchIdRef.current = navigator.geolocation.watchPosition(
          (p2) => {
            const newPt: RoutePoint = {
              lat: p2.coords.latitude,
              lng: p2.coords.longitude,
              timestamp: Date.now(),
            };
            setRoutePoints((prev) => [...prev, newPt]);
            setDistanceMeters((prev) => {
              if (lastPointRef.current) {
                const d = haversineMeters(
                  lastPointRef.current.lat,
                  lastPointRef.current.lng,
                  newPt.lat,
                  newPt.lng,
                );
                return prev + d;
              }
              return prev;
            });
            lastPointRef.current = newPt;
            setMapCenter([newPt.lat, newPt.lng]);

            setActiveTrip((prev) => {
              if (!prev) return prev;
              const updated = {
                ...prev,
                routePoints: [...prev.routePoints, newPt],
              };
              upsertTrip(updated);
              return updated;
            });
          },
          () => toast.error("GPS signal lost"),
          { enableHighAccuracy: true, timeout: 10000 },
        );

        // Elapsed timer
        elapsedRef.current = setInterval(
          () => setElapsed(Date.now() - startTimeRef.current),
          1000,
        );
        toast.success("Journey started!");
      },
      () => {
        toast.error("Could not get your location. Please enable GPS.");
        setLocationError(true);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function endJourney() {
    if (!activeTrip) return;
    if (watchIdRef.current !== null)
      navigator.geolocation.clearWatch(watchIdRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);

    const endTime = Date.now();
    const lastPt = routePoints[routePoints.length - 1];
    const finished: Trip = {
      ...activeTrip,
      endTime,
      endLat: lastPt?.lat,
      endLng: lastPt?.lng,
      routePoints,
      distanceMeters,
      checklist,
    };
    upsertTrip(finished);
    toast.success("Journey saved!");
    navigate({ to: `/trip/${finished.id}` });
  }

  function addCheckpoint() {
    if (!cpName.trim() || !lastPointRef.current) return;
    const cp: Checkpoint = {
      id: generateId(),
      name: cpName.trim(),
      lat: lastPointRef.current.lat,
      lng: lastPointRef.current.lng,
      timestamp: Date.now(),
    };
    setActiveTrip((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, checkpoints: [...prev.checkpoints, cp] };
      upsertTrip(updated);
      return updated;
    });
    setCpName("");
    setCpOpen(false);
    toast.success(`Checkpoint "${cp.name}" added`);
  }

  function addChecklistItem() {
    if (!checklistInput.trim()) return;
    setChecklist((prev) => [
      ...prev,
      { id: generateId(), text: checklistInput.trim(), done: false },
    ]);
    setChecklistInput("");
  }

  function toggleChecklistItem(id: string) {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)),
    );
    if (activeTrip) {
      const updated = {
        ...activeTrip,
        checklist: checklist.map((c) =>
          c.id === id ? { ...c, done: !c.done } : c,
        ),
      };
      upsertTrip(updated);
      setActiveTrip(updated);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          {isActive ? "Active Journey" : "New Journey"}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {isActive
            ? "Your route is being recorded"
            : "Configure and start your trip"}
        </p>
      </motion.div>

      {/* Active trip banner */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="bg-primary/10 border-primary/30">
              <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-slow" />
                  <span className="text-primary font-semibold">
                    {activeTrip?.title}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-primary/20 text-primary border-0"
                  >
                    LIVE
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-muted-foreground text-xs">Distance</p>
                    <p className="font-bold text-foreground">
                      {formatDistance(distanceMeters)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-xs">Duration</p>
                    <p className="font-bold text-foreground">
                      {formatDuration(elapsed)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-xs">Points</p>
                    <p className="font-bold text-foreground">
                      {routePoints.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <MapView
          center={mapCenter}
          zoom={14}
          routePoints={routePoints}
          checkpoints={activeTrip?.checkpoints}
          startPoint={
            activeTrip ? [activeTrip.startLat, activeTrip.startLng] : undefined
          }
          className="h-64 md:h-80 w-full"
          interactive={true}
        />
      </motion.div>

      {/* Location error */}
      {locationError && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-sm"
          data-ocid="newtrip.error_state"
        >
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          <span className="text-destructive">
            Location access denied. Enable GPS in browser settings.
          </span>
        </div>
      )}

      {!isActive ? (
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {/* Vehicle selector */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Vehicle Type
            </Label>
            <div className="grid grid-cols-4 gap-2" data-ocid="newtrip.select">
              {vehicles.map(({ type, label, Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setVehicleType(type)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                    vehicleType === type
                      ? "bg-primary/15 border-primary/50 text-primary"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/60"
                  }`}
                  data-ocid="newtrip.radio"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label
              htmlFor="trip-title"
              className="text-sm font-medium text-foreground mb-1.5 block"
            >
              Trip Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="trip-title"
              placeholder="e.g. Morning mountain drive"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-card border-border focus:border-primary"
              data-ocid="newtrip.input"
            />
          </div>

          {/* Notes */}
          <div>
            <Label
              htmlFor="trip-notes"
              className="text-sm font-medium text-foreground mb-1.5 block"
            >
              Notes (optional)
            </Label>
            <Textarea
              id="trip-notes"
              placeholder="Add any notes about this journey..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="bg-card border-border focus:border-primary resize-none"
              data-ocid="newtrip.textarea"
            />
          </div>

          {/* Checklist */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Pre-trip Checklist
            </Label>
            <div className="space-y-2 mb-2">
              {checklist.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2"
                  data-ocid={`newtrip.item.${i + 1}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleChecklistItem(item.id)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-ocid={`newtrip.checkbox.${i + 1}`}
                  >
                    {item.done ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                  <span
                    className={`text-sm ${
                      item.done
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add checklist item"
                value={checklistInput}
                onChange={(e) => setChecklistInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
                className="bg-card border-border focus:border-primary text-sm"
                data-ocid="newtrip.search_input"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={addChecklistItem}
                data-ocid="newtrip.secondary_button"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            size="lg"
            onClick={startJourney}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow font-semibold"
            data-ocid="newtrip.primary_button"
          >
            <Navigation className="w-5 h-5" />
            Start Journey
          </Button>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Checkpoint controls */}
          <div className="flex gap-3">
            <Dialog open={cpOpen} onOpenChange={setCpOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="gap-2 flex-1"
                  data-ocid="newtrip.open_modal_button"
                >
                  <Flag className="w-4 h-4 text-amber-400" />
                  Add Checkpoint
                </Button>
              </DialogTrigger>
              <DialogContent
                className="bg-card border-border"
                data-ocid="newtrip.dialog"
              >
                <DialogHeader>
                  <DialogTitle className="font-display">
                    Add Checkpoint
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Label htmlFor="cp-name">Checkpoint Name</Label>
                  <Input
                    id="cp-name"
                    placeholder="e.g. Viewpoint, Fuel Stop"
                    value={cpName}
                    onChange={(e) => setCpName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCheckpoint()}
                    className="bg-secondary border-border"
                    data-ocid="newtrip.input"
                  />
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={addCheckpoint}
                      className="flex-1 bg-primary text-primary-foreground"
                      data-ocid="newtrip.confirm_button"
                    >
                      <MapPin className="w-4 h-4 mr-2" /> Add Pin
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setCpOpen(false)}
                      data-ocid="newtrip.cancel_button"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="destructive"
              onClick={endJourney}
              className="gap-2 flex-1"
              data-ocid="newtrip.delete_button"
            >
              <Pause className="w-4 h-4" />
              End Journey
            </Button>
          </div>

          {/* Live checkpoints */}
          {activeTrip && activeTrip.checkpoints.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Flag className="w-4 h-4 text-amber-400" />
                  Checkpoints ({activeTrip.checkpoints.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                {activeTrip.checkpoints.map((cp, i) => (
                  <div
                    key={cp.id}
                    className="flex items-center gap-2 text-sm py-1"
                    data-ocid={`newtrip.item.${i + 1}`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-foreground">{cp.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Checklist during trip */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" />
                Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {checklist.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleChecklistItem(item.id)}
                  className="flex items-center gap-2 w-full text-left"
                  data-ocid={`newtrip.checkbox.${i + 1}`}
                >
                  {item.done ? (
                    <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground shrink-0" />
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
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
