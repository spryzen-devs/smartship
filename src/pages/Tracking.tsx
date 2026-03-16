import { LiveMap } from "@/components/LiveMap";
import { StatusBadge } from "@/components/StatusBadge";
import { mockShipments, mockTrackingData } from "@/lib/mock-data";
import { useState } from "react";

export default function Tracking() {
  const trackableShipments = mockShipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'DELAYED');
  const [selected, setSelected] = useState(trackableShipments[0]?.id || '');

  const shipment = mockShipments.find(s => s.id === selected);
  const tracking = mockTrackingData[selected] || [];

  const mapPoints = shipment ? [
    { lat: shipment.origin_lat, lng: shipment.origin_lng, label: shipment.origin_name, type: 'origin' as const },
    { lat: shipment.dest_lat, lng: shipment.dest_lng, label: shipment.dest_name, type: 'destination' as const },
    ...(tracking.length > 0 ? [{ lat: tracking[tracking.length - 1].lat, lng: tracking[tracking.length - 1].lng, label: `${shipment.tracking_id} • ${shipment.vehicle_number} • ${tracking[tracking.length - 1].speed} km/h`, type: 'truck' as const }] : []),
  ] : [];

  const route: [number, number][] = tracking.map(t => [t.lat, t.lng]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Live Tracking</h1>
        <p className="text-sm text-muted-foreground">{trackableShipments.length} vehicles in transit</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Shipment list */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Active Shipments</p>
          {trackableShipments.map(s => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`w-full text-left rounded-lg border p-3 transition-all duration-150 ${
                selected === s.id
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-card hover:border-accent/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-muted-foreground">{s.tracking_id}</span>
                <StatusBadge status={s.status} />
              </div>
              <p className="text-sm font-medium text-card-foreground">{s.origin_name} → {s.dest_name}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.vehicle_number} • {s.driver_name}</p>
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-border bg-card p-4">
            {shipment && (
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-mono text-muted-foreground">{shipment.tracking_id}</span>
                  <p className="text-sm font-semibold text-card-foreground">
                    Vehicle {shipment.vehicle_number} is {tracking.length > 0 ? `moving at ${tracking[tracking.length - 1].speed} km/h` : 'stationary'}
                  </p>
                </div>
                <p className="text-xs text-accent font-medium">
                  ETA: {new Date(shipment.eta).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                </p>
              </div>
            )}
            <LiveMap
              points={mapPoints}
              route={route}
              center={shipment ? [shipment.origin_lat, shipment.origin_lng] : undefined}
              zoom={7}
              className="h-[520px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
