import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos iniciales...');

  // ============================================
  // PROGRAMAS PRECONFIGURADOS
  // ============================================
  
  const programas = [
    {
      nombre: 'Fortalecimiento Muscular',
      descripcion: 'Programa de ejercicios progresivos para mantener y mejorar la fuerza muscular en adultos mayores.',
      objetivo: 'Incrementar la fuerza muscular, mejorar la funcionalidad diaria y prevenir la sarcopenia.',
      duracionSemanas: 8,
      sesionesPorSemana: 3,
      intensidad: 'moderada',
      categoria: 'fortalecimiento',
      actividades: JSON.stringify([
        'Sentadillas en silla',
        'Elevación de talones',
        'Extensión de rodillas sentado',
        'Flexión de brazos con banda elástica',
        'Puente de glúteos'
      ]),
      condicionesAdecuadas: 'Sarcopenia, debilidad muscular, dificultad para levantarse, problemas de movilidad',
      contraindicaciones: 'Fracturas recientes, artrosis aguda sin control médico, dolor intenso'
    },
    {
      nombre: 'Equilibrio y Prevención de Caídas',
      descripcion: 'Ejercicios específicos para mejorar el equilibrio estático y dinámico, reduciendo el riesgo de caídas.',
      objetivo: 'Mejorar el equilibrio, aumentar la confianza en el movimiento y prevenir caídas.',
      duracionSemanas: 10,
      sesionesPorSemana: 3,
      intensidad: 'baja',
      categoria: 'equilibrio',
      actividades: JSON.stringify([
        'Equilibrio en un pie con apoyo',
        'Caminata en línea recta',
        'Equilibrio tándem',
        'Levantarse de silla sin manos',
        'Giros controlados',
        'Caminata con obstáculos'
      ]),
      condicionesAdecuadas: 'Historial de caídas, mareos, problemas de equilibrio, miedo a caer',
      contraindicaciones: 'Vértigo agudo, condiciones neurológicas no controladas'
    },
    {
      nombre: 'Estimulación Cognitiva',
      descripcion: 'Actividades diseñadas para mantener y mejorar las funciones cognitivas: memoria, atención y lenguaje.',
      objetivo: 'Preservar funciones cognitivas, estimular la mente y prevenir el deterioro cognitivo.',
      duracionSemanas: 12,
      sesionesPorSemana: 4,
      intensidad: 'baja',
      categoria: 'cognitivo',
      actividades: JSON.stringify([
        'Juego Stop con categorías',
        'Memoria de cartas gigantes',
        'Ejercicios de cálculo mental',
        'Lectura comprensiva',
        'Asociación de palabras',
        'Rompecabezas adaptados',
        'Bingo cognitivo'
      ]),
      condicionesAdecuadas: 'Deterioro cognitivo leve/moderado, prevención de demencia, estimulación mental',
      contraindicaciones: 'Ninguna significativa'
    },
    {
      nombre: 'Movilidad Articular',
      descripcion: 'Ejercicios suaves para mantener y mejorar el rango de movimiento de las articulaciones.',
      objetivo: 'Mejorar la flexibilidad, reducir la rigidez articular y facilitar las actividades diarias.',
      duracionSemanas: 8,
      sesionesPorSemana: 4,
      intensidad: 'baja',
      categoria: 'movilidad',
      actividades: JSON.stringify([
        'Círculos de hombros',
        'Rotación de muñecas',
        'Flexión-extensión de cuello',
        'Movimientos de cadera sentado',
        'Rotación de tobillos',
        'Estiramientos suaves de espalda'
      ]),
      condicionesAdecuadas: 'Artritis, rigidez articular, artrosis, cirugías articulares recuperadas',
      contraindicaciones: 'Inflamación articular aguda, artritis reumatoide en brote'
    },
    {
      nombre: 'Actividades Recreativas Grupales',
      descripcion: 'Juegos y actividades sociales diseñadas para fomentar la interacción y el bienestar emocional.',
      objetivo: 'Promover la socialización, mejorar el estado de ánimo y crear vínculos sociales.',
      duracionSemanas: 0, // Continuo
      sesionesPorSemana: 2,
      intensidad: 'baja',
      categoria: 'recreativo',
      actividades: JSON.stringify([
        'Voleibol sentados con globo',
        'Bolos con botellas recicladas',
        'Bingo de ejercicios',
        'Pasa la pelota musical',
        'Teatro de lecturas',
        'Karaoke de boleros',
        'Juegos de mesa adaptados'
      ]),
      condicionesAdecuadas: 'Aislamiento social, depresión leve, necesidad de socialización',
      contraindicaciones: 'Ninguna significativa'
    },
    {
      nombre: 'Caminata y Resistencia',
      descripcion: 'Programa progresivo de caminata y ejercicios de resistencia cardiovascular adaptados.',
      objetivo: 'Mejorar la capacidad cardiovascular, aumentar la resistencia y promover la independencia.',
      duracionSemanas: 10,
      sesionesPorSemana: 4,
      intensidad: 'moderada',
      categoria: 'fortalecimiento',
      actividades: JSON.stringify([
        'Caminata a paso ligero',
        'Marcha en el lugar',
        'Subir y bajar escalones',
        'Marcha de 2 minutos',
        'Caminata con cambios de dirección'
      ]),
      condicionesAdecuadas: 'Sedentarismo, necesidad de mejorar resistencia, cardiopatía controlada',
      contraindicaciones: 'HTA no controlada, cardiopatía inestable, arritmias no controladas'
    }
  ];

  for (const programa of programas) {
    await prisma.programa.create({ data: programa });
    console.log(`✅ Programa creado: ${programa.nombre}`);
  }

  // ============================================
  // PLANTILLAS DE ACTIVIDADES
  // ============================================
  
  const plantillas = [
    // Ejercicios de Fortalecimiento
    {
      nombre: 'Sentadillas en Silla',
      descripcion: 'Ejercicio de sentadilla asistida usando una silla como apoyo y seguridad.',
      duracionMinutos: 10,
      categoria: 'ejercicio',
      dificultad: 'facil',
      materiales: JSON.stringify(['Silla estable', 'Espacio despejado']),
      instrucciones: '1. Sentarse al borde de la silla con pies separados al ancho de caderas\n2. Inclinarse ligeramente adelante\n3. Empujar con los talones para levantarse\n4. Volver a sentarse suavemente\n5. Repetir 8-12 veces',
      beneficios: 'Fortalece muslos, glúteos y mejora la capacidad de levantarse.',
      precauciones: 'Mantener la espalda recta. Usar silla con respaldo para mayor seguridad.'
    },
    {
      nombre: 'Elevación de Talones',
      descripcion: 'Ejercicio para fortalecer los músculos de la pantorrilla.',
      duracionMinutos: 5,
      categoria: 'ejercicio',
      dificultad: 'facil',
      materiales: JSON.stringify(['Silla o pared para apoyo']),
      instrucciones: '1. Pararse detrás de una silla sujetándola\n2. Elevar los talones del suelo\n3. Mantener 2 segundos arriba\n4. Bajar lentamente\n5. Repetir 10-15 veces',
      beneficios: 'Mejora el equilibrio y fortalece pantorrillas.',
      precauciones: 'Evitar si hay dolor en los pies o tobillos.'
    },
    {
      nombre: 'Extensión de Rodillas',
      descripcion: 'Ejercicio sentado para fortalecer los cuádriceps.',
      duracionMinutos: 8,
      categoria: 'ejercicio',
      dificultad: 'facil',
      materiales: JSON.stringify(['Silla estable']),
      instrucciones: '1. Sentarse con espalda recta\n2. Extender una pierna hasta que esté recta\n3. Mantener 3 segundos\n4. Bajar lentamente\n5. Alternar piernas, 10 repeticiones cada una',
      beneficios: 'Fortalece los músculos del muslo y mejora la estabilidad de rodilla.',
      precauciones: 'No bloquear la rodilla completamente. Movimiento controlado.'
    },
    {
      nombre: 'Puente de Glúteos',
      descripcion: 'Ejercicio en suelo para fortalecer glúteos y zona media.',
      duracionMinutos: 10,
      categoria: 'ejercicio',
      dificultad: 'moderado',
      materiales: JSON.stringify(['Colchoneta', 'Cama firme']),
      instrucciones: '1. Acostarse boca arriba con rodillas dobladas\n2. Pies planos sobre la superficie\n3. Elevar las caderas formando línea recta\n4. Mantener 5 segundos\n5. Bajar suavemente. Repetir 10 veces',
      beneficios: 'Fortalece glúteos, zona lumbar y mejora la estabilidad pélvica.',
      precauciones: 'No arquear la espalda. Mantener el core activo.'
    },

    // Ejercicios de Equilibrio
    {
      nombre: 'Equilibrio en Un Pie',
      descripcion: 'Ejercicio estático de equilibrio con apoyo opcional.',
      duracionMinutos: 10,
      categoria: 'ejercicio',
      dificultad: 'facil',
      materiales: JSON.stringify(['Silla o pared para apoyo']),
      instrucciones: '1. Pararse detrás de una silla\n2. Sujetar el respaldo suavemente\n3. Levantar un pie del suelo\n4. Mantener el equilibrio 10-30 segundos\n5. Alternar pies, 3 veces cada uno',
      beneficios: 'Mejora el equilibrio estático y la propiocepción.',
      precauciones: 'Siempre tener apoyo cerca. Progresar gradualmente.'
    },
    {
      nombre: 'Caminata Tándem',
      descripcion: 'Caminar en línea recta colocando un pie delante del otro.',
      duracionMinutos: 5,
      categoria: 'ejercicio',
      dificultad: 'moderado',
      materiales: JSON.stringify(['Espacio despejado', 'Cinta adhesiva opcional']),
      instrucciones: '1. Imaginar una línea en el suelo\n2. Caminar colocando un pie justo delante del otro\n3. Talón del pie de adelante toca la punta del pie de atrás\n4. Avanzar 10 pasos\n5. Girar y repetir',
      beneficios: 'Mejora el equilibrio dinámico y la coordinación.',
      precauciones: 'Tener silla o pared cerca para apoyo si es necesario.'
    },
    {
      nombre: 'Levantarse de Silla sin Manos',
      descripcion: 'Práctica de levantarse sin usar las manos para mejorar fuerza y equilibrio.',
      duracionMinutos: 8,
      categoria: 'ejercicio',
      dificultad: 'moderado',
      materiales: JSON.stringify(['Silla estable sin brazos']),
      instrucciones: '1. Sentarse en silla sin brazos\n2. Cruzar brazos sobre el pecho\n3. Inclinarse ligeramente adelante\n4. Levantarse usando solo las piernas\n5. Volver a sentarse. Repetir 8-10 veces',
      beneficios: 'Mejora la funcionalidad diaria y la fuerza de piernas.',
      precauciones: 'Usar silla estable. Tener ayuda cerca si es necesario.'
    },

    // Actividades Cognitivas
    {
      nombre: 'Juego Stop Adaptado',
      descripcion: 'Juego de categorías para estimular la memoria y el lenguaje.',
      duracionMinutos: 20,
      categoria: 'cognitivo',
      dificultad: 'facil',
      materiales: JSON.stringify(['Hojas de papel', 'Lápices', 'Lista de categorías']),
      instrucciones: '1. Seleccionar una letra del alfabeto\n2. Los participantes escriben palabras que empiecen con esa letra en categorías: nombre, animal, comida, lugar, objeto\n3. Quien termine primero dice "Stop"\n4. Compartir respuestas y puntuar',
      beneficios: 'Estimula memoria, atención, lenguaje y velocidad de procesamiento.',
      precauciones: 'Adaptar tiempo según el nivel cognitivo.'
    },
    {
      nombre: 'Memoria de Cartas Gigantes',
      descripcion: 'Juego de memoria con cartas grandes para estimular la concentración.',
      duracionMinutos: 15,
      categoria: 'cognitivo',
      dificultad: 'facil',
      materiales: JSON.stringify(['Cartas de memoria gigantes', 'Mesa']),
      instrucciones: '1. Colocar las cartas boca abajo en la mesa\n2. Cada jugador voltea dos cartas\n3. Si son iguales, las guarda y sigue\n4. Si son diferentes, las vuelve a poner boca abajo\n5. Gana quien tenga más pares',
      beneficios: 'Mejora la memoria a corto plazo y la concentración.',
      precauciones: 'Usar cartas con imágenes grandes y claras.'
    },
    {
      nombre: 'Bingo Cognitivo',
      descripcion: 'Bingo modificado con preguntas de cultura general o recuerdos.',
      duracionMinutos: 30,
      categoria: 'cognitivo',
      dificultad: 'facil',
      materiales: JSON.stringify(['Cartones de bingo', 'Fichas', 'Preguntas preparadas']),
      instrucciones: '1. Distribuir cartones de bingo\n2. En lugar de números, usar preguntas o imágenes\n3. Ejemplo: "¿Cómo se llama la flor roja de la foto?" - Si es ROSA, marcar R\n4. Primero en completar línea gana',
      beneficios: 'Estimula memoria, atención y conocimiento general.',
      precauciones: 'Preguntas apropiadas al nivel cognitivo del grupo.'
    },
    {
      nombre: 'Ejercicios de Cálculo Mental',
      descripcion: 'Actividades matemáticas sencillas para estimular el razonamiento.',
      duracionMinutos: 15,
      categoria: 'cognitivo',
      dificultad: 'moderado',
      materiales: JSON.stringify(['Tarjetas con operaciones', 'Pizza o papel']),
      instrucciones: '1. Presentar operaciones sencillas: sumas, restas\n2. Ejemplo: "Si tienes 5 naranjas y compras 3 más, ¿cuántas tienes?"\n3. Usar objetos visuales si es necesario\n4. Aumentar dificultad gradualmente',
      beneficios: 'Mantiene activas las funciones ejecutivas y el razonamiento.',
      precauciones: 'Adaptar dificultad al nivel de cada participante.'
    },

    // Movilidad Articular
    {
      nombre: 'Círculos de Hombros',
      descripcion: 'Movimientos circulares para movilizar la articulación del hombro.',
      duracionMinutos: 5,
      categoria: 'movilidad',
      dificultad: 'facil',
      materiales: JSON.stringify(['Ninguno']),
      instrucciones: '1. Sentarse o pararse con espalda recta\n2. Elevar hombros hacia las orejas\n3. Rotar hacia atrás en círculos amplios\n4. Repetir 10 veces\n5. Cambiar dirección hacia adelante',
      beneficios: 'Mejora la movilidad de hombros y relaja la zona cervical.',
      precauciones: 'Movimientos suaves y controlados. Sin dolor.'
    },
    {
      nombre: 'Rotación de Tobillos',
      descripcion: 'Ejercicio de movilidad para tobillos y pies.',
      duracionMinutos: 5,
      categoria: 'movilidad',
      dificultad: 'facil',
      materiales: JSON.stringify(['Silla']),
      instrucciones: '1. Sentarse con espalda recta\n2. Extender una pierna ligeramente\n3. Rotar el tobillo en círculos\n4. 10 círculos en cada dirección\n5. Cambiar de pie',
      beneficios: 'Mejora la movilidad de tobillos y la propiocepción.',
      precauciones: 'Movimientos suaves. Evitar si hay inflamación aguda.'
    },
    {
      nombre: 'Estiramiento de Espalda Sentado',
      descripcion: 'Estiramiento suave para la columna vertebral.',
      duracionMinutos: 8,
      categoria: 'movilidad',
      dificultad: 'facil',
      materiales: JSON.stringify(['Silla']),
      instrucciones: '1. Sentarse al borde de la silla\n2. Entrelazar dedos y estirar brazos arriba\n3. Inclinarse suavemente hacia un lado\n4. Mantener 10 segundos\n5. Cambiar de lado. Repetir 3 veces cada lado',
      beneficios: 'Alivia tensión en espalda y mejora la postura.',
      precauciones: 'No forzar el estiramiento. Evitar si hay dolor lumbar agudo.'
    },

    // Actividades Recreativas
    {
      nombre: 'Voleibol Sentados con Globo',
      descripcion: 'Juego de voleibol adaptado usando un globo y jugando sentados.',
      duracionMinutos: 20,
      categoria: 'recreativo',
      dificultad: 'facil',
      materiales: JSON.stringify(['Globos', 'Cuerda o red baja', 'Sillas']),
      instrucciones: '1. Formar dos equipos sentados en filas\n2. Colocar cuerda o red baja entre equipos\n3. Golpear el globo por encima de la red\n4. El globo no puede tocar el suelo\n5. Punto para el equipo contrario si toca el suelo',
      beneficios: 'Fomenta el trabajo en equipo, coordinación y socialización.',
      precauciones: 'Espacio suficiente entre sillas. Supervisión constante.'
    },
    {
      nombre: 'Bolos con Botellas Recicladas',
      descripcion: 'Juego de bolos casero usando botellas plásticas.',
      duracionMinutos: 20,
      categoria: 'recreativo',
      dificultad: 'facil',
      materiales: JSON.stringify(['6-10 botellas plásticas vacías', 'Pintura para decorar', 'Pelota suave']),
      instrucciones: '1. Decorar botellas como bolos\n2. Colocar en formación triangular\n3. Participante rueda la pelota para derribar\n4. Cada participante tiene 2 tiros por turno\n5. Sumar puntos por bolos derribados',
      beneficios: 'Mejora coordinación ojo-mano y concentración.',
      precauciones: 'Usar pelota suave. Adaptar distancia según capacidad.'
    },
    {
      nombre: 'Karaoke de Boleros',
      descripcion: 'Sesión de canto con canciones clásicas latinas.',
      duracionMinutos: 30,
      categoria: 'recreativo',
      dificultad: 'facil',
      materiales: JSON.stringify(['Letras de canciones impresas', 'Altavoz', 'Karaoke o música de fondo']),
      instrucciones: '1. Preparar letras de boleros clásicos\n2. Reproducir música de fondo\n3. Cantar en grupo o individual\n4. Fomentar recuerdos asociados a las canciones\n5. Conversar sobre la época de la canción',
      beneficios: 'Mejora el estado de ánimo, memoria emocional y socialización.',
      precauciones: 'Respetar si alguien no quiere cantar.'
    },
    {
      nombre: 'Bingo de Ejercicios',
      descripcion: 'Bingo donde cada número corresponde a un ejercicio.',
      duracionMinutos: 25,
      categoria: 'recreativo',
      dificultad: 'facil',
      materiales: JSON.stringify(['Cartones de bingo', 'Lista de ejercicios numerados']),
      instrucciones: '1. Asignar un ejercicio a cada número del bingo\n2. Sortear números\n3. Participantes marcan en su cartón\n4. Al marcar número, todos realizan el ejercicio\n5. Premio al primer bingo',
      beneficios: 'Combina ejercicio físico con diversión y socialización.',
      precauciones: 'Ejercicios adaptados al nivel del grupo.'
    },
    {
      nombre: 'Pasa la Pelota Musical',
      descripcion: 'Juego musical donde se pasa una pelota y responde preguntas al detenerse.',
      duracionMinutos: 15,
      categoria: 'recreativo',
      dificultad: 'facil',
      materiales: JSON.stringify(['Pelota suave', 'Música', 'Tarjetas de preguntas']),
      instrucciones: '1. Participantes sentados en círculo\n2. Reproducir música y pasar la pelota\n3. Al detener música, quien tiene la pelota responde una pregunta\n4. Preguntas pueden ser: recuerdos, preferencias, adivinanzas\n5. Continuar el juego',
      beneficios: 'Estimula respuestas rápidas, memoria y socialización.',
      precauciones: 'Preguntas positivas y apropiadas.'
    },
    {
      nombre: 'Juegos de Mesa Adaptados',
      descripcion: 'Sesión de juegos de mesa con reglas simplificadas.',
      duracionMinutos: 45,
      categoria: 'recreativo',
      dificultad: 'moderado',
      materiales: JSON.stringify(['Dominó con puntos grandes', 'Cartas gigantes', 'Dados grandes', 'Juego de damas']),
      instrucciones: '1. Ofrecer variedad de juegos\n2. Explicar reglas simplificadas\n3. Formar parejas o grupos pequeños\n4. Facilitar el juego\n5. Rotar juegos cada 15 minutos',
      beneficios: 'Estimula pensamiento estratégico, socialización y concentración.',
      precauciones: 'Paciencia con participantes más lentos.'
    }
  ];

  for (const plantilla of plantillas) {
    await prisma.plantillaActividad.create({ data: plantilla });
    console.log(`✅ Plantilla creada: ${plantilla.nombre}`);
  }

  console.log('\n🎉 Siembra completada exitosamente!');
  console.log(`📊 ${programas.length} programas creados`);
  console.log(`📊 ${plantillas.length} plantillas de actividades creadas`);
}

main()
  .catch((e) => {
    console.error('❌ Error en la siembra:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
