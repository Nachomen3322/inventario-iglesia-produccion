import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@tensorflow/tfjs-node"],
};

export default nextConfig;
