import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Verificar conexión y crear datos básicos
    const programasExistentes = await db.programa.count();
    
    if (programasExistentes === 0) {
      // Crear programas predeterminados
      await db.programa.createMany({
        data: [
          {
            nombre: 'Movimiento Activo',
            descripcion: 'Programa de ejercicios suaves para mejorar movilidad y equilibrio',
            objetivo: 'Mejorar la movilidad articular y prevenir caídas',
            duracionSemanas: 8,
            sesionesPorSemana: 3,
            intensidad: 'baja',
            categoria: 'movilidad',
            actividades: 'Caminata, Estiramientos, Equilibrio',
            condicionesAdecuadas: 'Adultos mayores con movilidad reducida',
            contraindicaciones: 'Fracturas recientes, dolor agudo',
            activo: true
          },
          {
            nombre: 'Fortalecimiento Integral',
            descripcion: 'Programa de fortalecimiento muscular para adultos mayores',
            objetivo: 'Aumentar la fuerza muscular y funcionalidad',
            duracionSemanas: 12,
            sesionesPorSemana: 2,
            intensidad: 'moderada',
            categoria: 'fortalecimiento',
            actividades: 'Sentadillas, Peso muerto, Empujes',
            condicionesAdecuadas: 'Adultos mayores con debilidad muscular',
            contraindicaciones: 'Lesiones articulares agudas',
            activo: true
          },
          {
            nombre: 'Equilibrio y Coordinación',
            descripcion: 'Programa enfocado en prevención de caídas',
            objetivo: 'Mejorar el equilibrio y reducir riesgo de caídas',
            duracionSemanas: 6,
            sesionesPorSemana: 3,
            intensidad: 'baja',
            categoria: 'equilibrio',
            actividades: 'Equilibrio estático, Marcha, Coordinación',
            condicionesAdecuadas: 'Adultos mayores con riesgo de caídas',
            contraindicaciones: 'Vértigo agudo, Mareos',
            activo: true
          },
          {
            nombre: 'Bienestar Cognitivo',
            descripcion: 'Programa de estimulación cognitiva y social',
            objetivo: 'Mantener y mejorar funciones cognitivas',
            duracionSemanas: 8,
            sesionesPorSemana: 2,
            intensidad: 'baja',
            categoria: 'cognitivo',
            actividades: 'Juegos de memoria, Lectura, Conversación',
            condicionesAdecuadas: 'Adultos mayores con deterioro cognitivo leve',
            activo: true
          }
        ]
      });
    }

    // Verificar que todo funciona
    const totalProgramas = await db.programa.count();
    const totalAdultos = await db.adultoMayor.count();

    return NextResponse.json({
      success: true,
      mensaje: 'Base de datos inicializada correctamente',
      estadisticas: {
        programas: totalProgramas,
        adultosMayores: totalAdultos
      }
    });
  } catch (error) {
    console.error('Error inicializando BD:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      sugerencia: 'Verifica que DATABASE_URL y DATABASE_AUTH_TOKEN estén configurados correctamente en Vercel'
    }, { status: 500 });
  }
}
