import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener una visita por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const visita = await db.visita.findUnique({
      where: { id },
      include: {
        adultoMayor: true
      }
    });

    if (!visita) {
      return NextResponse.json(
        { error: 'Visita no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(visita);
  } catch (error) {
    console.error('Error al obtener visita:', error);
    return NextResponse.json(
      { error: 'Error al obtener visita' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar visita
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const visitaActualizada = await db.visita.update({
      where: { id },
      data: {
        adultoMayorId: body.adultoMayorId,
        fecha: body.fecha ? new Date(body.fecha) : undefined,
        duracion: body.duracion,
        tipoVisita: body.tipoVisita,
        estado: body.estado,
        observaciones: body.observaciones || null,
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

    return NextResponse.json(visitaActualizada);
  } catch (error) {
    console.error('Error al actualizar visita:', error);
    return NextResponse.json(
      { error: 'Error al actualizar visita' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar visita
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.visita.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Visita eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar visita:', error);
    return NextResponse.json(
      { error: 'Error al eliminar visita' },
      { status: 500 }
    );
  }
}
