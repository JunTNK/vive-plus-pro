import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');
    const programaId = searchParams.get('programaId');

    const where: Record<string, unknown> = { activo: true };
    
    if (categoria) {
      where.categoria = categoria;
    }
    if (programaId) {
      where.programaId = programaId;
    }

    const plantillas = await db.plantillaActividad.findMany({
      where,
      orderBy: [
        { categoria: 'asc' },
        { nombre: 'asc' }
      ]
    });

    return NextResponse.json(plantillas);
  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    return NextResponse.json(
      { error: 'Error al obtener plantillas' },
      { status: 500 }
    );
  }
}
