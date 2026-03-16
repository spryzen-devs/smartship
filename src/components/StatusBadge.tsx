import { cn } from "@/lib/utils";

type StatusType = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED' | 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'IN_USE' | 'MAINTENANCE';

const statusStyles: Record<StatusType, string> = {
  PENDING: "bg-muted text-muted-foreground",
  ASSIGNED: "bg-primary/10 text-primary",
  IN_TRANSIT: "bg-accent/10 text-accent",
  DELIVERED: "bg-success/10 text-success",
  DELAYED: "bg-delayed/10 text-delayed",
  AVAILABLE: "bg-success/10 text-success",
  ON_TRIP: "bg-accent/10 text-accent",
  OFF_DUTY: "bg-muted text-muted-foreground",
  IN_USE: "bg-accent/10 text-accent",
  MAINTENANCE: "bg-warning/10 text-warning",
};

const statusLabels: Record<StatusType, string> = {
  PENDING: "Pending",
  ASSIGNED: "Assigned",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  DELAYED: "Delayed",
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  OFF_DUTY: "Off Duty",
  IN_USE: "In Use",
  MAINTENANCE: "Maintenance",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = status as StatusType;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider",
      statusStyles[s] || "bg-muted text-muted-foreground",
      className
    )}>
      {(s === 'IN_TRANSIT' || s === 'ON_TRIP') && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot" />
      )}
      {statusLabels[s] || status}
    </span>
  );
}
