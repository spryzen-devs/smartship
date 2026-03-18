-- Enable Realtime for Shipments and Tracking Logs
ALTER PUBLICATION supabase_realtime ADD TABLE shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE tracking_logs;
