import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  // Las imágenes se suben por server action, no por cliente: un solo camino de
  // subida y cero JS. A cambio, el body de la action carga el archivo.
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
};

export default nextConfig;
