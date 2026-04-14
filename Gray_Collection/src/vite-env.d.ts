/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_MESSENGER_URL?: string;
  readonly VITE_ZALO_URL?: string;
  readonly VITE_FACEBOOK_URL?: string;
  readonly VITE_TIKTOK_URL?: string;
  readonly VITE_INSTAGRAM_URL?: string;
  readonly VITE_SHOPEE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
