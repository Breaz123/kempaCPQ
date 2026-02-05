/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BC_API_BASE_URL?: string;
  readonly VITE_BC_COMPANY_ID?: string;
  readonly VITE_BC_API_VERSION?: string;
  readonly VITE_BC_ACCESS_TOKEN?: string;
  readonly VITE_BC_API_KEY?: string;
  readonly VITE_BC_API_TIMEOUT?: string;
  // Fallback for non-prefixed vars (for compatibility)
  readonly BC_API_BASE_URL?: string;
  readonly BC_COMPANY_ID?: string;
  readonly BC_API_VERSION?: string;
  readonly BC_ACCESS_TOKEN?: string;
  readonly BC_API_KEY?: string;
  readonly BC_API_TIMEOUT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
