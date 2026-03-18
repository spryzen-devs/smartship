import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TrackingPoint {
  shipment_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export const useTracking = (activeShipmentIds: string[]) => {
  const [positions, setPositions] = useState<Record<string, TrackingPoint>>({});

  useEffect(() => {
    if (activeShipmentIds.length === 0) {
      setPositions({});
      return;
    }

    // 1. Fetch latest position for each active shipment
    const fetchLatestPositions = async () => {
      const { data, error } = await supabase
        .from("tracking_logs")
        .select("*")
        .in("shipment_id", activeShipmentIds)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Error fetching tracking logs:", error);
        return;
      }

      // Reduce to only the latest point per shipment
      const latest = (data as unknown as TrackingPoint[]).reduce((acc, point) => {
        if (!acc[point.shipment_id] || new Date(point.timestamp) > new Date(acc[point.shipment_id].timestamp)) {
          acc[point.shipment_id] = point;
        }
        return acc;
      }, {} as Record<string, TrackingPoint>);

      setPositions(latest);
    };

    fetchLatestPositions();

    // 2. Subscribe to real-time updates
    const channel = supabase
      .channel("live-tracking")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tracking_logs",
        },
        (payload) => {
          const newPoint = payload.new as TrackingPoint;
          if (activeShipmentIds.includes(newPoint.shipment_id)) {
            setPositions((prev) => ({
              ...prev,
              [newPoint.shipment_id]: newPoint,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [JSON.stringify(activeShipmentIds)]);

  return { positions };
};
