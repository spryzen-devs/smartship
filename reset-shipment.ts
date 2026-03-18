import { createClient } from '@supabase/supabase-js';

// Load .env
try {
  // @ts-ignore
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env');
  }
} catch (e) {}

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_PUBLISHABLE_KEY!);

async function resetShipment() {
  const trackingId = 'SHP-DGAGYIUTF';
  console.log(`Resetting shipment ${trackingId}...`);
  
  const { error } = await supabase
    .from('shipments')
    .update({ 
      status: 'PENDING',
      current_lat: null, 
      current_lng: null,
      current_route_index: 0,
      cargo_description: null,
      eta: null
    })
    .eq('tracking_id', trackingId);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Shipment reset successful!');
  }
}

resetShipment().catch(console.error);
