import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress the webpack-vs-turbopack warning — we have no webpack config
  turbopack: {},
};

export default nextConfig;
