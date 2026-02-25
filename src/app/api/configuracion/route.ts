import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener toda la configuración
export async function GET() {
  try {
    const configuraciones = await db.configuracion.findMany({
      orderBy: [{ categoria: 'asc' }, { clave: 'asc' }]
    });

    // Ocultar valores de secretos
    const configuracionesSeguras = configuraciones.map(config => ({
      ...config,
      valor: config.esSecreto ? '••••••••••••' : config.valor
    }));

    return NextResponse.json(configuracionesSeguras);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
  }
}

// POST - Crear o actualizar configuración
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { clave, valor, descripcion, categoria, esSecreto } = data;

    if (!clave || !valor) {
      return NextResponse.json({ error: 'Clave y valor son requeridos' }, { status: 400 });
    }

    // Upsert - crear o actualizar
    const config = await db.configuracion.upsert({
      where: { clave },
      create: {
        clave,
        valor,
        descripcion: descripcion || null,
        categoria: categoria || 'general',
        esSecreto: esSecreto || false
      },
      update: {
        valor,
        descripcion: descripcion || null,
        categoria: categoria || 'general',
        esSecreto: esSecreto || false
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 });
  }
}

// PUT - Actualizar múltiples configuraciones
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { configuraciones } = data;

    if (!Array.isArray(configuraciones)) {
      return NextResponse.json({ error: 'Se espera un array de configuraciones' }, { status: 400 });
    }

    const resultados = [];

    for (const config of configuraciones) {
      const { clave, valor } = config;
      if (clave && valor) {
        const actualizado = await db.configuracion.upsert({
          where: { clave },
          create: {
            clave,
            valor,
            descripcion: config.descripcion || null,
            categoria: config.categoria || 'general',
            esSecreto: config.esSecreto || false
          },
          update: {
            valor,
            descripcion: config.descripcion || null,
            categoria: config.categoria || 'general',
            esSecreto: config.esSecreto || false
          }
        });
        resultados.push(actualizado);
      }
    }

    return NextResponse.json({ success: true, actualizados: resultados.length });
  } catch (error) {
    console.error('Error al actualizar configuraciones:', error);
    return NextResponse.json({ error: 'Error al actualizar configuraciones' }, { status: 500 });
  }
}
