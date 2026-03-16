import { mockWarehouses } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Plus, Warehouse as WarehouseIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Warehouses() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Warehouses</h1>
          <p className="text-sm text-muted-foreground">{mockWarehouses.length} active warehouses</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Warehouse</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockWarehouses.map(w => {
          const utilization = Math.round((w.used / w.capacity) * 100);
          return (
            <div key={w.id} className="rounded-xl border border-border bg-card p-4 transition-shadow duration-150 hover:shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-card-foreground">{w.name}</h3>
                  <p className="text-xs text-muted-foreground">{w.location}</p>
                </div>
                <div className="rounded-lg bg-accent/10 p-2">
                  <WarehouseIcon className="h-4 w-4 text-accent" />
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Capacity Utilization</span>
                  <span className={`font-semibold ${utilization > 90 ? 'text-delayed' : utilization > 70 ? 'text-warning' : 'text-success'}`}>
                    {utilization}%
                  </span>
                </div>
                <Progress value={utilization} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {w.used.toLocaleString()} / {w.capacity.toLocaleString()} units
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Inventory</p>
                <div className="space-y-1">
                  {w.items.map(item => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <span className="text-card-foreground">{item.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{item.quantity.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
