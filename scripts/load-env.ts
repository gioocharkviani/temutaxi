import { loadEnvConfig } from "@next/env";

// Scripts run outside Next.js, so they read .env the same way the app does.
loadEnvConfig(process.cwd(), false, { info() {}, error: console.error });
