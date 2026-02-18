import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  reactStrictMode: false,
  poweredByHeader: false,
};

export default nextConfig;
