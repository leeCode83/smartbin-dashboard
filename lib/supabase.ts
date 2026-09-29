import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Kredensial Supabase belum tersedia. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di file .env (lihat .env.example)."
  );
}

// Anon key memang boleh terekspos di klien (dilindungi oleh RLS di database),
// jadi satu client ini aman dipakai baik di server (route handler) maupun browser.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
