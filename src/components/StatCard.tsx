import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
  iconClassName?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className, iconClassName }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 transition-shadow duration-150 hover:shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">{value}</p>
          {trend && (
            <p className={cn("mt-1 text-xs font-medium", trend.value >= 0 ? "text-success" : "text-delayed")}>
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn("rounded-lg p-2", iconClassName || "bg-accent/10")}>
          <Icon className={cn("h-5 w-5", iconClassName ? "" : "text-accent")} />
        </div>
      </div>
    </div>
  );
}
