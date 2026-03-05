import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar notas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adultoMayorId = searchParams.get('adultoMayorId');
    const tipo = searchParams.get('tipo');
    
    const where: Record<string, unknown> = {};
    
    if (adultoMayorId) where.adultoMayorId = adultoMayorId;
    if (tipo) where.tipo = tipo;

    const notas = await db.nota.findMany({
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

    return NextResponse.json(notas);
  } catch (error) {
    console.error('Error al obtener notas:', error);
    return NextResponse.json(
      { error: 'Error al obtener notas' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva nota
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const nuevaNota = await db.nota.create({
      data: {
        adultoMayorId: body.adultoMayorId,
        titulo: body.titulo,
        contenido: body.contenido,
        tipo: body.tipo || 'general',
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

    return NextResponse.json(nuevaNota, { status: 201 });
  } catch (error) {
    console.error('Error al crear nota:', error);
    return NextResponse.json(
      { error: 'Error al crear nota' },
      { status: 500 }
    );
  }
}
