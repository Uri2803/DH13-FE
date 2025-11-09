/// <reference types="vite/client" />
interface ImportMetaEnv {
//   readonly VITE_GOOGLE_AUTH_CLIENT_ID: string
//   readonly VITE_API_URL: string
//   readonly VITE_PORT: string
//   readonly VITE_APP_NODE_ENV: string
//   readonly VITE_GOOGLE_CLIENT_SECRET: string
//   readonly VITE_GOOGLE_REDIRECT_URI: string
    readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}