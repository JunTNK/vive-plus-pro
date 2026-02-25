import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function setupDatabase() {
  console.log('Setting up Turso database...');

  // Create adultos_mayores table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS adultos_mayores (
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
    )
  `);
  console.log('✓ adultos_mayores created');

  // Create programas table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS programas (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      objetivo TEXT NOT NULL,
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
    )
  `);
  console.log('✓ programas created');

  // Create plantillas_actividades table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS plantillas_actividades (
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
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (programaId) REFERENCES programas(id) ON DELETE SET NULL
    )
  `);
  console.log('✓ plantillas_actividades created');

  // Create evaluaciones table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS evaluaciones (
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
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (adultoMayorId) REFERENCES adultos_mayores(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ evaluaciones created');

  // Create visitas table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS visitas (
      id TEXT PRIMARY KEY,
      adultoMayorId TEXT NOT NULL,
      fecha TEXT NOT NULL,
      duracion INTEGER,
      tipoVisita TEXT,
      estado TEXT,
      observaciones TEXT,
      googleEventId TEXT UNIQUE,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (adultoMayorId) REFERENCES adultos_mayores(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ visitas created');

  // Create actividades table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS actividades (
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
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (adultoMayorId) REFERENCES adultos_mayores(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ actividades created');

  // Create notas table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS notas (
      id TEXT PRIMARY KEY,
      adultoMayorId TEXT NOT NULL,
      fecha TEXT DEFAULT CURRENT_TIMESTAMP,
      titulo TEXT NOT NULL,
      contenido TEXT NOT NULL,
      tipo TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (adultoMayorId) REFERENCES adultos_mayores(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ notas created');

  console.log('\n🎉 Database setup complete!');
}

setupDatabase().catch(console.error);
