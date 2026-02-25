import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { evaluacionId, formato } = await request.json();
    
    const evaluacion = await db.evaluacion.findUnique({
      where: { id: evaluacionId },
      include: {
        adultoMayor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            fechaNacimiento: true,
            genero: true,
            condicionesSalud: true,
            medicamentos: true
          }
        }
      }
    });

    if (!evaluacion) {
      return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 });
    }

    const edad = new Date().getFullYear() - new Date(evaluacion.adultoMayor.fechaNacimiento).getFullYear();
    const fechaEval = new Date(evaluacion.fecha).toLocaleDateString('es-PR');

    // Calcular interpretaciones
    const interpretaciones = {
      equilibrio: interpretarEquilibrio(evaluacion.equilibrioEstatico),
      levantarse: interpretarLevantarse(evaluacion.levantarseSentarse),
      flexionTronco: interpretarFlexionTronco(evaluacion.flexionTronco),
      flexionesBrazo: interpretarFlexionesBrazo(evaluacion.flexionesBrazo),
      manosEspalda: interpretarManosEspalda(evaluacion.juntarManosEspalda),
      levantarseCaminar: interpretarLevantarseCaminar(evaluacion.levantarseCaminar),
      marcha: interpretarMarcha(evaluacion.marcha2Minutos)
    };

    // Datos para el PDF/imagen
    const datosInforme = {
      participante: {
        nombre: `${evaluacion.adultoMayor.nombre} ${evaluacion.adultoMayor.apellido}`,
        edad,
        genero: evaluacion.adultoMayor.genero || 'No especificado',
        condicionesSalud: evaluacion.adultoMayor.condicionesSalud || 'No reportadas',
        medicamentos: evaluacion.adultoMayor.medicamentos || 'No reportados'
      },
      evaluacion: {
        fecha: fechaEval,
        puntajeTotal: evaluacion.puntajeTotal,
        clasificacionRiesgo: evaluacion.clasificacionRiesgo,
        pruebas: {
          equilibrioEstatico: {
            valor: evaluacion.equilibrioEstatico,
            unidad: 'segundos',
            interpretacion: interpretaciones.equilibrio
          },
          levantarseSentarse: {
            valor: evaluacion.levantarseSentarse,
            unidad: 'repeticiones',
            interpretacion: interpretaciones.levantarse
          },
          flexionTronco: {
            valor: evaluacion.flexionTronco,
            unidad: 'cm',
            interpretacion: interpretaciones.flexionTronco
          },
          flexionesBrazo: {
            valor: evaluacion.flexionesBrazo,
            unidad: 'repeticiones',
            interpretacion: interpretaciones.flexionesBrazo
          },
          manosEspalda: {
            valor: evaluacion.juntarManosEspalda,
            unidad: '',
            interpretacion: interpretaciones.manosEspalda
          },
          levantarseCaminar: {
            valor: evaluacion.levantarseCaminar,
            unidad: 'segundos',
            interpretacion: interpretaciones.levantarseCaminar
          },
          marcha2Minutos: {
            valor: evaluacion.marcha2Minutos,
            unidad: 'pasos',
            interpretacion: interpretaciones.marcha
          }
        },
        signosVitales: {
          presionSistolica: evaluacion.presionSistolica,
          presionDiastolica: evaluacion.presionDiastolica,
          frecuenciaCardiaca: evaluacion.frecuenciaCardiaca
        },
        observaciones: evaluacion.observaciones,
        recomendaciones: evaluacion.recomendaciones
      }
    };

    return NextResponse.json({
      success: true,
      datos: datosInforme,
      formato
    });

  } catch (error) {
    console.error('Error exportando evaluación:', error);
    return NextResponse.json({ error: 'Error al exportar evaluación' }, { status: 500 });
  }
}

// Funciones de interpretación
function interpretarEquilibrio(valor: number | null): string {
  if (!valor) return 'No evaluado';
  if (valor >= 30) return 'Excelente';
  if (valor >= 20) return 'Bueno';
  if (valor >= 10) return 'Moderado';
  return 'Necesita mejora';
}

function interpretarLevantarse(valor: number | null): string {
  if (!valor) return 'No evaluado';
  if (valor >= 15) return 'Excelente';
  if (valor >= 10) return 'Bueno';
  if (valor >= 5) return 'Moderado';
  return 'Necesita mejora';
}

function interpretarFlexionTronco(valor: number | null): string {
  if (valor === null) return 'No evaluado';
  if (valor >= 10) return 'Excelente';
  if (valor >= 5) return 'Bueno';
  if (valor >= 0) return 'Moderado';
  return 'Necesita mejora';
}

function interpretarFlexionesBrazo(valor: number | null): string {
  if (!valor) return 'No evaluado';
  if (valor >= 15) return 'Excelente';
  if (valor >= 10) return 'Bueno';
  if (valor >= 5) return 'Moderado';
  return 'Necesita mejora';
}

function interpretarManosEspalda(valor: string | null): string {
  if (!valor) return 'No evaluado';
  if (valor === 'si') return 'Excelente';
  if (valor === 'parcial') return 'Moderado';
  return 'Necesita mejora';
}

function interpretarLevantarseCaminar(valor: number | null): string {
  if (!valor) return 'No evaluado';
  if (valor <= 10) return 'Excelente';
  if (valor <= 15) return 'Bueno';
  if (valor <= 20) return 'Moderado';
  return 'Necesita mejora';
}

function interpretarMarcha(valor: number | null): string {
  if (!valor) return 'No evaluado';
  if (valor >= 150) return 'Excelente';
  if (valor >= 100) return 'Bueno';
  if (valor >= 50) return 'Moderado';
  return 'Necesita mejora';
}
