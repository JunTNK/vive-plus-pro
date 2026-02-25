import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

export async function GET() {
  try {
    const evaluaciones = await db.evaluacion.findMany({
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
      take: 50
    });
    return NextResponse.json(evaluaciones);
  } catch (error) {
    console.error('Error fetching evaluaciones:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Calcular puntaje total y clasificación de riesgo
    let puntajeTotal = 0;
    
    // Equilibrio estático (0-3 puntos)
    if (data.equilibrioEstatico) {
      if (data.equilibrioEstatico >= 30) puntajeTotal += 3;
      else if (data.equilibrioEstatico >= 20) puntajeTotal += 2;
      else if (data.equilibrioEstatico >= 10) puntajeTotal += 1;
    }
    
    // Levantarse y sentarse (0-3 puntos)
    if (data.levantarseSentarse) {
      if (data.levantarseSentarse >= 15) puntajeTotal += 3;
      else if (data.levantarseSentarse >= 10) puntajeTotal += 2;
      else if (data.levantarseSentarse >= 5) puntajeTotal += 1;
    }
    
    // Flexión de tronco (0-3 puntos)
    if (data.flexionTronco) {
      if (data.flexionTronco >= 10) puntajeTotal += 3;
      else if (data.flexionTronco >= 5) puntajeTotal += 2;
      else if (data.flexionTronco >= 0) puntajeTotal += 1;
    }
    
    // Flexiones de brazo (0-3 puntos)
    if (data.flexionesBrazo) {
      if (data.flexionesBrazo >= 15) puntajeTotal += 3;
      else if (data.flexionesBrazo >= 10) puntajeTotal += 2;
      else if (data.flexionesBrazo >= 5) puntajeTotal += 1;
    }
    
    // Juntar manos detrás de la espalda (0-3 puntos)
    if (data.juntarManosEspalda === 'si') puntajeTotal += 3;
    else if (data.juntarManosEspalda === 'parcial') puntajeTotal += 2;
    else if (data.juntarManosEspalda === 'no') puntajeTotal += 1;
    
    // Levantarse, caminar y sentarse (0-3 puntos)
    if (data.levantarseCaminar) {
      if (data.levantarseCaminar <= 10) puntajeTotal += 3;
      else if (data.levantarseCaminar <= 15) puntajeTotal += 2;
      else if (data.levantarseCaminar <= 20) puntajeTotal += 1;
    }
    
    // Marcha 2 minutos (0-3 puntos)
    if (data.marcha2Minutos) {
      if (data.marcha2Minutos >= 150) puntajeTotal += 3;
      else if (data.marcha2Minutos >= 100) puntajeTotal += 2;
      else if (data.marcha2Minutos >= 50) puntajeTotal += 1;
    }
    
    // Clasificación de riesgo
    let clasificacionRiesgo = 'muy_alto';
    if (puntajeTotal >= 18) clasificacionRiesgo = 'bajo';
    else if (puntajeTotal >= 14) clasificacionRiesgo = 'moderado';
    else if (puntajeTotal >= 8) clasificacionRiesgo = 'alto';
    
    const evaluacion = await db.evaluacion.create({
      data: {
        adultoMayorId: data.adultoMayorId,
        equilibrioEstatico: data.equilibrioEstatico ? parseInt(data.equilibrioEstatico) : null,
        levantarseSentarse: data.levantarseSentarse ? parseInt(data.levantarseSentarse) : null,
        flexionTronco: data.flexionTronco ? parseFloat(data.flexionTronco) : null,
        flexionesBrazo: data.flexionesBrazo ? parseInt(data.flexionesBrazo) : null,
        juntarManosEspalda: data.juntarManosEspalda || null,
        levantarseCaminar: data.levantarseCaminar ? parseFloat(data.levantarseCaminar) : null,
        marcha2Minutos: data.marcha2Minutos ? parseInt(data.marcha2Minutos) : null,
        presionSistolica: data.presionSistolica ? parseInt(data.presionSistolica) : null,
        presionDiastolica: data.presionDiastolica ? parseInt(data.presionDiastolica) : null,
        frecuenciaCardiaca: data.frecuenciaCardiaca ? parseInt(data.frecuenciaCardiaca) : null,
        frecuenciaRespiratoria: data.frecuenciaRespiratoria ? parseInt(data.frecuenciaRespiratoria) : null,
        saturacionOxigeno: data.saturacionOxigeno ? parseFloat(data.saturacionOxigeno) : null,
        puntajeTotal: puntajeTotal,
        clasificacionRiesgo: clasificacionRiesgo,
        observaciones: data.observaciones || null,
        recomendaciones: data.recomendaciones || null
      }
    });
    
    // Actualizar el adulto mayor con la fecha de última evaluación y puntaje
    await db.adultoMayor.update({
      where: { id: data.adultoMayorId },
      data: {
        fechaUltimaEvaluacion: new Date(),
        puntajeRiesgo: puntajeTotal
      }
    });
    
    // 🤖 ANÁLISIS AUTOMÁTICO CON IA
    let informeIA = null;
    try {
      // Obtener datos del participante
      const participante = await db.adultoMayor.findUnique({
        where: { id: data.adultoMayorId }
      });
      
      if (participante) {
        const edad = new Date().getFullYear() - new Date(participante.fechaNacimiento).getFullYear();
        const zai = await ZAI.create();
        
        const systemPrompt = `Eres un experto en evaluación funcional de adultos mayores, especializado en la metodología ECOSAFE PIVE 2020. Analiza los resultados y proporciona:
1. RESUMEN DEL ESTADO FUNCIONAL
2. ANÁLISIS POR DOMINIO (equilibrio, fuerza, flexibilidad, movilidad)
3. NIVEL DE RIESGO (bajo/moderado/alto/muy alto)
4. RECOMENDACIONES DE EJERCICIO específicas
5. SUGERENCIAS DE PROGRAMA
6. SIGNOS DE ALERTA (si los hay)
7. PRÓXIMOS PASOS

Responde en español, formato claro y profesional.`;

        const userMessage = `Participante: ${participante.nombre} ${participante.apellido}, ${edad} años
Condiciones: ${participante.condicionesSalud || 'No reportadas'}
Medicamentos: ${participante.medicamentos || 'No reportados'}

RESULTADOS ECOSAFE:
- Equilibrio Estático: ${evaluacion.equilibrioEstatico || 'N/A'} seg
- Levantarse/Sentarse: ${evaluacion.levantarseSentarse || 'N/A'} reps
- Flexión Tronco: ${evaluacion.flexionTronco || 'N/A'} cm
- Flexiones Brazo: ${evaluacion.flexionesBrazo || 'N/A'} reps
- Juntar Manos Espalda: ${evaluacion.juntarManosEspalda || 'N/A'}
- Levantarse/Caminar: ${evaluacion.levantarseCaminar || 'N/A'} seg
- Marcha 2min: ${evaluacion.marcha2Minutos || 'N/A'} pasos

Signos Vitales:
- PA: ${evaluacion.presionSistolica || '-'}/${evaluacion.presionDiastolica || '-'} mmHg
- FC: ${evaluacion.frecuenciaCardiaca || '-'} lpm
- SpO2: ${evaluacion.saturacionOxigeno || '-'}%

PUNTAJE: ${puntajeTotal}/21 - RIESGO: ${clasificacionRiesgo.toUpperCase()}

Proporciona análisis y recomendaciones.`;

        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'assistant', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          thinking: { type: 'disabled' }
        });

        informeIA = completion.choices[0]?.message?.content;
        
        if (informeIA) {
          // Guardar informe como nota
          await db.nota.create({
            data: {
              adultoMayorId: data.adultoMayorId,
              titulo: `📊 Informe IA - Evaluación ${new Date().toLocaleDateString('es-PR')}`,
              contenido: `# Análisis de Evaluación Funcional\n\n**Participante:** ${participante.nombre} ${participante.apellido}\n**Fecha:** ${new Date().toLocaleDateString('es-PR')}\n**Puntaje:** ${puntajeTotal}/21\n**Clasificación:** ${clasificacionRiesgo.toUpperCase()}\n\n---\n\n${informeIA}`,
              tipo: 'salud'
            }
          });
          
          // Actualizar evaluación con recomendaciones
          await db.evaluacion.update({
            where: { id: evaluacion.id },
            data: { recomendaciones: informeIA }
          });
        }
      }
    } catch (aiError) {
      console.error('Error en análisis IA:', aiError);
      // No fallar la evaluación si el análisis IA falla
    }
    
    return NextResponse.json({
      ...evaluacion,
      informeGenerado: !!informeIA,
      mensaje: informeIA ? 'Evaluación guardada con análisis IA generado' : 'Evaluación guardada'
    });
  } catch (error) {
    console.error('Error creating evaluacion:', error);
    return NextResponse.json({ error: 'Error al crear evaluación' }, { status: 500 });
  }
}
