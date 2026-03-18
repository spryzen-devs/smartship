import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useWarehouses() {
  const queryClient = useQueryClient();

  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const { data: warehousesData, error: warehousesError } = await supabase
        .from("warehouses")
        .select(`*, inventory (*)`)
        .order("name");
      
      if (warehousesError) {
        toast.error("Failed to fetch warehouses");
        throw warehousesError;
      }

      const { data: shipmentsData } = await supabase
        .from("shipments")
        .select("source_warehouse_id, destination_warehouse_id, status")
        .in("status", ["PENDING", "IN_TRANSIT", "DELAYED"]);

      return warehousesData.map(w => {
        const outgoing = (shipmentsData || []).filter(s => s.source_warehouse_id === w.id).length;
        const incoming = (shipmentsData || []).filter(s => s.destination_warehouse_id === w.id).length;
        return { ...w, stats: { incoming, outgoing } };
      });
    },
  });

  const addWarehouse = useMutation({
    mutationFn: async (newWarehouse: { name: string, location: string, capacity: number, lat: number, lng: number }) => {
      const { data, error } = await supabase.from("warehouses").insert(newWarehouse).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse added successfully");
    },
    onError: (error: any) => toast.error(error.message || "Failed to add warehouse")
  });

  const updateInventory = useMutation({
    mutationFn: async ({ warehouseId, productName, change }: { warehouseId: string, productName: string, change: number }) => {
      const { data: inv, error: fetchError } = await supabase
        .from("inventory").select("id, quantity")
        .eq("warehouse_id", warehouseId).eq("product_name", productName).single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (inv) {
        const newQuantity = inv.quantity + change;
        if (newQuantity < 0) throw new Error("Insufficient stock");
        if (newQuantity === 0) {
          const { error } = await supabase.from("inventory").delete().eq("id", inv.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("inventory").update({ quantity: newQuantity }).eq("id", inv.id);
          if (error) throw error;
        }
      } else {
        if (change <= 0) throw new Error("Insufficient stock");
        const { error } = await supabase.from("inventory").insert({ warehouse_id: warehouseId, product_name: productName, quantity: change });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["warehouses"] }),
    onError: (error: any) => toast.error(error.message || "Failed to update inventory")
  });

  const setInventoryQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: string, quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase.from("inventory").delete().eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("inventory").update({ quantity }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["warehouses"] }); toast.success("Inventory updated"); },
    onError: (error: any) => toast.error(error.message || "Failed to update inventory")
  });

  const deleteInventory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inventory").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["warehouses"] }); toast.success("Item removed from inventory"); },
    onError: (error: any) => toast.error(error.message || "Failed to remove item")
  });

  const addInventory = useMutation({
    mutationFn: async ({ warehouseId, productName, quantity }: { warehouseId: string, productName: string, quantity: number }) => {
      const { error } = await supabase.from("inventory").insert({ warehouse_id: warehouseId, product_name: productName, quantity });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["warehouses"] }); toast.success("Product added to inventory"); },
    onError: (error: any) => toast.error(error.message || "Failed to add product")
  });

  return { warehouses, isLoading, addWarehouse, updateInventory, setInventoryQuantity, deleteInventory, addInventory };
}
