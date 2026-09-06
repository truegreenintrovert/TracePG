import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
export const appUrl = (import.meta.env.VITE_APP_URL?.trim() || window.location.origin).replace(/\/$/, "");

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabasePublishableKey &&
    !supabaseUrl.includes("your-project-ref") &&
    !supabasePublishableKey.includes("your-supabase-publishable-key"),
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
