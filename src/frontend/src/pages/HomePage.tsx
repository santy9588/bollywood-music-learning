import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  Bike,
  Car,
  Clock,
  Footprints,
  MapPin,
  Navigation,
  Plus,
  Route,
  TrendingUp,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { MapView } from "../components/MapView";
import type { Trip } from "../types";
import { formatDate, formatDistance, formatDuration } from "../utils/geo";
import { loadTrips } from "../utils/storage";

const vehicleIcons: Record<string, React.ReactNode> = {
  car: <Car className="w-4 h-4" />,
  bike: <Bike className="w-4 h-4" />,
  truck: <Truck className="w-4 h-4" />,
  walk: <Footprints className="w-4 h-4" />,
};

const vehicleColors: Record<string, string> = {
  car: "text-primary bg-primary/15",
  bike: "text-chart-2 bg-chart-2/15",
  truck: "text-chart-3 bg-chart-3/15",
  walk: "text-chart-4 bg-chart-4/15",
};

export function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>([
    28.6139, 77.209,
  ]);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    setTrips(loadTrips());
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setLocationError(true),
      { timeout: 8000 },
    );
  }, []);

  const recentTrips = trips.slice(0, 3);
  const totalDistance = trips.reduce((sum, t) => sum + t.distanceMeters, 0);
  const completedTrips = trips.filter((t) => t.endTime).length;

  const stats = [
    {
      label: "Total Trips",
      value: completedTrips,
      icon: Route,
      color: "text-primary",
    },
    {
      label: "Total Distance",
      value: formatDistance(totalDistance),
      icon: TrendingUp,
      color: "text-chart-2",
    },
    {
      label: "Checkpoints",
      value: trips.reduce((s, t) => s + t.checkpoints.length, 0),
      icon: MapPin,
      color: "text-chart-3",
    },
    {
      label: "Active Now",
      value: trips.filter((t) => !t.endTime).length,
      icon: Navigation,
      color: "text-chart-4",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero map section */}
      <section
        className="relative h-[40vh] min-h-[280px]"
        data-ocid="home.section"
      >
        <MapView
          center={userLocation}
          zoom={13}
          className="absolute inset-0 w-full h-full rounded-none"
          interactive={false}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        {/* Hero text */}
        <motion.div
          className="absolute bottom-8 left-0 right-0 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">
              Track Your Journey
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {locationError
                ? "Enable location for live tracking"
                : "Your current location is mapped"}
            </p>
          </div>
        </motion.div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Link to="/new-trip">
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow font-semibold text-base px-8"
              data-ocid="home.primary_button"
            >
              <Plus className="w-5 h-5" />
              Start New Journey
            </Button>
          </Link>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="bg-card border-border hover:border-primary/30 transition-colors"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-display font-bold text-lg text-foreground leading-tight">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Recent trips */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-foreground">
              Recent Trips
            </h2>
            <Link to="/history">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary gap-1"
                data-ocid="home.link"
              >
                View all <Clock className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {recentTrips.length === 0 ? (
            <Card
              className="bg-card border-border"
              data-ocid="home.empty_state"
            >
              <CardContent className="p-8 text-center">
                <Route className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No trips yet. Start your first journey!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentTrips.map((trip, i) => (
                <Link key={trip.id} to="/trip/$id" params={{ id: trip.id }}>
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    data-ocid={`home.item.${i + 1}`}
                  >
                    <Card className="bg-card border-border hover:border-primary/40 hover:bg-card/80 transition-all cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div
                          className={`p-2.5 rounded-lg ${
                            vehicleColors[trip.vehicleType]
                          }`}
                        >
                          {vehicleIcons[trip.vehicleType]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {trip.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(trip.startTime)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium text-primary">
                            {formatDistance(trip.distanceMeters)}
                          </p>
                          {trip.endTime && (
                            <p className="text-xs text-muted-foreground">
                              {formatDuration(trip.endTime - trip.startTime)}
                            </p>
                          )}
                        </div>
                        {!trip.endTime && (
                          <Badge className="bg-primary/20 text-primary border-0 animate-pulse-slow">
                            Live
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
