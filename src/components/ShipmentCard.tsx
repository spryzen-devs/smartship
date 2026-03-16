import { StatusBadge } from "./StatusBadge";
import type { Shipment } from "@/lib/mock-data";

export function ShipmentCard({ shipment }: { shipment: Shipment }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-shadow duration-150 hover:shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{shipment.tracking_id}</span>
          <h3 className="font-bold text-card-foreground">{shipment.dest_name}</h3>
        </div>
        <StatusBadge status={shipment.status} />
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Origin</p>
          <p className="font-medium text-card-foreground">{shipment.origin_name}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Priority</p>
          <p className={`font-medium ${shipment.priority === 'URGENT' ? 'text-delayed' : shipment.priority === 'HIGH' ? 'text-accent' : 'text-card-foreground'}`}>{shipment.priority}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Driver</p>
          <p className="font-medium text-card-foreground">{shipment.driver_name || 'Unassigned'}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">ETA</p>
          <p className="font-medium text-accent">{new Date(shipment.eta).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
        </div>
      </div>
    </div>
  );
}
