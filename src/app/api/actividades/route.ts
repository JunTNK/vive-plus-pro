import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar actividades
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adultoMayorId = searchParams.get('adultoMayorId');
    const tipoActividad = searchParams.get('tipoActividad');
    
    const where: Record<string, unknown> = {};
    
    if (adultoMayorId) where.adultoMayorId = adultoMayorId;
    if (tipoActividad) where.tipoActividad = tipoActividad;

    const actividades = await db.actividad.findMany({
      where,
      include: {
        adultoMayor: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });

    return NextResponse.json(actividades);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    return NextResponse.json(
      { error: 'Error al obtener actividades' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva actividad
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const nuevaActividad = await db.actividad.create({
      data: {
        adultoMayorId: body.adultoMayorId,
        fecha: new Date(body.fecha),
        tipoActividad: body.tipoActividad || 'otra',
        titulo: body.titulo,
        descripcion: body.descripcion || null,
        duracion: body.duracion || null,
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

    return NextResponse.json(nuevaActividad, { status: 201 });
  } catch (error) {
    console.error('Error al crear actividad:', error);
    return NextResponse.json(
      { error: 'Error al crear actividad' },
      { status: 500 }
    );
  }
}
