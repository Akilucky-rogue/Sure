import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isdyfsybhliwxzhndprt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZHlmc3liaGxpd3h6aG5kcHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTI2ODYsImV4cCI6MjA3MjQ4ODY4Nn0.7QJB9-t9oS4qW4Bzob0FreZkan2RCPhG_Ff1vSuHgJA';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
  }
});