import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configuración para imágenes externas
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**',
      },
    ],
  },

  // Configuración para Turbopack (Next.js 16)
  turbopack: {},

  // Excluir carpetas de Supabase
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
};

export default nextConfig;
