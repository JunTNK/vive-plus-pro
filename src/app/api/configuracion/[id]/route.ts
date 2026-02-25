import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener una configuración específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const config = await db.configuracion.findUnique({
      where: { id }
    });

    if (!config) {
      return NextResponse.json({ error: 'Configuración no encontrada' }, { status: 404 });
    }

    // Ocultar valor si es secreto
    if (config.esSecreto) {
      config.valor = '••••••••••••';
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
  }
}

// DELETE - Eliminar configuración
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.configuracion.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar configuración:', error);
    return NextResponse.json({ error: 'Error al eliminar configuración' }, { status: 500 });
  }
}

// PUT - Actualizar configuración
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { valor, descripcion, categoria, esSecreto } = data;

    const config = await db.configuracion.update({
      where: { id },
      data: {
        valor,
        descripcion,
        categoria,
        esSecreto
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 });
  }
}
