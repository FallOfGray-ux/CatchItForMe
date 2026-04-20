// Supabase client for React Native + Web.
// Paste your keys below (copy from supabase/SETUP.md step 4).
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// 👇 PASTE YOUR OWN VALUES HERE (see ../supabase/SETUP.md) 👇
export const SUPABASE_URL      = "PASTE_YOUR_PROJECT_URL_HERE";
export const SUPABASE_ANON_KEY = "PASTE_YOUR_ANON_KEY_HERE";

export const isConfigured =
  SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20;

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,        // persists session across app launches
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,    // RN doesn't have URLs to parse
      },
    })
  : null;
