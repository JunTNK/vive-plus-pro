import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadatos PWA
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#00C6D7" },
    { media: "(prefers-color-scheme: dark)", color: "#00A8B5" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Vive Plus Pro - Evaluación Funcional ECOSAFE",
    template: "%s | Vive Plus Pro",
  },
  description: "Sistema de evaluación funcional ECOSAFE PIVE 2020 para adultos mayores. Gestión de participantes, evaluaciones físicas y seguimiento de salud.",
  keywords: [
    "ECOSAFE",
    "PIVE 2020",
    "evaluación funcional",
    "adultos mayores",
    "salud",
    "bienestar",
    "fisioterapia",
    "geriatría",
    "Puerto Rico",
  ],
  authors: [{ name: "Vive Plus Pro" }],
  creator: "Vive Plus Pro",
  publisher: "Vive Plus Pro",
  
  // PWA
  applicationName: "Vive Plus Pro",
  manifest: "/manifest.json",
  
  // Icons
  icons: {
    icon: [
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo.png", sizes: "any" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/logo.png",
  },
  
  // Apple PWA
  appleWebApp: {
    capable: true,
    title: "Vive Plus Pro",
    statusBarStyle: "default",
  },
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "es_PR",
    url: "/",
    siteName: "Vive Plus Pro",
    title: "Vive Plus Pro - Evaluación Funcional ECOSAFE",
    description: "Sistema de evaluación funcional ECOSAFE PIVE 2020 para adultos mayores",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Vive Plus Pro Logo",
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Vive Plus Pro - Evaluación Funcional ECOSAFE",
    description: "Sistema de evaluación funcional ECOSAFE PIVE 2020 para adultos mayores",
    images: ["/icons/icon-512x512.png"],
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Formatos
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  
  // Otros
  category: "health",
  classification: "Medical Application",
};

// Script para registrar Service Worker
const registerSW = `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js')
        .then(function(registration) {
          console.log('SW registrado:', registration.scope);
        })
        .catch(function(error) {
          console.log('SW error:', error);
        });
    });
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script dangerouslySetInnerHTML={{ __html: registerSW }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
