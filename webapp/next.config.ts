import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Silences Next's workspace-root inference warning: the repo root (one level
  // up from webapp/) contains other lockfiles/configs Next would otherwise guess
  // at, since the whole pipeline (prompts/, references/, tools/) lives there too.
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
