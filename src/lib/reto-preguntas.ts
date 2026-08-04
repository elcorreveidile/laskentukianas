export type Pregunta = {
  q: string;
  options: string[];
  answer: number; // índice de la opción correcta
  explain?: string;
  cat: "Lengua" | "Kentucky" | "Crónicas" | "Música" | "Cultura";
};

// Banco de preguntas del "Reto kentukiano". Añade o edita libremente.
export const PREGUNTAS: Pregunta[] = [
  // ---------- Lengua (Jorge es profe de español) ----------
  { cat: "Lengua", q: "¿Cuál es el plural de «lápiz»?", options: ["lápices", "lápizes", "lápiz", "lapices"], answer: 0, explain: "La -z final cambia a -ces: lápiz → lápices." },
  { cat: "Lengua", q: "«Vamos ___ qué pasa».", options: ["a ver", "haber", "aver", "a haber"], answer: 0, explain: "«A ver» (mirar/comprobar); «haber» es el verbo." },
  { cat: "Lengua", q: "¿Qué tiempo verbal es «habría cantado»?", options: ["Condicional compuesto", "Pretérito perfecto", "Futuro compuesto", "Pluscuamperfecto"], answer: 0 },
  { cat: "Lengua", q: "Sinónimo de «efímero».", options: ["Pasajero", "Eterno", "Enorme", "Sólido"], answer: 0 },
  { cat: "Lengua", q: "«Te ___ de menos».", options: ["echo", "hecho", "hexo", "echó"], answer: 0, explain: "«Echar de menos» va con «echo» (sin h)." },
  { cat: "Lengua", q: "¿Cuál es esdrújula?", options: ["murciélago", "camión", "reloj", "cantar"], answer: 0 },
  { cat: "Lengua", q: "«No sé ___ lo hizo».", options: ["por qué", "porque", "porqué", "por que"], answer: 0, explain: "Pregunta indirecta: «por qué» separado y con tilde." },
  { cat: "Lengua", q: "Pretérito de «andar» (yo): «Ayer ___ mucho».", options: ["anduve", "andé", "anduvo", "andube"], answer: 0, explain: "«Andar» es irregular: yo anduve (no «andé»)." },
  { cat: "Lengua", q: "Presente de «conducir» (yo): «Yo ___».", options: ["conduzco", "conduco", "condusco", "conduzo"], answer: 0 },
  { cat: "Lengua", q: "«Ayer ___ problemas».", options: ["hubo", "hubieron", "habían", "han habido"], answer: 0, explain: "«Haber» impersonal va siempre en singular: hubo." },
  { cat: "Lengua", q: "¿Cuántas letras tiene el abecedario español (RAE)?", options: ["27", "28", "26", "29"], answer: 0, explain: "27 letras: «ch» y «ll» ya no cuentan como letras." },
  { cat: "Lengua", q: "Gentilicio de Menorca.", options: ["menorquín", "menorqués", "menorcano", "menorquino"], answer: 0 },
  { cat: "Lengua", q: "«Espero que ___ bien».", options: ["estés", "estás", "estas", "estarás"], answer: 0, explain: "Tras «espero que» va subjuntivo: estés." },
  { cat: "Lengua", q: "«Sus ojos son dos luceros» es una…", options: ["metáfora", "hipérbole", "metonimia", "aliteración"], answer: 0 },
  { cat: "Lengua", q: "En inglés, «actually» significa…", options: ["en realidad", "actualmente", "casi", "de nuevo"], answer: 0, explain: "Falso amigo clásico." },
  { cat: "Lengua", q: "En inglés, «embarrassed» significa…", options: ["avergonzado", "embarazada", "aburrido", "cansado"], answer: 0, explain: "Otro falso amigo (no es «embarazada»)." },
  { cat: "Lengua", q: "«Tira eso a la basura, es un ___».", options: ["desecho", "deshecho", "desechó", "deshechó"], answer: 0, explain: "«Desecho» (residuo) sin h; «deshecho» es de deshacer." },
  { cat: "Lengua", q: "Femenino tradicional de «poeta».", options: ["poetisa", "poeta", "poetesa", "poetiza"], answer: 0 },
  { cat: "Lengua", q: "Antónimo de «prolijo».", options: ["escueto", "extenso", "detallado", "minucioso"], answer: 0 },
  { cat: "Lengua", q: "¿Cuántas sílabas tiene «aéreo»?", options: ["4", "3", "5", "2"], answer: 0, explain: "a-é-re-o." },

  // ---------- Kentucky ----------
  { cat: "Kentucky", q: "Los «Wildcats» son la mascota de la Universidad de…", options: ["Kentucky", "Ohio", "Indiana", "Texas"], answer: 0 },
  { cat: "Kentucky", q: "¿En qué estado de EE. UU. da clases Jorge?", options: ["Kentucky", "Ohio", "Tennessee", "Indiana"], answer: 0 },
  { cat: "Kentucky", q: "La capital de Kentucky es…", options: ["Frankfort", "Louisville", "Lexington", "Cincinnati"], answer: 0, explain: "Ni Louisville ni Lexington: la capital es Frankfort." },
  { cat: "Kentucky", q: "La ciudad de Cincinnati está en el estado de…", options: ["Ohio", "Kentucky", "Indiana", "Illinois"], answer: 0, explain: "Cincinnati es de Ohio, justo al otro lado del río." },
  { cat: "Kentucky", q: "Bebida típica de Kentucky.", options: ["Bourbon", "Tequila", "Sidra", "Ron"], answer: 0 },
  { cat: "Kentucky", q: "La famosa carrera de caballos de Kentucky es el…", options: ["Kentucky Derby", "Gran Premio", "Preakness", "Rodeo"], answer: 0 },
  { cat: "Kentucky", q: "El río que separa Cincinnati de Kentucky es el río…", options: ["Ohio", "Misisipi", "Misuri", "Hudson"], answer: 0 },
  { cat: "Kentucky", q: "¿Qué asignatura enseña Jorge en Kentucky?", options: ["Español", "Matemáticas", "Música", "Historia"], answer: 0 },
  { cat: "Kentucky", q: "«Classroom management» en español es…", options: ["gestión del aula", "sala de ordenadores", "dirección del centro", "gestión de notas"], answer: 0 },

  // ---------- Crónicas / Jorge ----------
  { cat: "Crónicas", q: "¿De qué isla española es Jorge?", options: ["Menorca", "Mallorca", "Ibiza", "Tenerife"], answer: 0 },
  { cat: "Crónicas", q: "¿Qué instrumento toca Jorge?", options: ["La batería", "La guitarra", "El bajo", "El piano"], answer: 0 },
  { cat: "Crónicas", q: "¿Cómo se llama la banda de Jorge?", options: ["Holy Crackers", "The Mortals", "Los Wildcats", "The Comet"], answer: 0 },
  { cat: "Crónicas", q: "La serie sobre el aula se titula…", options: ["Kentukiana", "Crónicas", "En el agua", "Serendipias"], answer: 0 },
  { cat: "Crónicas", q: "La serie «En el agua» transcurre en…", options: ["el lago Cumberland", "el río Ohio", "el mar Mediterráneo", "una piscina"], answer: 0 },
  { cat: "Crónicas", q: "Además de tocar la batería, Jorge en directo también…", options: ["rapea", "baila flamenco", "hace magia", "canta ópera"], answer: 0 },

  // ---------- Crónicas: sacadas de los propios textos de Jorge ----------
  { cat: "Crónicas", q: "¿En qué centro empezó a trabajar Jorge como profesor de español en EE.UU.?", options: ["Newport Intermediate School", "Newport High School", "Covington Middle School", "Cincinnati International School"], answer: 0, explain: "Su destino fue el Newport Intermediate School, al norte de Kentucky." },
  { cat: "Crónicas", q: "¿En qué hotel de Newport se alojó Jorge sus primeros días?", options: ["El hotel Lafayette", "El hotel Cumberland", "El hotel Ohio", "El hotel Serrano"], answer: 0, explain: "El taxista lo dejó en la puerta del hotel Lafayette, habitación 222." },
  { cat: "Crónicas", q: "¿Qué bebida describe Jorge como «el famoso licor de Kentucky»?", options: ["El bourbon", "El tequila", "El ron", "La ginebra"], answer: 0, explain: "Probó su primera cerveza con bourbon, el licor típico de Kentucky." },
  { cat: "Crónicas", q: "¿Qué asignatura enseñaba Nick Dehnam, mentor y gran amigo de Jorge?", options: ["Música", "Matemáticas", "Educación física", "Inglés"], answer: 0, explain: "Nick Dehnam era el profesor de música y su mentor en el colegio." },
  { cat: "Crónicas", q: "¿Cuántos años llevaba Jorge dando clase en el IES Pasqual Calbó i Caldés de Menorca?", options: ["Trece años", "Tres años", "Veinte años", "Ocho años"], answer: 0, explain: "Llevaba trece años en ese instituto antes de dar el salto a EE.UU." },
  { cat: "Crónicas", q: "¿En qué ciudad alemana disfrutó Jorge de una beca Erasmus?", options: ["Tübingen", "Berlín", "Múnich", "Hamburgo"], answer: 0, explain: "Años antes había vivido en Alemania como estudiante Erasmus en Tübingen." },
  { cat: "Crónicas", q: "¿Dónde vive David, el hermano de Jorge?", options: ["En Bali (Indonesia)", "En Suiza", "En Texas", "En Bilbao"], answer: 0, explain: "Menciona que podría haberse ido a Bali, donde vive su hermano David." },
  { cat: "Crónicas", q: "De los cuatro países del programa, ¿cuántas plazas ofrecía Estados Unidos?", options: ["617", "10", "5", "100"], answer: 0, explain: "EE.UU. era el país con más plazas: 617, frente a las 10 de Canadá." },
  { cat: "Crónicas", q: "¿Qué había sido antes el club de conciertos Southgate House Revival?", options: ["Una iglesia", "Una fábrica", "Un teatro", "Una escuela"], answer: 0, explain: "Nick le contó que ese edificio había sido antes una iglesia." },
  { cat: "Crónicas", q: "¿En qué cuerpo militar había servido su amigo Seth?", options: ["La Marina (Navy)", "Las Fuerzas Aéreas (Air Force)", "El Ejército de Tierra", "Los Marines"], answer: 0, explain: "Seth sirvió en la Navy; su amigo Darren, en cambio, en la Air Force." },
  { cat: "Crónicas", q: "¿Qué clase de perro era Douglas, la mascota de Seth?", options: ["Un pastor alemán negro", "Un labrador", "Un bulldog", "Un chihuahua"], answer: 0, explain: "Douglas era un pastor alemán de brillante pelo negro que hacía de guardián." },
  { cat: "Crónicas", q: "¿De qué color era Monty, el labrador de Darren?", options: ["Chocolate", "Negro", "Dorado", "Blanco"], answer: 0, explain: "Monty era un labrador color chocolate con el que Jorge hizo buenas migas." },
  { cat: "Crónicas", q: "¿De qué estado venían las amigas Alyssa y Hunter?", options: ["Pensilvania", "Kentucky", "Ohio", "Texas"], answer: 0, explain: "Alyssa y Hunter eran las dos amigas que habían venido desde Pensilvania." },
  { cat: "Crónicas", q: "¿A qué se dedicaba Hunter, entre otras cosas?", options: ["A la caza de ciervos", "Al diseño gráfico", "A la música", "A la enseñanza"], answer: 0, explain: "Hunter cazaba ciervos, cuya superpoblación es un problema en Kentucky." },
  { cat: "Crónicas", q: "¿Qué particularidad tenía el lago Cumberland?", options: ["Era artificial, hecho por el hombre", "Tenía agua salada", "Era el más pequeño del país", "Era de origen volcánico"], answer: 0, explain: "El lago es artificial: se creó con una presa para evitar inundaciones." },
  { cat: "Crónicas", q: "¿Qué documental vio Jorge durante el vuelo hacia Estados Unidos?", options: ["«Ennio», sobre Morricone", "«La terminal»", "«Un franco, 14 pesetas»", "«Thelma y Louise»"], answer: 0, explain: "En el avión quedó encandilado con el documental sobre Ennio Morricone." },
  { cat: "Crónicas", q: "¿Qué coche conducía su amigo Seth?", options: ["Un Jeep azul oscuro", "Un Toyota rojo", "Una moto", "Un Ford blanco"], answer: 0, explain: "Seth tenía un moderno Jeep azul oscuro con unos altavoces impresionantes." },
  { cat: "Crónicas", q: "¿Qué separaba el distrito de Newport de la ciudad de Cincinnati?", options: ["Un puente sobre el río", "Un largo túnel", "Una montaña", "Un bosque"], answer: 0, explain: "Bastaba con cruzar los trescientos metros de puente sobre el río." },
  { cat: "Crónicas", q: "¿A qué deporte pertenece el equipo de los Cincinnati Reds?", options: ["Béisbol", "Fútbol americano", "Baloncesto", "Hockey"], answer: 0, explain: "Vio los estadios de los Reds (béisbol) y de los Bengals (fútbol americano)." },
  { cat: "Crónicas", q: "¿De qué banda de metal menorquín llevaba Jorge una camiseta?", options: ["Cathequesis", "Pèl De Gall", "The Mortals", "A Former Friend"], answer: 0, explain: "Salió de fiesta con una camiseta de la banda de metal menorquín Cathequesis." },

  // ---------- Música ----------
  { cat: "Música", q: "En una batería, el «bombo» se toca con…", options: ["el pie (pedal)", "las dos manos", "una baqueta fina", "la boca"], answer: 0 },
  { cat: "Música", q: "¿Qué es un «riff»?", options: ["Una frase musical que se repite", "Un tipo de micrófono", "Un platillo", "Un baile"], answer: 0 },
  { cat: "Música", q: "El «charles» (hi-hat) forma parte de…", options: ["la batería", "la guitarra", "el piano", "el violín"], answer: 0 },
  { cat: "Música", q: "El rock and roll surgió en…", options: ["Estados Unidos", "Reino Unido", "España", "Alemania"], answer: 0 },
  { cat: "Música", q: "Un «solo» de batería es cuando…", options: ["toca solo el batería", "para la música", "canta el público", "se afina la guitarra"], answer: 0 },

  // ---------- Cultura ----------
  { cat: "Cultura", q: "¿Quién escribió «Don Quijote de la Mancha»?", options: ["Cervantes", "Lope de Vega", "Quevedo", "Góngora"], answer: 0 },
  { cat: "Cultura", q: "La Mancha es una región de…", options: ["España", "México", "Argentina", "Portugal"], answer: 0 },
  { cat: "Cultura", q: "Menorca pertenece a las islas…", options: ["Baleares", "Canarias", "Cíes", "Columbretes"], answer: 0 },
  { cat: "Cultura", q: "¿En qué mar está Menorca?", options: ["Mediterráneo", "Cantábrico", "Atlántico", "Caribe"], answer: 0 },
  { cat: "Cultura", q: "«Serendipia» significa…", options: ["hallazgo afortunado e inesperado", "mala suerte", "viaje largo", "despedida"], answer: 0 },
];
