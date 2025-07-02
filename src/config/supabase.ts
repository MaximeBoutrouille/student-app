import 'react-native-url-polyfill/auto';
// Remplacez l'import par require
const { createClient } = require('@supabase/supabase-js');
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

// ⚠️ REMPLACEZ par vos vraies valeurs Supabase
const supabaseUrl = 'xxx';
const supabaseAnonKey = 'xxx';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});