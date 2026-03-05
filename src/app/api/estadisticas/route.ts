import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener estadísticas generales
export async function GET() {
  try {
    // Conteos básicos
    const [totalAdultos, adultosActivos, totalVisitas, visitasPendientes, totalActividades] = await Promise.all([
      db.adultoMayor.count(),
      db.adultoMayor.count({ where: { activo: true } }),
      db.visita.count(),
      db.visita.count({ where: { estado: 'programada' } }),
      db.actividad.count(),
    ]);

    // Visitas de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const visitasHoy = await db.visita.count({
      where: {
        fecha: {
          gte: hoy,
          lt: manana
        }
      }
    });

    // Próximas visitas (siguientes 7 días)
    const en7Dias = new Date();
    en7Dias.setDate(en7Dias.getDate() + 7);
    
    const proximasVisitas = await db.visita.findMany({
      where: {
        fecha: {
          gte: hoy,
          lte: en7Dias
        },
        estado: 'programada'
      },
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
      orderBy: { fecha: 'asc' },
      take: 10
    });

    // Últimas actividades
    const ultimasActividades = await db.actividad.findMany({
      include: {
        adultoMayor: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      },
      orderBy: { fecha: 'desc' },
      take: 5
    });

    // Visitas por tipo de actividad
    const actividadesPorTipo = await db.actividad.groupBy({
      by: ['tipoActividad'],
      _count: {
        id: true
      }
    });

    // Visitas por estado
    const visitasPorEstado = await db.visita.groupBy({
      by: ['estado'],
      _count: {
        id: true
      }
    });

    return NextResponse.json({
      resumen: {
        totalAdultos,
        adultosActivos,
        totalVisitas,
        visitasPendientes,
        totalActividades,
        visitasHoy
      },
      proximasVisitas,
      ultimasActividades,
      actividadesPorTipo: actividadesPorTipo.map(item => ({
        tipo: item.tipoActividad,
        cantidad: item._count.id
      })),
      visitasPorEstado: visitasPorEstado.map(item => ({
        estado: item.estado,
        cantidad: item._count.id
      }))
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
