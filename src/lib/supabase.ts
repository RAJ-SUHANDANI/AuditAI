import { createClient } from "@supabase/supabase-js";

let supabaseUrlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
if (supabaseUrlRaw.endsWith("/rest/v1/")) {
  supabaseUrlRaw = supabaseUrlRaw.slice(0, -9);
} else if (supabaseUrlRaw.endsWith("/rest/v1")) {
  supabaseUrlRaw = supabaseUrlRaw.slice(0, -8);
}
if (supabaseUrlRaw.endsWith("/")) {
  supabaseUrlRaw = supabaseUrlRaw.slice(0, -1);
}
const supabaseUrl = supabaseUrlRaw;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Create client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Checks if the Supabase environment variables have been filled with real credentials.
 * If not, the application will fallback to local storage & mock backend simulation
 * so recruiters can run and evaluate the app's full flow instantly.
 */
export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    !!url &&
    !!key &&
    url !== "https://your-project-id.supabase.co" &&
    key !== "your-supabase-anon-key" &&
    url !== "https://placeholder-project.supabase.co" &&
    key !== "placeholder-anon-key"
  );
};
