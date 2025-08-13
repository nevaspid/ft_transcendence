/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_URL_AVATAR: string;
  readonly VITE_TWOFA_API_URL: string;
  readonly VITE_GOOGLE_API_URL: string;
  // Ajoute ici d'autres variables d'environnement si besoin
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
