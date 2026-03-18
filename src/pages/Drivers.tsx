import { useDrivers, DriverStatus } from "@/hooks/use-drivers";
import { StatusBadge } from "@/components/StatusBadge";
import { User, Phone, CreditCard, Loader2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddDriverDialog } from "@/components/AddDriverDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Drivers() {
  const { drivers, isLoading, updateDriverStatus } = useDrivers();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground animate-pulse">
        <Loader2 className="h-8 w-8 mb-4 animate-spin text-primary" />
        <p className="text-sm">Loading drivers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Drivers</h1>
          <p className="text-sm text-muted-foreground">{drivers.length} registered drivers</p>
        </div>
        <AddDriverDialog />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden glass-morphism">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Driver</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">License</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Joined At</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => (
                <tr key={d.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors duration-150">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {d.name.charAt(0)}
                      </div>
                      <p className="font-medium text-card-foreground">{d.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {d.phone}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3 w-3" />
                      {d.license_number}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(d.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">Set Status</DropdownMenuLabel>
                        {(["AVAILABLE", "ON_DELIVERY", "OFFLINE"] as DriverStatus[]).map((status) => (
                          <DropdownMenuItem 
                            key={status}
                            onClick={() => updateDriverStatus.mutate({ id: d.id, status })}
                            disabled={d.status === status}
                          >
                            Mark {status.replace("_", " ").toLowerCase()}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {drivers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <User className="h-8 w-8 mb-2" />
            <p className="text-sm">No drivers found. Start by adding one!</p>
          </div>
        )}
      </div>
    </div>
  );
}

