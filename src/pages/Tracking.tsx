import { LiveMap } from "@/components/LiveMap";
import { StatusBadge } from "@/components/StatusBadge";
import { useShipments } from "@/hooks/use-shipments";
import { useTracking } from "@/hooks/use-tracking";
import { MovementSimulator } from "@/components/MovementSimulator";
import { useState } from "react";
import { Loader2, Navigation, Clock, MapPin, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function Tracking() {
  const { shipments, isLoading } = useShipments();
  const trackableShipments = shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'DELAYED' || s.status === 'PENDING');
  const [selected, setSelected] = useState(trackableShipments[0]?.id || '');
  const [activeRoute, setActiveRoute] = useState<[number, number][]>([]);

  const activeShipmentIds = trackableShipments.map(s => s.id);
  const { positions } = useTracking(activeShipmentIds);

  const shipment = shipments.find(s => s.id === selected);
  const currentPos = positions[selected] || (shipment ? {
    latitude: shipment.current_lat || shipment.origin_lat,
    longitude: shipment.current_lng || shipment.origin_lng,
    timestamp: new Date().toISOString()
  } : null);

  // Auto-set route when shipment changes
  useState(() => {
    if (shipment?.route_coordinates) {
      setActiveRoute(shipment.route_coordinates as any);
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground animate-pulse">
        <Loader2 className="h-8 w-8 mb-4 animate-spin text-primary" />
        <p className="text-sm">Connecting to GPS Satellites...</p>
      </div>
    );
  }

  const mapPoints = shipment ? [
    { lat: shipment.origin_lat, lng: shipment.origin_lng, label: shipment.origin_name, type: 'origin' as const },
    { lat: shipment.dest_lat, lng: shipment.dest_lng, label: shipment.dest_name, type: 'destination' as const },
    ...(currentPos ? [{ 
      lat: currentPos.latitude, 
      lng: currentPos.longitude, 
      label: `${shipment.tracking_id} • ${shipment.vehicle_number || 'Truck'}`, 
      type: 'truck' as const 
    }] : []),
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Tracking</h1>
          <p className="text-sm text-muted-foreground">{trackableShipments.length} active shipments</p>
        </div>
        {shipment && <MovementSimulator shipment={shipment} onRouteChange={(route) => setActiveRoute(route)} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Shipment list */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Active Fleet</p>
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
                <span className="font-mono text-[10px] text-muted-foreground">{s.tracking_id}</span>
                <StatusBadge status={s.status} />
              </div>
              <p className="text-sm font-medium text-card-foreground truncate">{s.origin_name} → {s.dest_name}</p>
              <div className="flex items-center gap-2 mt-1">
                 <Navigation className="h-3 w-3 text-muted-foreground" />
                 <p className="text-[10px] text-muted-foreground">
                   {s.vehicle_number || 'No Vehicle'} • {s.driver_name || 'No Driver'}
                 </p>
              </div>
            </button>
          ))}
          {trackableShipments.length === 0 && (
             <div className="py-8 text-center text-muted-foreground">
               <p className="text-xs">No active shipments in transit.</p>
             </div>
          )}
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-border bg-card p-4 glass-morphism">
            {shipment && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Meta details parsed from JSON eta */}
                {(() => {
                  let meta: any = null;
                  try {
                    if (shipment.cargo_description?.startsWith('LOGISTICS_META:')) {
                      meta = JSON.parse(shipment.cargo_description.replace('LOGISTICS_META:', ''));
                    }
                  } catch(e) {}

                  return (
                  <>
                    <div className="bg-secondary/20 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-3 w-3 text-accent" />
                        <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Est. Arrival</span>
                      </div>
                      <p className="text-sm font-bold text-card-foreground">
                        {meta ? new Date(meta.display_eta).toLocaleTimeString() : 'Calculating...'}
                      </p>
                    </div>

                    <div className="bg-secondary/20 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-1000" 
                            style={{ width: `${meta?.progress_percentage || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold">{meta?.progress_percentage || 0}%</span>
                      </div>
                    </div>

                    <div className={`${shipment.status === 'DELAYED' ? 'bg-delayed/10 border-delayed/30' : 'bg-secondary/20 border-border/50'} p-3 rounded-lg border`}>
                      <div className="flex items-center gap-2 mb-1">
                        {shipment.status === 'DELAYED' ? <AlertTriangle className="h-3 w-3 text-delayed" /> : <CheckCircle2 className="h-3 w-3 text-green-500" />}
                        <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Status</span>
                      </div>
                      <p className={`text-sm font-bold ${shipment.status === 'DELAYED' ? 'text-delayed' : 'text-green-500'}`}>
                        {shipment.status === 'DELAYED' ? `Delayed (${Math.round(meta?.delay_seconds || 0)}s)` : 'On Track'}
                      </p>
                    </div>

                    <div className="bg-secondary/20 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Navigation className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Next Stop</span>
                      </div>
                      <p className="text-sm font-bold text-card-foreground truncate">{shipment.dest_name}</p>
                    </div>
                  </>
                  );
                })()}
              </div>
            )}
            <LiveMap
              points={mapPoints as any}
              center={shipment ? [shipment.current_lat || shipment.origin_lat, shipment.current_lng || shipment.origin_lng] : undefined}
              zoom={6}
              route={shipment?.route_coordinates as any || activeRoute}
              className="h-[520px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

