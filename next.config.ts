import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configuración PWA
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        { key: 'Service-Worker-Allowed', value: '/' },
      ],
    },
    {
      source: '/manifest.json',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=86400' },
        { key: 'Content-Type', value: 'application/manifest+json' },
      ],
    },
    {
      source: '/icons/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],
  
  // Dominios de imágenes permitidos (para deployment)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  
  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_APP_NAME: 'Vive Plus Pro',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
  
  // Configuración para deployment
  experimental: {
    // Habilitar optimizaciones
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Redirecciones
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Rewrites para API routes si es necesario
  async rewrites() {
    return [];
  },
};

export default nextConfig;
