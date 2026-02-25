import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Sistema de acciones que la IA puede ejecutar
const ACCIONES = {
  // === PARTICIPANTES ===
  'crear_participante': async (params: Record<string, unknown>) => {
    const participante = await db.adultoMayor.create({
      data: {
        nombre: params.nombre as string,
        apellido: params.apellido as string,
        fechaNacimiento: new Date(params.fechaNacimiento as string),
        genero: params.genero as string || null,
        direccion: params.direccion as string || 'Por definir',
        telefono: params.telefono as string || null,
        condicionesSalud: params.condicionesSalud as string || null,
        medicamentos: params.medicamentos as string || null,
        activo: true
      }
    });
    return { exito: true, mensaje: `✅ Participante ${participante.nombre} ${participante.apellido} creado exitosamente`, data: participante };
  },

  'actualizar_participante': async (params: Record<string, unknown>) => {
    const { id, ...datos } = params;
    const participante = await db.adultoMayor.update({
      where: { id: id as string },
      data: datos
    });
    return { exito: true, mensaje: `✅ Datos de ${participante.nombre} actualizados`, data: participante };
  },

  'listar_participantes': async () => {
    const participantes = await db.adultoMayor.findMany({
      where: { activo: true },
      include: { _count: { select: { visitas: true, actividades: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    const lista = participantes.map(p => 
      `• **${p.nombre} ${p.apellido}** (${p.genero || 'N/A'}) - ${p._count.actividades} actividades, ${p._count.visitas} visitas`
    ).join('\n');
    return { exito: true, mensaje: `📋 **Participantes Activos:**\n${lista}`, data: participantes };
  },

  'buscar_participante': async (params: Record<string, unknown>) => {
    const termino = params.nombre as string;
    const participantes = await db.adultoMayor.findMany({
      where: {
        OR: [
          { nombre: { contains: termino } },
          { apellido: { contains: termino } }
        ]
      },
      include: { programa: true, _count: { select: { actividades: true, notas: true } } }
    });
    if (participantes.length === 0) {
      return { exito: false, mensaje: `❌ No encontré participantes con el nombre "${termino}"` };
    }
    const info = participantes.map(p => 
      `• **${p.nombre} ${p.apellido}**\n  - Programa: ${p.programa?.nombre || 'Sin asignar'}\n  - Actividades: ${p._count.actividades}, Notas: ${p._count.notas}`
    ).join('\n');
    return { exito: true, mensaje: `🔍 Resultados para "${termino}":\n${info}`, data: participantes };
  },

  // === ACTIVIDADES ===
  'crear_actividad': async (params: Record<string, unknown>) => {
    const actividad = await db.actividad.create({
      data: {
        adultoMayorId: params.participanteId as string,
        titulo: params.titulo as string,
        descripcion: params.descripcion as string || null,
        duracion: params.duracion as number || null,
        tipoActividad: params.tipo as string || 'otra',
        intensidad: params.intensidad as string || 'baja',
        fecha: new Date()
      }
    });
    return { exito: true, mensaje: `✅ Actividad "${actividad.titulo}" registrada`, data: actividad };
  },

  'listar_actividades': async (params: Record<string, unknown>) => {
    const participanteId = params.participanteId as string;
    const actividades = await db.actividad.findMany({
      where: participanteId ? { adultoMayorId: participanteId } : undefined,
      include: { adultoMayor: { select: { nombre: true, apellido: true } } },
      orderBy: { fecha: 'desc' },
      take: 10
    });
    const lista = actividades.map(a => 
      `• ${a.titulo} - ${a.adultoMayor.nombre} (${a.duracion || '?'} min, ${a.tipoActividad})`
    ).join('\n');
    return { exito: true, mensaje: `📋 **Actividades recientes:**\n${lista}`, data: actividades };
  },

  // === PROGRAMAS ===
  'crear_programa': async (params: Record<string, unknown>) => {
    const programa = await db.programa.create({
      data: {
        nombre: params.nombre as string,
        descripcion: params.descripcion as string,
        objetivo: params.objetivo as string || null,
        duracionSemanas: params.duracionSemanas as number || 8,
        sesionesPorSemana: params.sesionesPorSemana as number || 2,
        intensidad: params.intensidad as string || 'moderada',
        categoria: params.categoria as string || 'bienestar',
        actividades: params.actividades as string || '',
        condicionesAdecuadas: params.condiciones as string || null,
        activo: true
      }
    });
    return { exito: true, mensaje: `✅ Programa "${programa.nombre}" creado`, data: programa };
  },

  'asignar_programa': async (params: Record<string, unknown>) => {
    const participante = await db.adultoMayor.update({
      where: { id: params.participanteId as string },
      data: { programaId: params.programaId as string },
      include: { programa: true }
    });
    return { exito: true, mensaje: `✅ Programa "${participante.programa?.nombre}" asignado a ${participante.nombre}`, data: participante };
  },

  'listar_programas': async () => {
    const programas = await db.programa.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });
    const lista = programas.map(p => 
      `• **${p.nombre}** (${p.intensidad}) - ${p.duracionSemanas} semanas, ${p.sesionesPorSemana}x/semana`
    ).join('\n');
    return { exito: true, mensaje: `📋 **Programas disponibles:**\n${lista}`, data: programas };
  },

  // === EVALUACIONES ===
  'crear_evaluacion': async (params: Record<string, unknown>) => {
    const evaluacion = await db.evaluacion.create({
      data: {
        adultoMayorId: params.participanteId as string,
        tipoEvaluacion: params.tipo as string || 'inicial',
        peso: params.peso ? parseFloat(params.peso as string) : null,
        alturaPies: params.alturaPies ? parseInt(params.alturaPies as string) : null,
        presionSistolica: params.presionSistolica ? parseInt(params.presionSistolica as string) : null,
        presionDiastolica: params.presionDiastolica ? parseInt(params.presionDiastolica as string) : null,
        observaciones: params.observaciones as string || null
      }
    });
    return { exito: true, mensaje: `✅ Evaluación registrada correctamente`, data: evaluacion };
  },

  // === INFORMES ===
  'generar_informe_participante': async (params: Record<string, unknown>) => {
    const participante = await db.adultoMayor.findFirst({
      where: { id: params.participanteId as string },
      include: {
        programa: true,
        _count: { select: { visitas: true, actividades: true, notas: true, evaluaciones: true } },
        actividades: { orderBy: { fecha: 'desc' }, take: 5 },
        evaluaciones: { orderBy: { fecha: 'desc' }, take: 1 }
      }
    });
    
    if (!participante) {
      return { exito: false, mensaje: '❌ Participante no encontrado' };
    }

    const informe = `
📊 **INFORME DE PARTICIPANTE**

👤 **Datos Personales:**
- Nombre: ${participante.nombre} ${participante.apellido}
- Género: ${participante.genero || 'No especificado'}
- Dirección: ${participante.direccion}

📋 **Estado Actual:**
- Programa: ${participante.programa?.nombre || 'Sin programa asignado'}
- Total actividades: ${participante._count.actividades}
- Total visitas: ${participante._count.visitas}
- Evaluaciones: ${participante._count.evaluaciones}

📝 **Actividades Recientes:**
${participante.actividades.map(a => `• ${a.titulo} (${a.duracion || '?'} min)`).join('\n') || 'Sin actividades registradas'}

${participante.condicionesSalud ? `⚠️ **Condiciones de Salud:**\n${participante.condicionesSalud}` : ''}

${participante.observaciones ? `📌 **Observaciones:**\n${participante.observaciones}` : ''}
`;
    return { exito: true, mensaje: informe, data: participante };
  },

  'resumen_dashboard': async () => {
    const [totalAdultos, adultosActivos, totalActividades, totalVisitas, visitasPendientes] = await Promise.all([
      db.adultoMayor.count(),
      db.adultoMayor.count({ where: { activo: true } }),
      db.actividad.count(),
      db.visita.count(),
      db.visita.count({ where: { estado: 'programada' } })
    ]);

    return {
      exito: true,
      mensaje: `
📊 **RESUMEN DEL SISTEMA**

👥 **Participantes:** ${adultosActivos} activos de ${totalAdultos} totales
✅ **Actividades realizadas:** ${totalActividades}
📅 **Visitas:** ${totalVisitas} totales, ${visitasPendientes} pendientes

💡 **Sugerencias:**
${visitasPendientes > 0 ? '• Tienes visitas pendientes por completar' : ''}
${totalActividades === 0 ? '• Considera registrar actividades para los participantes' : ''}
`,
      data: { totalAdultos, adultosActivos, totalActividades, totalVisitas, visitasPendientes }
    };
  }
};

// Función para detectar intención del usuario
function detectarAccion(mensaje: string): { accion: string; params: Record<string, unknown> } | null {
  const msg = mensaje.toLowerCase();
  
  // Detectar creación de participante
  if (msg.includes('crear') && (msg.includes('participante') || msg.includes('nuevo participante') || msg.includes('nueva persona'))) {
    return { accion: 'crear_participante', params: { _pendiente: true } };
  }
  
  // Detectar listado
  if (msg.includes('lista') || msg.includes('mostrar') || msg.includes('ver') || msg.includes('cuántos')) {
    if (msg.includes('participante')) return { accion: 'listar_participantes', params: {} };
    if (msg.includes('actividad')) return { accion: 'listar_actividades', params: {} };
    if (msg.includes('programa')) return { accion: 'listar_programas', params: {} };
  }
  
  // Detectar búsqueda
  if (msg.includes('buscar') || msg.includes('encontrar') || msg.includes('información de')) {
    const nombre = mensaje.replace(/buscar|encontrar|información de|de|la|el/gi, '').trim();
    return { accion: 'buscar_participante', params: { nombre } };
  }
  
  // Detectar informe
  if (msg.includes('informe') || msg.includes('reporte') || msg.includes('resumen')) {
    if (msg.includes('dashboard') || msg.includes('sistema') || msg.includes('general')) {
      return { accion: 'resumen_dashboard', params: {} };
    }
    return { accion: 'generar_informe_participante', params: { _pendiente: true } };
  }
  
  // Detectar actividad
  if (msg.includes('actividad') || msg.includes('ejercicio')) {
    if (msg.includes('nueva') || msg.includes('crear') || msg.includes('registrar')) {
      return { accion: 'crear_actividad', params: { _pendiente: true } };
    }
    return { accion: 'listar_actividades', params: {} };
  }
  
  // Detectar programa
  if (msg.includes('programa')) {
    if (msg.includes('nuevo') || msg.includes('crear')) {
      return { accion: 'crear_programa', params: { _pendiente: true } };
    }
    if (msg.includes('asignar')) {
      return { accion: 'asignar_programa', params: { _pendiente: true } };
    }
    return { accion: 'listar_programas', params: {} };
  }
  
  // Detectar evaluación
  if (msg.includes('evaluación') || msg.includes('evaluar')) {
    return { accion: 'crear_evaluacion', params: { _pendiente: true } };
  }
  
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mensaje, contexto, datos, historial } = body;
    
    // Detectar acción solicitada
    const accionDetectada = detectarAccion(mensaje);
    
    if (accionDetectada) {
      // Si la acción necesita parámetros adicionales
      if (accionDetectada.params._pendiente) {
        const respuestasPendientes: Record<string, string> = {
          'crear_participante': `📝 **Crear nuevo participante**

Para crear un participante, necesito los siguientes datos:

**Datos obligatorios:**
- Nombre
- Apellido  
- Fecha de nacimiento (YYYY-MM-DD)

**Datos opcionales:**
- Género (masculino/femenino)
- Dirección
- Teléfono
- Condiciones de salud

Ejemplo: *"Crear participante María López, fecha 1950-03-15, femenino, vive en San Juan"*

¿Me puedes dar los datos del nuevo participante?`,
          
          'crear_actividad': `📝 **Registrar nueva actividad**

Para registrar una actividad necesito:
- ID del participante (o nombre para buscarlo)
- Título de la actividad
- Tipo: ejercicio, caminata, manualidad, musica, juego, otra
- Duración en minutos (opcional)
- Intensidad: baja, media, alta (opcional)

Ejemplo: *"Actividad para Raquel: Caminata consciente, 15 minutos, intensidad baja"*

¿Qué actividad deseas registrar?`,
          
          'crear_programa': `📝 **Crear nuevo programa**

Para crear un programa necesito:
- Nombre del programa
- Descripción
- Objetivo
- Duración en semanas
- Sesiones por semana
- Intensidad: suave, moderada, intensa

Ejemplo: *"Programa Movilidad Suave, 6 semanas, 2 sesiones por semana, intensidad suave"*

¿Qué programa deseas crear?`,
          
          'asignar_programa': `📝 **Asignar programa a participante**

Para asignar un programa necesito:
- Nombre del participante
- Nombre del programa

Ejemplo: *"Asignar programa Equilibrio a María López"*

¿A qué participante y qué programa deseas asignar?`,
          
          'crear_evaluacion': `📝 **Nueva evaluación**

Para crear una evaluación necesito:
- ID del participante (o nombre para buscarlo)
- Tipo: inicial, seguimiento, anual

Las evaluaciones incluyen las 7 pruebas ECOSAFE PIVE 2020:
1. Equilibrio estático
2. Levantarse/sentarse (30 seg)
3. Flexión de tronco
4. Flexiones de brazo
5. Manos tras espalda
6. Levantarse-caminar-sentarse
7. Marcha 2 minutos

¿Para qué participante deseas realizar la evaluación?`,
          
          'generar_informe_participante': `📊 **Generar informe de participante**

Para generar un informe necesito saber de qué participante.

Ejemplo: *"Informe de Raquel"* o *"Dame el informe de María López"*

¿De qué participante deseas el informe?`
        };
        
        return NextResponse.json({ respuesta: respuestasPendientes[accionDetectada.accion] || 'Necesito más información para completar esta acción.' });
      }
      
      // Ejecutar la acción
      const ejecutar = ACCIONES[accionDetectada.accion as keyof typeof ACCIONES];
      if (ejecutar) {
        const resultado = await ejecutar(accionDetectada.params);
        return NextResponse.json({ respuesta: resultado.mensaje, data: resultado.data });
      }
    }
    
    // Respuestas contextuales por defecto
    const respuestasContextuales: Record<string, string> = {
      'dashboard': `👋 **Bienvenido al Panel Principal**

Estoy aquí para ayudarte a gestionar el sistema Vive Plus Pro.

**Puedo ayudarte a:**
• Crear y gestionar participantes
• Registrar actividades y visitas
• Crear y asignar programas
• Realizar evaluaciones ECOSAFE
• Generar informes

**Di algo como:**
- "Mostrar participantes"
- "Crear nuevo participante"
- "Resumen del sistema"
- "Lista de programas"

¿En qué puedo ayudarte hoy?`,
      
      'adultos': `👥 **Gestión de Participantes**

Puedo ayudarte con:

• **Crear participante** - Registra un nuevo beneficiario
• **Ver lista** - Muestra todos los participantes activos
• **Buscar** - Encuentra un participante por nombre
• **Editar** - Modifica datos de un participante
• **Asignar programa** - Asigna un programa a un participante

¿Qué necesitas hacer?`,
      
      'evaluaciones': `❤️ **Evaluaciones ECOSAFE PIVE 2020**

Sistema de evaluación funcional con 7 pruebas:

1. **Equilibrio Estático** - Tiempo en un pie
2. **Levantarse/Sentarse** - Repeticiones en 30 seg
3. **Flexión de Tronco** - Flexibilidad espalda/piernas
4. **Flexiones de Brazo** - Fuerza tren superior
5. **Manos tras Espalda** - Flexibilidad hombros
6. **Levantarse-Caminar-Sentarse** - Agilidad
7. **Marcha 2 Minutos** - Resistencia

**Escala de Riesgo:**
- 1-3: Muy Alto
- 4-6: Alto  
- 7-9: Moderado
- 10-12: Bajo

¿Deseas realizar una evaluación?`,
      
      'visitas': `📅 **Calendario de Visitas**

Puedo ayudarte a:
• Programar nuevas visitas
• Ver visitas pendientes
• Marcar visitas como completadas
• Sincronizar con Google Calendar

¿Qué necesitas hacer con las visitas?`,
      
      'actividades': `🎯 **Actividades Recreativas**

Tipos de actividades disponibles:
• Ejercicio físico
• Caminata
• Manualidades
• Música
• Juegos
• Lectura

¿Deseas registrar una nueva actividad o ver las existentes?`,
      
      'programas': `💪 **Programas de Bienestar**

Gestión de programas personalizados:

• Crear nuevos programas
• Ver programas disponibles
• Asignar programas a participantes
• Personalizar según condiciones

¿Qué necesitas hacer con los programas?`
    };
    
    const respuesta = respuestasContextuales[contexto] || respuestasContextuales.dashboard;
    return NextResponse.json({ respuesta });
    
  } catch (error) {
    console.error('Error en asistente:', error);
    return NextResponse.json({ 
      respuesta: 'Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.' 
    });
  }
}
