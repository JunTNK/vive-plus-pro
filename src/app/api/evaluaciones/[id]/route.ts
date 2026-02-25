import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const evaluacion = await db.evaluacion.findUnique({
      where: { id },
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
    
    return NextResponse.json(evaluacion);
  } catch (error) {
    console.error('Error fetching evaluacion:', error);
    return NextResponse.json({ error: 'Error al obtener evaluación' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Calcular puntaje total y clasificación de riesgo
    let puntajeTotal = 0;
    
    if (data.equilibrioEstatico) {
      if (data.equilibrioEstatico >= 30) puntajeTotal += 3;
      else if (data.equilibrioEstatico >= 20) puntajeTotal += 2;
      else if (data.equilibrioEstatico >= 10) puntajeTotal += 1;
    }
    
    if (data.levantarseSentarse) {
      if (data.levantarseSentarse >= 15) puntajeTotal += 3;
      else if (data.levantarseSentarse >= 10) puntajeTotal += 2;
      else if (data.levantarseSentarse >= 5) puntajeTotal += 1;
    }
    
    if (data.flexionTronco) {
      if (data.flexionTronco >= 10) puntajeTotal += 3;
      else if (data.flexionTronco >= 5) puntajeTotal += 2;
      else if (data.flexionTronco >= 0) puntajeTotal += 1;
    }
    
    if (data.flexionesBrazo) {
      if (data.flexionesBrazo >= 15) puntajeTotal += 3;
      else if (data.flexionesBrazo >= 10) puntajeTotal += 2;
      else if (data.flexionesBrazo >= 5) puntajeTotal += 1;
    }
    
    if (data.juntarManosEspalda === 'si') puntajeTotal += 3;
    else if (data.juntarManosEspalda === 'parcial') puntajeTotal += 2;
    else if (data.juntarManosEspalda === 'no') puntajeTotal += 1;
    
    if (data.levantarseCaminar) {
      if (data.levantarseCaminar <= 10) puntajeTotal += 3;
      else if (data.levantarseCaminar <= 15) puntajeTotal += 2;
      else if (data.levantarseCaminar <= 20) puntajeTotal += 1;
    }
    
    if (data.marcha2Minutos) {
      if (data.marcha2Minutos >= 150) puntajeTotal += 3;
      else if (data.marcha2Minutos >= 100) puntajeTotal += 2;
      else if (data.marcha2Minutos >= 50) puntajeTotal += 1;
    }
    
    let clasificacionRiesgo = 'muy_alto';
    if (puntajeTotal >= 18) clasificacionRiesgo = 'bajo';
    else if (puntajeTotal >= 14) clasificacionRiesgo = 'moderado';
    else if (puntajeTotal >= 8) clasificacionRiesgo = 'alto';
    
    const evaluacion = await db.evaluacion.update({
      where: { id },
      data: {
        equilibrioEstatico: data.equilibrioEstatico ? parseFloat(data.equilibrioEstatico) : null,
        levantarseSentarse: data.levantarseSentarse ? parseInt(data.levantarseSentarse) : null,
        flexionTronco: data.flexionTronco ? parseFloat(data.flexionTronco) : null,
        flexionesBrazo: data.flexionesBrazo ? parseInt(data.flexionesBrazo) : null,
        juntarManosEspalda: data.juntarManosEspalda || null,
        levantarseCaminar: data.levantarseCaminar ? parseFloat(data.levantarseCaminar) : null,
        marcha2Minutos: data.marcha2Minutos ? parseInt(data.marcha2Minutos) : null,
        presionSistolica: data.presionSistolica ? parseInt(data.presionSistolica) : null,
        presionDiastolica: data.presionDiastolica ? parseInt(data.presionDiastolica) : null,
        frecuenciaCardiaca: data.frecuenciaCardiaca ? parseInt(data.frecuenciaCardiaca) : null,
        observaciones: data.observaciones || null,
        puntajeTotal,
        clasificacionRiesgo
      }
    });
    
    return NextResponse.json({
      ...evaluacion,
      mensaje: 'Evaluación actualizada correctamente'
    });
  } catch (error) {
    console.error('Error updating evaluacion:', error);
    return NextResponse.json({ error: 'Error al actualizar evaluación' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.evaluacion.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      success: true,
      mensaje: 'Evaluación eliminada correctamente' 
    });
  } catch (error) {
    console.error('Error deleting evaluacion:', error);
    return NextResponse.json({ error: 'Error al eliminar evaluación' }, { status: 500 });
  }
}
