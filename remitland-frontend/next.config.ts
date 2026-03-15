import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" output mode creates a self-contained build for Docker/AWS
  output: "standalone",
};

export default nextConfig;
