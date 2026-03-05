import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export async function GET() {
  try {
    // Crear cliente directamente
    const db = createClient({
      url: process.env.DATABASE_URL || '',
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });

    // Crear tablas una por una
    const tablas = [
      `CREATE TABLE IF NOT EXISTS programas (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        objetivo TEXT,
        duracionSemanas INTEGER DEFAULT 8,
        sesionesPorSemana INTEGER DEFAULT 3,
        intensidad TEXT,
        categoria TEXT,
        actividades TEXT,
        condicionesAdecuadas TEXT,
        contraindicaciones TEXT,
        activo INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS adultos_mayores (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        fechaNacimiento TEXT NOT NULL,
        genero TEXT,
        direccion TEXT NOT NULL,
        telefono TEXT,
        email TEXT,
        contactoEmergencia TEXT,
        parentescoEmergencia TEXT,
        telefonoEmergencia TEXT,
        tipoSangre TEXT,
        peso REAL,
        talla REAL,
        imc REAL,
        condicionesSalud TEXT,
        medicamentos TEXT,
        alergias TEXT,
        cirugias TEXT,
        usoAyudas TEXT,
        estadoCognitivo TEXT,
        estadoEmocional TEXT,
        nivelIndependencia TEXT,
        requiereAsistencia TEXT,
        viveSolo INTEGER,
        cuidadorPrincipal TEXT,
        telefonoCuidador TEXT,
        seguroMedico TEXT,
        numeroSeguro TEXT,
        medicoPrimario TEXT,
        telefonoMedico TEXT,
        fechaUltimaEvaluacion TEXT,
        puntajeRiesgo INTEGER,
        programaId TEXT,
        activo INTEGER DEFAULT 1,
        observaciones TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS evaluaciones (
        id TEXT PRIMARY KEY,
        adultoMayorId TEXT NOT NULL,
        fecha TEXT DEFAULT CURRENT_TIMESTAMP,
        equilibrioEstatico INTEGER,
        levantarseSentarse INTEGER,
        flexionTronco REAL,
        flexionesBrazo INTEGER,
        juntarManosEspalda TEXT,
        levantarseCaminar REAL,
        marcha2Minutos INTEGER,
        presionSistolica INTEGER,
        presionDiastolica INTEGER,
        frecuenciaCardiaca INTEGER,
        frecuenciaRespiratoria INTEGER,
        saturacionOxigeno REAL,
        puntajeTotal INTEGER,
        clasificacionRiesgo TEXT,
        observaciones TEXT,
        recomendaciones TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS visitas (
        id TEXT PRIMARY KEY,
        adultoMayorId TEXT NOT NULL,
        fecha TEXT NOT NULL,
        duracion INTEGER,
        tipoVisita TEXT,
        estado TEXT,
        observaciones TEXT,
        googleEventId TEXT UNIQUE,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS actividades (
        id TEXT PRIMARY KEY,
        adultoMayorId TEXT NOT NULL,
        plantillaActividadId TEXT,
        fecha TEXT NOT NULL,
        tipoActividad TEXT,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        duracion INTEGER,
        intensidad TEXT,
        notas TEXT,
        dificultad TEXT,
        satisfaccion INTEGER,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS notas (
        id TEXT PRIMARY KEY,
        adultoMayorId TEXT NOT NULL,
        fecha TEXT DEFAULT CURRENT_TIMESTAMP,
        titulo TEXT NOT NULL,
        contenido TEXT NOT NULL,
        tipo TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS plantillas_actividades (
        id TEXT PRIMARY KEY,
        programaId TEXT,
        nombre TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        duracionMinutos INTEGER DEFAULT 30,
        categoria TEXT,
        dificultad TEXT,
        materiales TEXT,
        instrucciones TEXT,
        beneficios TEXT,
        precauciones TEXT,
        activo INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS configuracion (
        id TEXT PRIMARY KEY,
        clave TEXT UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        descripcion TEXT,
        categoria TEXT DEFAULT 'general',
        esSecreto INTEGER DEFAULT 0,
        activo INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    const resultados = [];
    
    for (const sql of tablas) {
      try {
        await db.execute(sql);
        resultados.push('✅ Tabla creada');
      } catch (e: any) {
        resultados.push(`⚠️ ${e.message}`);
      }
    }

    // Insertar programas predeterminados
    const programas = [
      { id: 'prog_1', nombre: 'Movimiento Activo', descripcion: 'Programa de ejercicios suaves para mejorar movilidad y equilibrio', objetivo: 'Mejorar la movilidad articular y prevenir caídas', duracionSemanas: 8, sesionesPorSemana: 3, intensidad: 'baja', categoria: 'movilidad', actividades: 'Caminata, Estiramientos, Equilibrio' },
      { id: 'prog_2', nombre: 'Fortalecimiento Integral', descripcion: 'Programa de fortalecimiento muscular para adultos mayores', objetivo: 'Aumentar la fuerza muscular y funcionalidad', duracionSemanas: 12, sesionesPorSemana: 2, intensidad: 'moderada', categoria: 'fortalecimiento', actividades: 'Sentadillas, Peso muerto, Empujes' },
      { id: 'prog_3', nombre: 'Equilibrio y Coordinación', descripcion: 'Programa enfocado en prevención de caídas', objetivo: 'Mejorar el equilibrio y reducir riesgo de caídas', duracionSemanas: 6, sesionesPorSemana: 3, intensidad: 'baja', categoria: 'equilibrio', actividades: 'Equilibrio estático, Marcha, Coordinación' },
      { id: 'prog_4', nombre: 'Bienestar Cognitivo', descripcion: 'Programa de estimulación cognitiva y social', objetivo: 'Mantener y mejorar funciones cognitivas', duracionSemanas: 8, sesionesPorSemana: 2, intensidad: 'baja', categoria: 'cognitivo', actividades: 'Juegos de memoria, Lectura, Conversación' }
    ];

    for (const p of programas) {
      try {
        await db.execute({
          sql: `INSERT OR IGNORE INTO programas (id, nombre, descripcion, objetivo, duracionSemanas, sesionesPorSemana, intensidad, categoria, actividades, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          args: [p.id, p.nombre, p.descripcion, p.objetivo, p.duracionSemanas, p.sesionesPorSemana, p.intensidad, p.categoria, p.actividades]
        });
      } catch (e) {
        // Ignorar errores de duplicados
      }
    }

    // Verificar conexión
    const result = await db.execute('SELECT COUNT(*) as count FROM programas');
    const totalProgramas = result.rows[0]?.count || 0;

    return NextResponse.json({
      success: true,
      mensaje: 'Base de datos inicializada correctamente',
      tablas: resultados,
      programasCreados: totalProgramas,
      url: process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada',
      token: process.env.DATABASE_AUTH_TOKEN ? '✅ Configurado' : '❌ No configurado'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      url: process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada',
      token: process.env.DATABASE_AUTH_TOKEN ? '✅ Configurado' : '❌ No configurado'
    }, { status: 500 });
  }
}
