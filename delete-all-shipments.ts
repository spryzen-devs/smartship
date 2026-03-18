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

async function deleteAll() {
  console.log('Deleting all shipments and tracking logs...');
  
  // Delete tracking logs first due to foreign key constraints
  const { error: logsError } = await supabase.from('tracking_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (logsError) console.error('Error deleting logs:', logsError);
  
  const { error: shipmentsError } = await supabase.from('shipments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (shipmentsError) console.error('Error deleting shipments:', shipmentsError);
  
  console.log('Cleanup complete.');
}

deleteAll();
