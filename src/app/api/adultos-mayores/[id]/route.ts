import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener un adulto mayor por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const adultoMayor = await db.adultoMayor.findUnique({
      where: { id },
      include: {
        visitas: {
          orderBy: { fecha: 'desc' },
          take: 10
        },
        actividades: {
          orderBy: { fecha: 'desc' },
          take: 10
        },
        notas: {
          orderBy: { fecha: 'desc' },
          take: 10
        },
        evaluaciones: {
          orderBy: { fecha: 'desc' },
          take: 5
        },
        programa: {
          select: { id: true, nombre: true, categoria: true, descripcion: true }
        }
      }
    });

    if (!adultoMayor) {
      return NextResponse.json(
        { error: 'Adulto mayor no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(adultoMayor);
  } catch (error) {
    console.error('Error al obtener adulto mayor:', error);
    return NextResponse.json(
      { error: 'Error al obtener adulto mayor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar adulto mayor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Calcular IMC si hay peso y talla
    let imc = undefined;
    if (body.peso && body.talla) {
      const tallaMetros = body.talla / 100;
      imc = Number((body.peso / (tallaMetros * tallaMetros)).toFixed(1));
    }
    
    const adultoActualizado = await db.adultoMayor.update({
      where: { id },
      data: {
        // Datos personales
        nombre: body.nombre,
        apellido: body.apellido,
        fechaNacimiento: body.fechaNacimiento ? new Date(body.fechaNacimiento) : undefined,
        genero: body.genero ?? null,
        direccion: body.direccion,
        telefono: body.telefono || null,
        email: body.email || null,
        
        // Contacto de emergencia
        contactoEmergencia: body.contactoEmergencia || null,
        parentescoEmergencia: body.parentescoEmergencia || null,
        telefonoEmergencia: body.telefonoEmergencia || null,
        
        // Información médica
        tipoSangre: body.tipoSangre || null,
        peso: body.peso ? Number(body.peso) : null,
        talla: body.talla ? Number(body.talla) : null,
        imc,
        condicionesSalud: body.condicionesSalud || null,
        medicamentos: body.medicamentos || null,
        alergias: body.alergias || null,
        cirugias: body.cirugias || null,
        usoAyudas: body.usoAyudas || null,
        
        // Información de salud mental y cognitiva
        estadoCognitivo: body.estadoCognitivo || null,
        estadoEmocional: body.estadoEmocional || null,
        
        // Nivel de funcionalidad
        nivelIndependencia: body.nivelIndependencia || null,
        requiereAsistencia: body.requiereAsistencia || null,
        
        // Información social
        viveSolo: body.viveSolo === true ? true : body.viveSolo === false ? false : null,
        cuidadorPrincipal: body.cuidadorPrincipal || null,
        telefonoCuidador: body.telefonoCuidador || null,
        
        // Información de seguros
        seguroMedico: body.seguroMedico || null,
        numeroSeguro: body.numeroSeguro || null,
        medicoPrimario: body.medicoPrimario || null,
        telefonoMedico: body.telefonoMedico || null,
        
        // Evaluaciones
        fechaUltimaEvaluacion: body.fechaUltimaEvaluacion ? new Date(body.fechaUltimaEvaluacion) : null,
        puntajeRiesgo: body.puntajeRiesgo ? Number(body.puntajeRiesgo) : null,
        
        // Programa asignado
        programaId: body.programaId || null,
        
        // Estado
        activo: body.activo,
        observaciones: body.observaciones || null,
      },
      include: {
        programa: {
          select: { id: true, nombre: true }
        }
      }
    });

    return NextResponse.json(adultoActualizado);
  } catch (error) {
    console.error('Error al actualizar adulto mayor:', error);
    return NextResponse.json(
      { error: 'Error al actualizar adulto mayor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar adulto mayor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.adultoMayor.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Adulto mayor eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar adulto mayor:', error);
    return NextResponse.json(
      { error: 'Error al eliminar adulto mayor' },
      { status: 500 }
    );
  }
}
