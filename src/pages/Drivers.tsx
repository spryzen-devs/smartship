import { mockDrivers } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Star } from "lucide-react";

export default function Drivers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Drivers</h1>
          <p className="text-sm text-muted-foreground">{mockDrivers.length} registered drivers</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Driver</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockDrivers.map(d => (
          <div key={d.id} className="rounded-xl border border-border bg-card p-4 transition-shadow duration-150 hover:shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-card-foreground">{d.name}</h3>
                <p className="text-xs text-muted-foreground">{d.phone}</p>
              </div>
              <StatusBadge status={d.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">License</p>
                <p className="font-mono text-xs text-card-foreground">{d.license_number}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Vehicle</p>
                <p className="font-mono text-xs text-card-foreground">{d.assigned_vehicle || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Deliveries</p>
                <p className="font-medium text-card-foreground">{d.total_deliveries}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-warning fill-warning" />
                  <span className="font-medium text-card-foreground">{d.rating}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
