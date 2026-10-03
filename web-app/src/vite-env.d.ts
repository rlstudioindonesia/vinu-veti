/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTENT_URL?: string;
  readonly VITE_ENABLE_ADMIN?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_BUCKET?: string;
}
