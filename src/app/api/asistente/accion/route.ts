import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Sistema de acciones ejecutables
const ACCIONES_EJECUTABLES: Record<string, (params: Record<string, unknown>) => Promise<{ exito: boolean; mensaje: string; data?: unknown; actions?: Array<{ label: string; action: string; params: Record<string, unknown>; icon?: string }> }>> = {
  
  'crear_participante': async (params) => {
    try {
      const participante = await db.adultoMayor.create({
        data: {
          nombre: params.nombre as string,
          apellido: params.apellido as string,
          fechaNacimiento: new Date(params.fechaNacimiento as string),
          genero: params.genero as string || null,
          direccion: params.direccion as string || 'Por definir',
          telefono: params.telefono as string || null,
          condicionesSalud: params.condicionesSalud as string || null,
          activo: true
        }
      });
      
      return { 
        exito: true, 
        mensaje: `✅ **Participante creado exitosamente**\n\n👤 **${participante.nombre} ${participante.apellido}**\n📅 Nacimiento: ${new Date(participante.fechaNacimiento).toLocaleDateString('es-ES')}\n📍 Dirección: ${participante.direccion || 'Por definir'}`,
        data: participante,
        actions: [
          { label: 'Asignar programa', action: 'listar_programas_para_asignar', params: { participanteId: participante.id }, icon: 'plus' }
        ]
      };
    } catch (error) {
      return { exito: false, mensaje: `❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}` };
    }
  },

  'listar_participantes': async () => {
    const participantes = await db.adultoMayor.findMany({
      where: { activo: true },
      include: { programa: { select: { nombre: true } }, _count: { select: { visitas: true, actividades: true } } },
      orderBy: { createdAt: 'desc' },
      take: 15
    });
    
    if (participantes.length === 0) {
      return { exito: true, mensaje: '📋 No hay participantes. ¿Deseas crear uno?', actions: [
        { label: 'Crear participante', action: 'form_crear_participante', params: {}, icon: 'plus' }
      ]};
    }
    
    const lista = participantes.map((p, i) => 
      `${i + 1}. **${p.nombre} ${p.apellido}** ${p.programa ? `(${p.programa.nombre})` : ''}\n   ${p._count.actividades} actividades | ${p._count.visitas} visitas`
    ).join('\n\n');
    
    return { exito: true, mensaje: `📋 **Participantes Activos** (${participantes.length})\n\n${lista}`, data: participantes };
  },

  'buscar_participante': async (params) => {
    const termino = params.nombre as string;
    const participantes = await db.adultoMayor.findMany({
      where: { OR: [
        { nombre: { contains: termino, mode: 'insensitive' } },
        { apellido: { contains: termino, mode: 'insensitive' } }
      ]},
      include: { programa: true, _count: { select: { actividades: true, notas: true } } }
    });
    
    if (participantes.length === 0) {
      return { exito: false, mensaje: `❌ No encontré "${termino}". ¿Crear uno nuevo?` };
    }
    
    const info = participantes.map(p => 
      `👤 **${p.nombre} ${p.apellido}**\n📊 ${p.programa?.nombre || 'Sin programa'}\n✅ ${p._count.actividades} actividades`
    ).join('\n\n');
    
    return { exito: true, mensaje: `🔍 **Resultados para "${termino}":**\n\n${info}`, data: participantes };
  },

  'informe_participante': async (params) => {
    let participanteId = params.participanteId as string;
    
    if (params.nombre && !participanteId) {
      const encontrado = await db.adultoMayor.findFirst({
        where: { OR: [
          { nombre: { contains: params.nombre as string, mode: 'insensitive' } },
          { apellido: { contains: params.nombre as string, mode: 'insensitive' } }
        ]}
      });
      if (encontrado) participanteId = encontrado.id;
    }
    
    if (!participanteId) return { exito: false, mensaje: '❌ Especifica el participante.' };
    
    const p = await db.adultoMayor.findFirst({
      where: { id: participanteId },
      include: { programa: true, _count: { select: { visitas: true, actividades: true } }, actividades: { orderBy: { fecha: 'desc' }, take: 5 } }
    });
    
    if (!p) return { exito: false, mensaje: '❌ No encontrado' };
    
    const edad = new Date().getFullYear() - new Date(p.fechaNacimiento).getFullYear();
    
    return {
      exito: true,
      mensaje: `📄 **INFORME: ${p.nombre} ${p.apellido}**\n\n📅 Edad: ${edad} años\n📍 ${p.direccion || 'Sin dirección'}\n📋 Programa: ${p.programa?.nombre || 'Ninguno'}\n✅ ${p._count.actividades} actividades | ${p._count.visitas} visitas\n${p.condicionesSalud ? `\n⚠️ Condiciones: ${p.condicionesSalud}` : ''}`,
      data: p
    };
  },

  'listar_programas': async () => {
    const programas = await db.programa.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
    const lista = programas.map((p, i) => `${i + 1}. **${p.nombre}** (${p.intensidad || 'N/A'})`).join('\n');
    return { exito: true, mensaje: `📋 **Programas** (${programas.length})\n\n${lista}`, data: programas };
  },

  'listar_programas_para_asignar': async (params) => {
    const programas = await db.programa.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
    return {
      exito: true,
      mensaje: 'Selecciona el programa:',
      actions: programas.slice(0, 5).map(p => ({
        label: p.nombre, action: 'asignar_programa', params: { participanteId: params.participanteId, programaId: p.id }, icon: 'check'
      }))
    };
  },

  'asignar_programa': async (params) => {
    const participante = await db.adultoMayor.update({
      where: { id: params.participanteId as string },
      data: { programaId: params.programaId as string },
      include: { programa: true }
    });
    return { exito: true, mensaje: `✅ **Asignado:** ${participante.nombre} → ${participante.programa?.nombre}`, data: participante };
  },

  'asignar_programa_nombre': async (params) => {
    const participante = await db.adultoMayor.findFirst({
      where: { OR: [
        { nombre: { contains: params.participanteNombre as string, mode: 'insensitive' } },
        { apellido: { contains: params.participanteNombre as string, mode: 'insensitive' } }
      ]}
    });
    if (!participante) return { exito: false, mensaje: `❌ Participante "${params.participanteNombre}" no encontrado` };
    
    const programa = await db.programa.findFirst({
      where: { nombre: { contains: params.programaNombre as string, mode: 'insensitive' } }
    });
    if (!programa) return { exito: false, mensaje: `❌ Programa "${params.programaNombre}" no encontrado` };
    
    const actualizado = await db.adultoMayor.update({
      where: { id: participante.id }, data: { programaId: programa.id }, include: { programa: true }
    });
    return { exito: true, mensaje: `✅ **Asignado:** ${actualizado.nombre} → ${actualizado.programa?.nombre}`, data: actualizado };
  },

  'resumen_dashboard': async () => {
    const [adultosActivos, totalActividades, totalVisitas, totalProgramas] = await Promise.all([
      db.adultoMayor.count({ where: { activo: true } }),
      db.actividad.count(),
      db.visita.count(),
      db.programa.count({ where: { activo: true } })
    ]);

    return {
      exito: true,
      mensaje: `📊 **RESUMEN VIVE PLUS PRO**\n\n👥 Participantes: ${adultosActivos}\n📋 Programas: ${totalProgramas}\n✅ Actividades: ${totalActividades}\n📅 Visitas: ${totalVisitas}`,
      actions: [
        { label: 'Ver participantes', action: 'listar_participantes', params: {}, icon: 'file' },
        { label: 'Crear participante', action: 'form_crear_participante', params: {}, icon: 'plus' }
      ]
    };
  },

  'form_crear_participante': async () => {
    return {
      exito: true,
      mensaje: `📝 **Crear participante**\n\nEscribe: "Crear [Nombre] [Apellido], fecha [YYYY-MM-DD], [género]"\n\nEj: "Crear María López, fecha 1950-03-15, femenino"`
    };
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accion, params = {} } = body;
    
    const ejecutar = ACCIONES_EJECUTABLES[accion];
    if (!ejecutar) return NextResponse.json({ exito: false, mensaje: `❌ Acción "${accion}" no reconocida` });
    
    return NextResponse.json(await ejecutar(params));
  } catch (error) {
    return NextResponse.json({ exito: false, mensaje: `❌ Error: ${error instanceof Error ? error.message : 'Error'}` });
  }
}
