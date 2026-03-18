import { createClient } from '@supabase/supabase-js';
import { setDefaultResultOrder } from 'node:dns';

setDefaultResultOrder('ipv4first');

try {
  // @ts-ignore
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env');
  }
} catch (e) {}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('shipments').select('id, tracking_id, status');
  if (error) {
    console.error(error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

check();
