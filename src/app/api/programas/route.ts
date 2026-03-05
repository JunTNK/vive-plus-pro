import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const programas = await db.programa.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { participantes: true }
        }
      }
    });

    return NextResponse.json(programas);
  } catch (error) {
    console.error('Error al obtener programas:', error);
    return NextResponse.json(
      { error: 'Error al obtener programas' },
      { status: 500 }
    );
  }
}
