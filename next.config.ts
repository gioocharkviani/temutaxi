import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["typeorm", "mysql2", "nodemailer"],
  cacheComponents: true,
  // The page was called "rating" before; old links and search results keep working.
  async redirects() {
    return [{ source: "/:lang(ka|en|ru)/rating", destination: "/:lang/leaderboard", permanent: true }];
  },
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
