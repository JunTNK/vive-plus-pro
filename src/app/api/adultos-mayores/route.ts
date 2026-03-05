import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar todos los adultos mayores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activo = searchParams.get('activo');
    
    const adultosMayores = await db.adultoMayor.findMany({
      where: activo !== null ? { activo: activo === 'true' } : undefined,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(adultosMayores);
  } catch (error) {
    console.error('Error al obtener adultos mayores:', error);
    return NextResponse.json(
      { error: 'Error al obtener adultos mayores', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo adulto mayor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar campos requeridos
    if (!body.nombre || !body.apellido || !body.fechaNacimiento || !body.direccion) {
      return NextResponse.json(
        { error: 'Nombre, apellido, fecha de nacimiento y dirección son requeridos' },
        { status: 400 }
      );
    }

    // Calcular IMC si hay peso y talla
    let imc = null;
    if (body.peso && body.talla) {
      const tallaMetros = body.talla / 100;
      imc = Number((body.peso / (tallaMetros * tallaMetros)).toFixed(1));
    }
    
    const nuevoAdulto = await db.adultoMayor.create({
      data: {
        // Datos personales
        nombre: body.nombre,
        apellido: body.apellido,
        fechaNacimiento: new Date(body.fechaNacimiento),
        genero: body.genero || null,
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
        
        // Programa asignado
        programaId: body.programaId || null,
        
        // Estado
        activo: body.activo ?? true,
        observaciones: body.observaciones || null,
      },
      include: {
        programa: {
          select: { id: true, nombre: true }
        }
      }
    });

    return NextResponse.json(nuevoAdulto, { status: 201 });
  } catch (error) {
    console.error('Error al crear adulto mayor:', error);
    return NextResponse.json(
      { error: 'Error al crear adulto mayor' },
      { status: 500 }
    );
  }
}
