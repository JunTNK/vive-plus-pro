import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Actualizar nota
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const notaActualizada = await db.nota.update({
      where: { id },
      data: {
        titulo: body.titulo,
        contenido: body.contenido,
        tipo: body.tipo,
      },
      include: {
        adultoMayor: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      }
    });

    return NextResponse.json(notaActualizada);
  } catch (error) {
    console.error('Error al actualizar nota:', error);
    return NextResponse.json(
      { error: 'Error al actualizar nota' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar nota
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.nota.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Nota eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar nota:', error);
    return NextResponse.json(
      { error: 'Error al eliminar nota' },
      { status: 500 }
    );
  }
}
