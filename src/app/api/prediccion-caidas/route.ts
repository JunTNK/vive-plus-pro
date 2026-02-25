import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { participanteId } = await request.json();
    
    // Obtener datos del participante
    const participante = await db.adultoMayor.findUnique({
      where: { id: participanteId }
    });
    
    // Obtener todas las evaluaciones históricas
    const evaluaciones = await db.evaluacion.findMany({
      where: { adultoMayorId: participanteId },
      orderBy: { fecha: 'desc' },
      take: 10
    });

    if (!participante) {
      return NextResponse.json({ error: 'Participante no encontrado' }, { status: 404 });
    }

    if (evaluaciones.length === 0) {
      return NextResponse.json({ 
        error: 'No hay evaluaciones suficientes',
        mensaje: 'Se requiere al menos una evaluación para el análisis'
      }, { status: 400 });
    }

    const edad = new Date().getFullYear() - new Date(participante.fechaNacimiento).getFullYear();
    
    // Calcular estadísticas
    const calcularPromedio = (arr: (number | null)[]) => {
      const valores = arr.filter(v => v !== null) as number[];
      return valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : null;
    };
    
    const calcularTendencia = (arr: (number | null)[]) => {
      const valores = arr.filter(v => v !== null) as number[];
      if (valores.length < 2) return 'insuficiente';
      const ultimos = valores.slice(0, Math.ceil(valores.length / 2));
      const primeros = valores.slice(-Math.ceil(valores.length / 2));
      const promUltimos = ultimos.reduce((a, b) => a + b, 0) / ultimos.length;
      const promPrimeros = primeros.reduce((a, b) => a + b, 0) / primeros.length;
      const diff = promUltimos - promPrimeros;
      if (Math.abs(diff) < 0.5) return 'estable';
      return diff > 0 ? 'mejorando' : 'empeorando';
    };

    const puntajesHistoricos = evaluaciones.map(e => e.puntajeTotal);
    const equilibrioHistorico = evaluaciones.map(e => e.equilibrioEstatico);
    const levantarseHistorico = evaluaciones.map(e => e.levantarseSentarse);
    const marchaHistorico = evaluaciones.map(e => e.marcha2Minutos);
    const caminarHistorico = evaluaciones.map(e => e.levantarseCaminar);

    const stats = {
      promedioPuntaje: calcularPromedio(puntajesHistoricos),
      tendenciaPuntaje: calcularTendencia(puntajesHistoricos),
      promedioEquilibrio: calcularPromedio(equilibrioHistorico),
      tendenciaEquilibrio: calcularTendencia(equilibrioHistorico),
      promedioLevantarse: calcularPromedio(levantarseHistorico),
      tendenciaLevantarse: calcularTendencia(levantarseHistorico),
      promedioMarcha: calcularPromedio(marchaHistorico),
      tendenciaMarcha: calcularTendencia(marchaHistorico),
      promedioCaminar: calcularPromedio(caminarHistorico),
      tendenciaCaminar: calcularTendencia(caminarHistorico)
    };

    // Crear instancia de IA
    const zai = await ZAI.create();

    const systemPrompt = `Eres un especialista en geriatría y prevención de caídas en adultos mayores. Tu tarea es realizar un ANÁLISIS DE RIESGO DE CAÍDAS basado en datos históricos de evaluaciones funcionales.

Debes analizar:
1. Tendencias en los resultados (mejorando, estable, empeorando)
2. Factores de riesgo identificados
3. Probabilidad de caídas (baja, moderada, alta, muy alta)
4. Recomendaciones específicas de prevención

FORMATO DE RESPUESTA:
# 🛡️ Análisis de Riesgo de Caídas

## 📊 Resumen Ejecutivo
[Nivel de riesgo general con porcentaje estimado]

## 📈 Análisis de Tendencias
[Análisis de cada prueba y su evolución]

## ⚠️ Factores de Riesgo Identificados
[Lista de factores que aumentan el riesgo]

## 🎯 Puntos Fuertes
[Áreas donde se desempeña bien]

## 🚨 Señales de Alerta
[Indicadores que requieren atención inmediata]

## 💡 Recomendaciones de Prevención
[Acciones específicas para reducir el riesgo]

## 📅 Próxima Evaluación Recomendada
[Cuándo debería reevaluarse]

Responde SIEMPRE en español.`;

    const historicoEvaluaciones = evaluaciones.map((e, i) => `
Evaluación ${i + 1} (${new Date(e.fecha).toLocaleDateString('es-PR')}):
- Puntaje: ${e.puntajeTotal || 'N/A'}/21
- Riesgo: ${e.clasificacionRiesgo || 'N/A'}
- Equilibrio: ${e.equilibrioEstatico || 'N/A'} seg
- Levantarse/Sentarse: ${e.levantarseSentarse || 'N/A'} reps
- Marcha: ${e.marcha2Minutos || 'N/A'} pasos
- Tiempo Caminar: ${e.levantarseCaminar || 'N/A'} seg
`).join('\n');

    const userMessage = `Realiza un análisis de riesgo de caídas para:

**DATOS DEL PARTICIPANTE:**
- Nombre: ${participante.nombre} ${participante.apellido}
- Edad: ${edad} años
- Género: ${participante.genero || 'No especificado'}
- Condiciones: ${participante.condicionesSalud || 'Ninguna reportada'}
- Medicamentos: ${participante.medicamentos || 'Ninguno'}
- Ayudas técnicas: ${participante.usoAyudas || 'Ninguna'}
- Vive solo: ${participante.viveSolo ? 'Sí' : 'No'}

**ESTADÍSTICAS CALCULADAS:**
- Promedio Puntaje Total: ${stats.promedioPuntaje?.toFixed(1) || 'N/A'}/21 (Tendencia: ${stats.tendenciaPuntaje})
- Promedio Equilibrio: ${stats.promedioEquilibrio?.toFixed(1) || 'N/A'} seg (Tendencia: ${stats.tendenciaEquilibrio})
- Promedio Levantarse/Sentarse: ${stats.promedioLevantarse?.toFixed(1) || 'N/A'} reps (Tendencia: ${stats.tendenciaLevantarse})
- Promedio Marcha: ${stats.promedioMarcha?.toFixed(0) || 'N/A'} pasos (Tendencia: ${stats.tendenciaMarcha})
- Promedio Tiempo Caminar: ${stats.promedioCaminar?.toFixed(1) || 'N/A'} seg (Tendencia: ${stats.tendenciaCaminar})

**HISTORIAL DE EVALUACIONES (${evaluaciones.length} evaluaciones):**
${historicoEvaluaciones}

Proporciona un análisis completo con nivel de riesgo y recomendaciones.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      thinking: { type: 'disabled' }
    });

    const analisis = completion.choices[0]?.message?.content;

    if (!analisis) {
      throw new Error('No se pudo generar el análisis');
    }

    // Guardar como nota
    const nota = await db.nota.create({
      data: {
        adultoMayorId: participanteId,
        titulo: `🛡️ Análisis Riesgo Caídas - ${new Date().toLocaleDateString('es-PR')}`,
        contenido: analisis,
        tipo: 'salud'
      }
    });

    // Calcular score de riesgo (0-100)
    const factoresRiesgo = {
      edad: edad >= 80 ? 20 : edad >= 70 ? 10 : 0,
      puntajeBajo: (stats.promedioPuntaje || 0) < 10 ? 20 : (stats.promedioPuntaje || 0) < 14 ? 10 : 0,
      equilibrioBajo: (stats.promedioEquilibrio || 0) < 10 ? 15 : 0,
      tendenciaNegativa: stats.tendenciaPuntaje === 'empeorando' ? 15 : 0,
      viveSolo: participante.viveSolo ? 10 : 0,
      medicamentos: participante.medicamentos ? 10 : 0
    };
    
    const scoreRiesgo = Object.values(factoresRiesgo).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      success: true,
      analisis,
      notaId: nota.id,
      scoreRiesgo: Math.min(scoreRiesgo, 100),
      nivelRiesgo: scoreRiesgo >= 60 ? 'muy_alto' : scoreRiesgo >= 40 ? 'alto' : scoreRiesgo >= 20 ? 'moderado' : 'bajo',
      estadisticas: stats,
      factoresRiesgo
    });

  } catch (error) {
    console.error('Error en predicción:', error);
    return NextResponse.json({
      error: 'Error al generar predicción',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
