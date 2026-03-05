import { NextRequest, NextResponse } from 'next/server';

// Contraseña predeterminada para acceder a configuraciones sensibles
const ADMIN_PASSWORD = 'VivePlusPro2024!Admin';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Contraseña requerida' 
      }, { status: 400 });
    }

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ 
        success: true, 
        authenticated: true,
        message: 'Acceso autorizado'
      });
    }

    return NextResponse.json({ 
      success: false, 
      authenticated: false,
      error: 'Contraseña incorrecta' 
    }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Error al verificar contraseña' 
    }, { status: 500 });
  }
}
