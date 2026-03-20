import type { Trip } from "../types";

const KEY = "routetrail_trips";

export function loadTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Trip[]) : getDefaultTrips();
  } catch {
    return getDefaultTrips();
  }
}

export function saveTrips(trips: Trip[]): void {
  localStorage.setItem(KEY, JSON.stringify(trips));
}

export function deleteTrip(id: string): Trip[] {
  const trips = loadTrips().filter((t) => t.id !== id);
  saveTrips(trips);
  return trips;
}

export function upsertTrip(trip: Trip): Trip[] {
  const trips = loadTrips();
  const idx = trips.findIndex((t) => t.id === trip.id);
  if (idx >= 0) {
    trips[idx] = trip;
  } else {
    trips.unshift(trip);
  }
  saveTrips(trips);
  return trips;
}

export function getTripById(id: string): Trip | undefined {
  return loadTrips().find((t) => t.id === id);
}

function getDefaultTrips(): Trip[] {
  const now = Date.now();
  const trips: Trip[] = [
    {
      id: "trip-001",
      title: "Mountain Pass Drive",
      vehicleType: "car",
      notes:
        "Scenic drive through the mountain pass. Roads were clear with great visibility.",
      startTime: now - 7 * 24 * 60 * 60 * 1000,
      endTime: now - 7 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000,
      startLat: 28.6139,
      startLng: 77.209,
      endLat: 28.7041,
      endLng: 77.1025,
      routePoints: [
        { lat: 28.6139, lng: 77.209, timestamp: now - 7 * 24 * 60 * 60 * 1000 },
        {
          lat: 28.64,
          lng: 77.18,
          timestamp: now - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000,
        },
        {
          lat: 28.67,
          lng: 77.15,
          timestamp: now - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
        },
        {
          lat: 28.7041,
          lng: 77.1025,
          timestamp: now - 7 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000,
        },
      ],
      checkpoints: [
        {
          id: "cp-01",
          name: "Fuel Stop — HP Petrol",
          lat: 28.64,
          lng: 77.18,
          timestamp: now - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000,
        },
        {
          id: "cp-02",
          name: "Viewpoint Overlook",
          lat: 28.67,
          lng: 77.15,
          timestamp: now - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
        },
      ],
      checklist: [
        { id: "cl-01", text: "Check tire pressure", done: true },
        { id: "cl-02", text: "Fill fuel tank", done: true },
        { id: "cl-03", text: "Pack water bottles", done: true },
        { id: "cl-04", text: "Download offline maps", done: false },
      ],
      distanceMeters: 18500,
    },
    {
      id: "trip-002",
      title: "City Cycling Tour",
      vehicleType: "bike",
      notes:
        "Morning cycle around the city park and old quarter. Perfect weather.",
      startTime: now - 3 * 24 * 60 * 60 * 1000,
      endTime: now - 3 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000,
      startLat: 28.6304,
      startLng: 77.2177,
      endLat: 28.6304,
      endLng: 77.2177,
      routePoints: [
        {
          lat: 28.6304,
          lng: 77.2177,
          timestamp: now - 3 * 24 * 60 * 60 * 1000,
        },
        {
          lat: 28.635,
          lng: 77.225,
          timestamp: now - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000,
        },
        {
          lat: 28.6304,
          lng: 77.2177,
          timestamp: now - 3 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000,
        },
      ],
      checkpoints: [
        {
          id: "cp-03",
          name: "India Gate",
          lat: 28.6129,
          lng: 77.2295,
          timestamp: now - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000,
        },
      ],
      checklist: [
        { id: "cl-05", text: "Helmet on", done: true },
        { id: "cl-06", text: "Chain lubricated", done: true },
        { id: "cl-07", text: "Carry ID", done: true },
      ],
      distanceMeters: 12300,
    },
    {
      id: "trip-003",
      title: "Delivery Run — South District",
      vehicleType: "truck",
      notes: "Routine delivery to warehouse and back. Traffic was moderate.",
      startTime: now - 1 * 24 * 60 * 60 * 1000,
      endTime: now - 1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
      startLat: 28.5355,
      startLng: 77.391,
      endLat: 28.58,
      endLng: 77.33,
      routePoints: [
        { lat: 28.5355, lng: 77.391, timestamp: now - 1 * 24 * 60 * 60 * 1000 },
        {
          lat: 28.555,
          lng: 77.365,
          timestamp: now - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
        },
        {
          lat: 28.58,
          lng: 77.33,
          timestamp: now - 1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
        },
      ],
      checkpoints: [
        {
          id: "cp-04",
          name: "Warehouse Gate",
          lat: 28.555,
          lng: 77.365,
          timestamp: now - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
        },
      ],
      checklist: [
        { id: "cl-08", text: "Load manifest signed", done: true },
        { id: "cl-09", text: "Fuel check", done: true },
        { id: "cl-10", text: "Return receipt", done: false },
      ],
      distanceMeters: 34700,
    },
  ];
  saveTrips(trips);
  return trips;
}
