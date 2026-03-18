import { createClient } from '@supabase/supabase-js';

// Load .env
try {
  // @ts-ignore
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env');
  }
} catch (e) {}

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_PUBLISHABLE_KEY!);

async function listShipments() {
  const { data, error } = await supabase.from('shipments').select('id, tracking_id, status');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

listShipments().catch(console.error);
