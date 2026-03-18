import { createClient } from '@supabase/supabase-js';

// Load .env
try {
  // @ts-ignore
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env');
  }
} catch (e) {}

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_PUBLISHABLE_KEY!);

async function startShipment() {
  const { error } = await supabase
    .from('shipments')
    .update({ status: 'IN_TRANSIT' })
    .eq('tracking_id', 'TRK-DGAGYIUTF');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Shipment started!');
  }
}

startShipment().catch(console.error);
