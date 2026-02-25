import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar visitas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adultoMayorId = searchParams.get('adultoMayorId');
    const estado = searchParams.get('estado');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    
    const where: Record<string, unknown> = {};
    
    if (adultoMayorId) where.adultoMayorId = adultoMayorId;
    if (estado) where.estado = estado;
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha = { ...where.fecha, gte: new Date(fechaDesde) };
      if (fechaHasta) where.fecha = { ...where.fecha, lte: new Date(fechaHasta) };
    }

    const visitas = await db.visita.findMany({
      where,
      include: {
        adultoMayor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            direccion: true,
            telefono: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });

    return NextResponse.json(visitas);
  } catch (error) {
    console.error('Error al obtener visitas:', error);
    return NextResponse.json(
      { error: 'Error al obtener visitas' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva visita
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const nuevaVisita = await db.visita.create({
      data: {
        adultoMayorId: body.adultoMayorId,
        fecha: new Date(body.fecha),
        duracion: body.duracion || 60,
        tipoVisita: body.tipoVisita || 'rutinaria',
        estado: body.estado || 'programada',
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

    return NextResponse.json(nuevaVisita, { status: 201 });
  } catch (error) {
    console.error('Error al crear visita:', error);
    return NextResponse.json(
      { error: 'Error al crear visita' },
      { status: 500 }
    );
  }
}
