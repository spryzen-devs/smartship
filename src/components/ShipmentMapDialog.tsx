import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Shipment } from "@/hooks/use-shipments";

// Fix for default leaflet icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface ShipmentMapDialogProps {
  shipment: Shipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShipmentMapDialog({ shipment, open, onOpenChange }: ShipmentMapDialogProps) {
  if (!shipment) return null;

  const center: [number, number] = [
    (shipment.origin_lat + shipment.dest_lat) / 2,
    (shipment.origin_lng + shipment.dest_lng) / 2
  ];

  const origin: [number, number] = [shipment.origin_lat, shipment.origin_lng];
  const dest: [number, number] = [shipment.dest_lat, shipment.dest_lng];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[600px] flex flex-col p-0 overflow-hidden">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle>Shipment Route: {shipment.tracking_id}</DialogTitle>
          </DialogHeader>
          <div className="mt-2 text-sm text-muted-foreground grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-foreground">Pickup</p>
              <p>{shipment.origin_name}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Destination</p>
              <p>{shipment.dest_name}</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 w-full relative min-h-0 bg-secondary/20">
          <MapContainer 
            center={center} 
            zoom={5} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={origin}>
              <Popup>
                <strong>Pickup:</strong> <br /> {shipment.origin_name}
              </Popup>
            </Marker>
            <Marker position={dest}>
              <Popup>
                <strong>Destination:</strong> <br /> {shipment.dest_name}
              </Popup>
            </Marker>
            <Polyline 
              positions={[origin, dest]} 
              color="#3b82f6" 
              dashArray="5, 10" 
              weight={3}
            />
          </MapContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
