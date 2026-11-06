import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // TypeORM loads database drivers dynamically, so it must not be bundled.
  serverExternalPackages: ["typeorm", "mysql2"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
