import { execFileSync } from "node:child_process";
import type { NextConfig } from "next";

/** Versión de la app para el feedback: el commit del build (en Vercel viene en una variable). */
function version(): string {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "dev";
  }
}

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    NEXT_PUBLIC_APP_VERSION: version(),
  },
};

export default nextConfig;
