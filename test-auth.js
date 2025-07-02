const { createClient } = require('@supabase/supabase-js');

console.log('Test Supabase...');
const supabase = createClient('https://test.supabase.co', 'fake-key');
console.log('✅ Supabase créé:', typeof supabase);