import {
  LayoutDashboard, Package, Truck, Users, Warehouse, MapPin, BarChart3, Settings, Menu, LogOut,
} from "lucide-react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Shipments", url: "/shipments", icon: Package },
  { title: "Live Tracking", url: "/tracking", icon: MapPin },
  { title: "Drivers", url: "/drivers", icon: Users },
  { title: "Vehicles", url: "/vehicles", icon: Truck },
  { title: "Warehouses", url: "/warehouses", icon: Warehouse },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar transition-all duration-150 ease-out",
        collapsed ? "w-16" : "w-60"
      )}>
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <button onClick={() => setCollapsed(!collapsed)} className="text-sidebar-foreground hover:text-sidebar-primary transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          {!collapsed && (
            <span className="ml-3 text-sm font-bold tracking-tight text-sidebar-foreground uppercase italic underline decoration-primary decoration-2 underline-offset-4">
              SmartShip <span className="text-primary not-italic">.</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <RouterNavLink
                key={item.url}
                to={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                    : "text-sidebar-muted font-bold hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </RouterNavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2 space-y-1">
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors text-left">
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={cn("flex-1 transition-all duration-150 ease-out", collapsed ? "ml-16" : "ml-60")}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
