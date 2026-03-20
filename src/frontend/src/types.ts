export interface Checkpoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  timestamp: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export type VehicleType = "car" | "bike" | "truck" | "walk";

export interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface Trip {
  id: string;
  title: string;
  vehicleType: VehicleType;
  notes: string;
  startTime: number;
  endTime?: number;
  startLat: number;
  startLng: number;
  endLat?: number;
  endLng?: number;
  routePoints: RoutePoint[];
  checkpoints: Checkpoint[];
  checklist: ChecklistItem[];
  distanceMeters: number;
}
