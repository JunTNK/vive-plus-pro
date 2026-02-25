import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { evaluacionId, participanteId } = await request.json();
    
    if (!evaluacionId || !participanteId) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    // Obtener datos del participante
    const participante = await db.adultoMayor.findUnique({
      where: { id: participanteId }
    });

    // Obtener datos de la evaluación
    const evaluacion = await db.evaluacion.findUnique({
      where: { id: evaluacionId }
    });

    if (!participante || !evaluacion) {
      return NextResponse.json({ error: 'Datos no encontrados' }, { status: 404 });
    }

    // Calcular edad
    const edad = new Date().getFullYear() - new Date(participante.fechaNacimiento).getFullYear();

    // Crear instancia de IA
    const zai = await ZAI.create();

    // Prompt del sistema
    const systemPrompt = `Eres un experto en evaluación funcional de adultos mayores, especializado en la metodología ECOSAFE PIVE 2020. Tu rol es:

1. Analizar los resultados de las pruebas funcionales
2. Identificar áreas de fortaleza y debilidad
3. Evaluar el nivel de riesgo de caídas y dependencia
4. Generar recomendaciones personalizadas de ejercicio
5. Sugerir programas de intervención apropiados

Responde SIEMPRE en español y en formato estructurado con las siguientes secciones:
- **RESUMEN DEL ESTADO FUNCIONAL**
- **ANÁLISIS POR DOMINIO** (equilibrio, fuerza, flexibilidad, movilidad, signos vitales)
- **NIVEL DE RIESGO** (bajo/moderado/alto/muy alto con explicación)
- **RECOMENDACIONES DE EJERCICIO** (específicas para este participante)
- **SUGERENCIAS DE PROGRAMA** (tipos de actividades recomendadas)
- **SIGNOS DE ALERTA** (si los hay)
- **PRÓXIMOS PASOS** (seguimiento recomendado)`;

    // Crear mensaje con los datos
    const userMessage = `Analiza los siguientes resultados de evaluación funcional:

**DATOS DEL PARTICIPANTE:**
- Nombre: ${participante.nombre} ${participante.apellido}
- Edad: ${edad} años
- Género: ${participante.genero || 'No especificado'}
- Condiciones de salud: ${participante.condicionesSalud || 'No reportadas'}
- Medicamentos: ${participante.medicamentos || 'No reportados'}

**RESULTADOS DE LA EVALUACIÓN ECOSAFE PIVE 2020:**

1. **Equilibrio Estático** (segundos en pie único): ${evaluacion.equilibrioEstatico || 'No evaluado'} seg
   - Referencia: <10 seg = riesgo alto, 10-20 seg = moderado, >20 seg = bajo

2. **Levantarse y Sentarse** (repeticiones en 30 seg): ${evaluacion.levantarseSentarse || 'No evaluado'} reps
   - Referencia: <8 = riesgo alto, 8-12 = moderado, >12 = bueno

3. **Flexión de Tronco** (cm alcance): ${evaluacion.flexionTronco || 'No evaluado'} cm
   - Referencia: <0 cm = limitado, 0-10 cm = moderado, >10 cm = bueno

4. **Flexiones de Brazo** (repeticiones en 30 seg): ${evaluacion.flexionesBrazo || 'No evaluado'} reps
   - Referencia: <8 = fuerza baja, 8-15 = moderada, >15 = buena

5. **Juntar Manos Detrás de la Espalda**: ${evaluacion.juntarManosEspalda || 'No evaluado'}
   - Indica flexibilidad de hombros

6. **Levantarse, Caminar y Sentarse** (segundos): ${evaluacion.levantarseCaminar || 'No evaluado'} seg
   - Referencia: <10 seg = excelente, 10-20 seg = moderado, >20 seg = limitado

7. **Marcha 2 Minutos** (pasos): ${evaluacion.marcha2Minutos || 'No evaluado'} pasos
   - Referencia: <100 = baja resistencia, 100-150 = moderada, >150 = buena

**SIGNOS VITALES:**
- Presión Arterial: ${evaluacion.presionSistolica || '-'}/${evaluacion.presionDiastolica || '-'} mmHg
- Frecuencia Cardíaca: ${evaluacion.frecuenciaCardiaca || '-'} lpm
- Saturación O2: ${evaluacion.saturacionOxigeno || '-'}%

**PUNTAJE TOTAL: ${evaluacion.puntajeTotal || 'N/A'} / 21**
**CLASIFICACIÓN DE RIESGO: ${evaluacion.clasificacionRiesgo || 'N/A'}**

Proporciona un análisis completo y detallado con recomendaciones específicas.`;

    // Llamar a la IA
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      thinking: { type: 'disabled' }
    });

    const informe = completion.choices[0]?.message?.content;

    if (!informe) {
      throw new Error('No se pudo generar el informe');
    }

    // Guardar el informe como nota
    const nota = await db.nota.create({
      data: {
        adultoMayorId: participanteId,
        titulo: `📊 Informe de Evaluación - ${new Date(evaluacion.fecha).toLocaleDateString('es-PR')}`,
        contenido: informe,
        tipo: 'salud'
      }
    });

    // Actualizar la evaluación con recomendaciones
    await db.evaluacion.update({
      where: { id: evaluacionId },
      data: {
        recomendaciones: informe
      }
    });

    return NextResponse.json({
      success: true,
      informe: informe,
      notaId: nota.id,
      mensaje: 'Informe generado y guardado exitosamente'
    });

  } catch (error) {
    console.error('Error en análisis IA:', error);
    return NextResponse.json({
      error: 'Error al generar el análisis',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
