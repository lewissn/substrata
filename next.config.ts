import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {};

export default withPWA({
  dest: "public",
  // Disable SW in development to avoid caching surprises
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  workboxOptions: {
    // Never cache external tile/API services — these can cause storage bloat
    // or serve stale geodata.  Same-origin /api/* is NetworkFirst by default.
    runtimeCaching: [
      {
        // Mapbox — tiles, events, API, fonts — all NetworkOnly
        urlPattern: /^https?:\/\/(.*\.)?mapbox\.com\//,
        handler: "NetworkOnly",
      },
      {
        // Wikipedia / MediaWiki
        urlPattern: /^https?:\/\/.*\.wikipedia\.org\//,
        handler: "NetworkOnly",
      },
      {
        // OpenStreetMap Nominatim geocoding
        urlPattern: /^https?:\/\/nominatim\.openstreetmap\.org\//,
        handler: "NetworkOnly",
      },
      {
        // Paleobiology Database
        urlPattern: /^https?:\/\/paleobiodb\.org\//,
        handler: "NetworkOnly",
      },
      {
        // Internal /api/* — NetworkFirst, short timeout, no fallback cache
        urlPattern: /\/api\//,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-routes",
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
})(nextConfig);
