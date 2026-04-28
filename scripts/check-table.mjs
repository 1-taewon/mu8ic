import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const eqIndex = line.indexOf('=');
    if (eqIndex > 0) {
        const key = line.substring(0, eqIndex).trim();
        const value = line.substring(eqIndex + 1).trim();
        env[key] = value;
    }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.from('musics').select('count');
    if (error) {
        console.log('❌ Error or table missing:', error.message);
    } else {
        console.log('✅ Table "musics" exists.');
    }
}

check();
