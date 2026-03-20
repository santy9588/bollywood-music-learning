import { useEffect, useRef } from "react";
import type { Checkpoint, RoutePoint } from "../types";

declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: Leaflet loaded via CDN
    L: any;
  }
}

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  routePoints?: RoutePoint[];
  checkpoints?: Checkpoint[];
  startPoint?: [number, number];
  endPoint?: [number, number];
  className?: string;
  interactive?: boolean;
}

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export function MapView({
  center,
  zoom = 13,
  routePoints = [],
  checkpoints = [],
  startPoint,
  endPoint,
  className = "",
  interactive = true,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — map reinit only on center/zoom/interactive changes
  useEffect(() => {
    const L = window.L;
    if (!L || !containerRef.current) return;

    // Fix default icon paths — use assignment instead of delete
    L.Icon.Default.prototype._getIconUrl = undefined;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    if (mapRef.current) {
      mapRef.current.remove();
    }

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: interactive,
      dragging: interactive,
      doubleClickZoom: interactive,
    });
    mapRef.current = map;

    L.tileLayer(TILE_URL, { attribution: ATTRIBUTION }).addTo(map);

    // Draw route polyline
    if (routePoints.length > 1) {
      const latlngs = routePoints.map((p) => [p.lat, p.lng]);
      polylineRef.current = L.polyline(latlngs, {
        color: "#2dd4bf",
        weight: 4,
        opacity: 0.9,
        lineJoin: "round",
      }).addTo(map);
      map.fitBounds(polylineRef.current.getBounds(), { padding: [30, 30] });
    }

    // Start marker
    if (startPoint) {
      const startIcon = L.divIcon({
        html: '<div style="width:14px;height:14px;border-radius:50%;background:#2dd4bf;border:3px solid #0f172a;box-shadow:0 0 0 2px #2dd4bf"></div>',
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker(startPoint, { icon: startIcon })
        .addTo(map)
        .bindPopup("<b>Start</b>");
    }

    // End marker
    if (endPoint) {
      const endIcon = L.divIcon({
        html: '<div style="width:14px;height:14px;border-radius:50%;background:#f43f5e;border:3px solid #0f172a;box-shadow:0 0 0 2px #f43f5e"></div>',
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker(endPoint, { icon: endIcon }).addTo(map).bindPopup("<b>End</b>");
    }

    // Checkpoint markers
    for (const cp of checkpoints) {
      const cpIcon = L.divIcon({
        html: '<div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:2px solid #0f172a"></div>',
        className: "",
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });
      L.marker([cp.lat, cp.lng], { icon: cpIcon })
        .addTo(map)
        .bindPopup(`<b>${cp.name}</b>`);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center[0], center[1], zoom, interactive]);

  // Update polyline when route points change (active tracking)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only update on length change
  useEffect(() => {
    const L = window.L;
    if (!L || !mapRef.current) return;
    if (polylineRef.current) {
      polylineRef.current.remove();
    }
    if (routePoints.length > 1) {
      const latlngs = routePoints.map((p) => [p.lat, p.lng]);
      polylineRef.current = L.polyline(latlngs, {
        color: "#2dd4bf",
        weight: 4,
        opacity: 0.9,
        lineJoin: "round",
      }).addTo(mapRef.current);
    }
  }, [routePoints.length]);

  return (
    <div
      ref={containerRef}
      className={`rounded-lg overflow-hidden ${className}`}
    />
  );
}
