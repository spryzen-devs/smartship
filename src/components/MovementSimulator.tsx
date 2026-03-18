import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Play, Square, Loader2, Route } from "lucide-react";
import { getRoute } from "@/lib/logistics-api";
import { toast } from "sonner";
import { useShipments, Shipment } from "@/hooks/use-shipments";

interface MovementSimulatorProps {
  shipment: Shipment;
  onRouteChange?: (route: [number, number][]) => void;
}

export function MovementSimulator({ shipment, onRouteChange }: MovementSimulatorProps) {
  const { updateShipmentStatus } = useShipments();
  const [isUpdating, setIsUpdating] = useState(false);

  const startSimulation = async () => {
    setIsUpdating(true);
    try {
      await updateShipmentStatus.mutateAsync({ 
        id: shipment.id, 
        status: 'IN_TRANSIT' 
      });
      toast.success(`Shipment ${shipment.tracking_id} started!`);
      // Notify parent to show the route if it's available in the DB row
      if (shipment.route_coordinates) {
        onRouteChange?.(shipment.route_coordinates as any);
      }
    } catch (err) {
      toast.error("Failed to start shipment");
    } finally {
      setIsUpdating(false);
    }
  };

  const stopSimulation = async () => {
    setIsUpdating(true);
    try {
      await updateShipmentStatus.mutateAsync({ 
        id: shipment.id, 
        status: 'PENDING' 
      });
      toast.warning("Simulation stopped and reset to pending");
    } catch (err) {
      toast.error("Failed to stop shipment");
    } finally {
      setIsUpdating(false);
    }
  };

  const isInTransit = shipment.status === 'IN_TRANSIT';
  const isPending = shipment.status === 'PENDING';
  const progress = shipment.route_coordinates && (shipment.current_route_index ?? 0) > 0
    ? (shipment.current_route_index ?? 0) / (shipment.route_coordinates.length - 1)
    : 0;

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border border-primary/20 bg-primary/5">
      <div className="flex-1">
        <p className="text-[10px] uppercase font-bold text-primary mb-1">
          {isInTransit ? 'Moving via Backend' : isPending ? 'Ready to Start' : shipment.status.replace('_', ' ')}
        </p>
        <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${progress * 100}%` }} 
          />
        </div>
      </div>
      <Button 
        size="sm" 
        variant={isInTransit ? "destructive" : "default"}
        onClick={isInTransit ? stopSimulation : startSimulation}
        className="h-8 px-3"
        disabled={isUpdating || (shipment.status === 'DELIVERED')}
      >
        {isUpdating ? (
          <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> ...</>
        ) : isInTransit ? (
          <><Square className="h-3 w-3 mr-1" /> Stop</>
        ) : isPending ? (
          <><Play className="h-3 w-3 mr-1" /> Start Shipment</>
        ) : (
          <><Play className="h-3 w-3 mr-1" /> Re-Start</>
        )}
      </Button>
    </div>
  );
}
