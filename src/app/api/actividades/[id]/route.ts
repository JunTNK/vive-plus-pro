import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Actualizar actividad
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const actividadActualizada = await db.actividad.update({
      where: { id },
      data: {
        fecha: body.fecha ? new Date(body.fecha) : undefined,
        tipoActividad: body.tipoActividad,
        titulo: body.titulo,
        descripcion: body.descripcion || null,
        duracion: body.duracion,
        notas: body.notas || null,
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

    return NextResponse.json(actividadActualizada);
  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    return NextResponse.json(
      { error: 'Error al actualizar actividad' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar actividad
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.actividad.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Actividad eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    return NextResponse.json(
      { error: 'Error al eliminar actividad' },
      { status: 500 }
    );
  }
}
