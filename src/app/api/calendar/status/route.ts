import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Verificar estado de conexión con Google Calendar
export async function GET() {
  const hasApiKey = !!process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY;
  const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
  const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;

  // Verificar si la configuración completa existe
  const configured = hasClientId && hasClientSecret;
  
  // Verificar si hay sesión activa con Google
  try {
    const session = await getServerSession();
    
    if (session?.user) {
      return NextResponse.json({
        configured: true,
        connected: true,
        email: session.user.email || 'Usuario conectado',
        hasApiKey,
      });
    }
  } catch (error) {
    // NextAuth puede no estar configurado aún
    console.log('NextAuth session check:', error);
  }

  return NextResponse.json({
    configured,
    connected: false,
    hasApiKey,
    hasClientId,
    hasClientSecret,
    message: configured 
      ? 'Google Calendar configurado. Conecta tu cuenta para sincronizar.'
      : 'Falta configurar GOOGLE_CLIENT_SECRET para habilitar OAuth2.',
  });
}
