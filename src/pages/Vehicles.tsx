import { mockVehicles } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Truck } from "lucide-react";

export default function Vehicles() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fleet Management</h1>
          <p className="text-sm text-muted-foreground">{mockVehicles.length} registered vehicles</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Vehicle</Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vehicle No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capacity</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Driver</th>
            </tr>
          </thead>
          <tbody>
            {mockVehicles.map(v => (
              <tr key={v.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors duration-150">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-card-foreground">{v.vehicle_number}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-card-foreground">{v.type}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-card-foreground">{(v.capacity_kg / 1000).toFixed(1)}T</td>
                <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                <td className="px-4 py-3 text-card-foreground">{v.current_driver || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
