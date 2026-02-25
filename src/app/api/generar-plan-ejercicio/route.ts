import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { evaluacionId, participanteId, duracionSemanas, objetivos } = await request.json();
    
    // Obtener datos del participante
    const participante = await db.adultoMayor.findUnique({
      where: { id: participanteId }
    });
    
    // Obtener la evaluación
    const evaluacion = await db.evaluacion.findUnique({
      where: { id: evaluacionId }
    });
    
    // Obtener evaluaciones históricas para análisis de tendencias
    const evaluacionesHistoricas = await db.evaluacion.findMany({
      where: { 
        adultoMayorId: participanteId,
        id: { not: evaluacionId }
      },
      orderBy: { fecha: 'desc' },
      take: 5
    });

    if (!participante || !evaluacion) {
      return NextResponse.json({ error: 'Datos no encontrados' }, { status: 404 });
    }

    const edad = new Date().getFullYear() - new Date(participante.fechaNacimiento).getFullYear();
    
    // Crear instancia de IA
    const zai = await ZAI.create();

    // Calcular tendencias si hay evaluaciones previas
    let tendencias = '';
    if (evaluacionesHistoricas.length > 0) {
      const primera = evaluacionesHistoricas[evaluacionesHistoricas.length - 1];
      const ultima = evaluacionesHistoricas[0];
      tendencias = `
TENDENCIAS (comparando primera y última evaluación):
- Equilibrio: ${primera.equilibrioEstatico || 'N/A'} → ${ultima.equilibrioEstatico || 'N/A'} seg
- Levantarse/Sentarse: ${primera.levantarseSentarse || 'N/A'} → ${ultima.levantarseSentarse || 'N/A'} reps
- Puntaje Total: ${primera.puntajeTotal || 'N/A'} → ${ultima.puntajeTotal || 'N/A'}
- Número de evaluaciones previas: ${evaluacionesHistoricas.length}
`;
    }

    const systemPrompt = `Eres un fisioterapeuta experto en ejercicio para adultos mayores, especializado en la metodología ECOSAFE PIVE 2020. Tu tarea es crear un PLAN DE EJERCICIO PERSONALIZADO basado en los resultados de la evaluación funcional.

El plan debe:
1. Ser seguro y apropiado para el nivel de condición física identificado
2. Enfocarse en las áreas que necesitan más mejora
3. Incluir progresión gradual
4. Considerar las condiciones de salud y medicamentos
5. Incluir ejercicios específicos con repeticiones, series y descansos
6. Indicar precauciones y modificaciones

FORMATO DE RESPUESTA (usa este formato exacto):
# 🏃 Plan de Ejercicio Personalizado

## 📊 Análisis Inicial
[Breve resumen del estado actual]

## 🎯 Objetivos del Plan
[Objetivos específicos basados en la evaluación]

## ⚠️ Precauciones Importantes
[Lista de precauciones según condiciones de salud]

## 📅 Cronograma Semanal

### Semana 1-2: Adaptación
[Día por día con ejercicios específicos]

### Semana 3-4: Progresión
[Ejercicios más avanzados]

## 💪 Ejercicios Detallados

### 1. [Nombre del ejercicio]
- **Objetivo:** [qué trabaja]
- **Instrucciones:** [cómo hacerlo]
- **Repeticiones:** [número]
- **Series:** [número]
- **Descanso:** [tiempo]
- **Modificación:** [versión más fácil si es necesario]
- **Progresión:** [versión más difícil]

[Repetir para cada ejercicio]

## 📈 Indicadores de Progreso
[Señales de que está funcionando]

## 🚫 Señales de Alerta
[Cuándo detenerse o consultar médico]

Responde SIEMPRE en español.`;

    const userMessage = `Genera un plan de ejercicio personalizado para:

**DATOS DEL PARTICIPANTE:**
- Nombre: ${participante.nombre} ${participante.apellido}
- Edad: ${edad} años
- Género: ${participante.genero || 'No especificado'}
- Condiciones de Salud: ${participante.condicionesSalud || 'Ninguna reportada'}
- Medicamentos: ${participante.medicamentos || 'Ninguno reportado'}
- Ayudas técnicas: ${participante.usoAyudas || 'Ninguna'}

**RESULTADOS DE EVALUACIÓN ACTUAL:**
- Equilibrio Estático: ${evaluacion.equilibrioEstatico || 'N/A'} segundos
- Levantarse/Sentarse: ${evaluacion.levantarseSentarse || 'N/A'} repeticiones
- Flexión de Tronco: ${evaluacion.flexionTronco || 'N/A'} cm
- Flexiones de Brazo: ${evaluacion.flexionesBrazo || 'N/A'} repeticiones
- Manos tras Espalda: ${evaluacion.juntarManosEspalda || 'N/A'}
- Levantarse-Caminar: ${evaluacion.levantarseCaminar || 'N/A'} segundos
- Marcha 2 Minutos: ${evaluacion.marcha2Minutos || 'N/A'} pasos

**PUNTAJE TOTAL: ${evaluacion.puntajeTotal || 'N/A'}/21**
**CLASIFICACIÓN DE RIESGO: ${evaluacion.clasificacionRiesgo || 'N/A'}**

${tendencias}

**PARÁMETROS DEL PLAN:**
- Duración: ${duracionSemanas || 4} semanas
- Objetivos adicionales: ${objetivos || 'Mejorar condición general'}

Genera un plan completo y detallado.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      thinking: { type: 'disabled' }
    });

    const planEjercicio = completion.choices[0]?.message?.content;

    if (!planEjercicio) {
      throw new Error('No se pudo generar el plan');
    }

    // Guardar el plan como nota
    const nota = await db.nota.create({
      data: {
        adultoMayorId: participanteId,
        titulo: `🏃 Plan de Ejercicio - ${new Date().toLocaleDateString('es-PR')} (${duracionSemanas || 4} semanas)`,
        contenido: planEjercicio,
        tipo: 'salud'
      }
    });

    return NextResponse.json({
      success: true,
      plan: planEjercicio,
      notaId: nota.id,
      mensaje: 'Plan de ejercicio generado exitosamente'
    });

  } catch (error) {
    console.error('Error generando plan:', error);
    return NextResponse.json({
      error: 'Error al generar plan de ejercicio',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
