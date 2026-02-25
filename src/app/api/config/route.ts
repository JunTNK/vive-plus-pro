import { NextResponse } from 'next/server';

// API para verificar el estado de las variables de entorno
// IMPORTANTE: No expone los valores reales, solo si están configurados

export async function GET() {
  const config = {
    database: {
      configured: !!process.env.DATABASE_URL,
      type: 'SQLite'
    },
    googleOAuth: {
      clientIdConfigured: !!process.env.GOOGLE_CLIENT_ID,
      clientSecretConfigured: !!process.env.GOOGLE_CLIENT_SECRET,
      redirectUriConfigured: !!process.env.GOOGLE_REDIRECT_URI,
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'No configurado'
    },
    nextAuth: {
      secretConfigured: !!process.env.NEXTAUTH_SECRET,
      urlConfigured: !!process.env.NEXTAUTH_URL,
      url: process.env.NEXTAUTH_URL || 'No configurado'
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  };

  const allConfigured = 
    config.database.configured &&
    config.googleOAuth.clientIdConfigured &&
    config.googleOAuth.clientSecretConfigured &&
    config.nextAuth.secretConfigured &&
    config.nextAuth.urlConfigured;

  return NextResponse.json({
    success: true,
    allConfigured,
    config,
    missingVariables: [
      !config.database.configured && 'DATABASE_URL',
      !config.googleOAuth.clientIdConfigured && 'GOOGLE_CLIENT_ID',
      !config.googleOAuth.clientSecretConfigured && 'GOOGLE_CLIENT_SECRET',
      !config.nextAuth.secretConfigured && 'NEXTAUTH_SECRET',
      !config.nextAuth.urlConfigured && 'NEXTAUTH_URL'
    ].filter(Boolean)
  });
}
