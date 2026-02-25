import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Contraseña predeterminada
const ADMIN_PASSWORD = 'VivePlusPro2024!Admin';

// GET - Obtener valores reales de configuraciones protegidas
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const password = authHeader?.replace('Bearer ', '');

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ 
        error: 'No autorizado' 
      }, { status: 401 });
    }

    // Obtener todas las configuraciones con valores reales
    const configuraciones = await db.configuracion.findMany({
      where: { activo: true },
      orderBy: [{ categoria: 'asc' }, { clave: 'asc' }]
    });

    return NextResponse.json(configuraciones);
  } catch (error) {
    console.error('Error al obtener configuración protegida:', error);
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
  }
}

// PUT - Actualizar configuración protegida
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const password = authHeader?.replace('Bearer ', '');

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ 
        error: 'No autorizado' 
      }, { status: 401 });
    }

    const data = await request.json();
    const { id, valor } = data;

    if (!id || !valor) {
      return NextResponse.json({ error: 'ID y valor son requeridos' }, { status: 400 });
    }

    const config = await db.configuracion.update({
      where: { id },
      data: { valor }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 });
  }
}
