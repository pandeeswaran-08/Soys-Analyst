import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@radix-ui/react-slot",
    ],
  },
  async redirects() {
    return [
      {
        source: "/dashboard/scenarios",
        destination: "/dashboard/stress-test",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
