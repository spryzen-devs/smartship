import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPoint {
  lat: number;
  lng: number;
  label?: string;
  type?: 'origin' | 'destination' | 'truck';
}

interface LiveMapProps {
  center?: [number, number];
  zoom?: number;
  points?: MapPoint[];
  route?: [number, number][];
  className?: string;
}

export function LiveMap({ center = [20.5937, 78.9629], zoom = 5, points = [], route, className = "h-[500px]" }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance.current);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing layers except tile layer
    mapInstance.current.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        mapInstance.current!.removeLayer(layer);
      }
    });

    // Add markers
    points.forEach((point) => {
      const color = point.type === 'truck' ? '#F97316' : point.type === 'destination' ? '#10B981' : '#0F172A';
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:12px;height:12px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);${point.type === 'truck' ? 'width:16px;height:16px;' : ''}"></div>`,
        iconSize: [point.type === 'truck' ? 16 : 12, point.type === 'truck' ? 16 : 12],
        iconAnchor: [point.type === 'truck' ? 8 : 6, point.type === 'truck' ? 8 : 6],
      });

      const marker = L.marker([point.lat, point.lng], { icon }).addTo(mapInstance.current!);
      if (point.label) marker.bindPopup(point.label);
    });

    // Add route polyline
    if (route && route.length > 1) {
      L.polyline(route, { color: '#F97316', weight: 3, dashArray: '5, 10', opacity: 0.8 }).addTo(mapInstance.current);
    }
  }, [points, route]);

  return <div ref={mapRef} className={`w-full rounded-lg border border-border ${className}`} />;
}
