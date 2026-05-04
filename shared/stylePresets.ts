export const STYLE_PRESETS = {
  cinematographic: {
    name: "cinematographic",
    displayName: "Cinematográfico",
    description: "Cine profesional con iluminación dramática",
    instructions: "Genera imágenes cinematográficas de 8K con iluminación profesional de tres puntos. Usa colores cálidos y fríos contrastantes. Enfoque en composición de planos cinematográficos (plano general, plano medio, primer plano). Añade profundidad de campo y bokeh. Estilo realista y dramático.",
    colorPaletteHint: "Oro, azul profundo, gris, negro, blanco",
  },
  cyberpunk: {
    name: "cyberpunk",
    displayName: "Cyberpunk",
    description: "Neon distópico con efectos futuristas",
    instructions: "Genera imágenes cyberpunk con neón brillante (cian, magenta, verde lima). Arquitectura futurista y distópica. Lluvia, humo, luces de neón reflejadas. Estilo oscuro y atmosférico. Incluye elementos tech como hologramas, pantallas digitales. Aberración cromática sutil.",
    colorPaletteHint: "Cian neón, magenta, verde lima, negro, púrpura",
  },
  pixar: {
    name: "pixar",
    displayName: "Pixar-style",
    description: "Animación 3D colorida y expresiva",
    instructions: "Genera imágenes en estilo Pixar 3D. Personajes expresivos y carismáticos. Colores vibrantes y saturados. Iluminación cálida y acogedora. Fondos detallados y fantásticos. Proporciones exageradas y estilizadas. Emociones claras en las expresiones faciales.",
    colorPaletteHint: "Rojo vibrante, azul cielo, verde bosque, amarillo, naranja",
  },
  documentary: {
    name: "documentary",
    displayName: "Documental",
    description: "Realismo de National Geographic",
    instructions: "Genera imágenes documentales realistas con calidad de National Geographic. Fotografía natural y auténtica. Colores naturales sin saturación excesiva. Iluminación natural o suave. Enfoque en detalles y texturas reales. Composición que cuenta una historia. Realismo absoluto.",
    colorPaletteHint: "Tonos tierra, verde natural, azul cielo, marrón, beige",
  },
  noir: {
    name: "noir",
    displayName: "Cine Negro",
    description: "Blanco y negro con sombras dramáticas",
    instructions: "Genera imágenes en blanco y negro estilo cine noir clásico. Sombras dramáticas y contrastes altos. Iluminación de bajo key con luces puntuales. Atmósfera misteriosa y tensa. Composición con líneas diagonales y ángulos agudos. Grano de película vintage.",
    colorPaletteHint: "Blanco, negro, grises profundos",
  },
  fantasy: {
    name: "fantasy",
    displayName: "Fantasía Épica",
    description: "Mundos mágicos y aventuras épicas",
    instructions: "Genera imágenes de fantasía épica con mundos mágicos. Castillos, dragones, magia visible. Colores ricos y saturados. Iluminación mágica con efectos de luz sobrenatural. Detalles intrincados y ornamentados. Escala épica y grandiosidad. Atmósfera de aventura y misterio.",
    colorPaletteHint: "Púrpura profundo, oro, azul real, verde esmeralda, plateado",
  },
  scifi: {
    name: "scifi",
    displayName: "Sci-Fi",
    description: "Futurismo y tecnología avanzada",
    instructions: "Genera imágenes sci-fi futuristas con tecnología avanzada. Naves espaciales, ciudades flotantes, robots. Colores metálicos y luminosos. Iluminación futurista con halos y efectos de luz. Arquitectura geométrica y limpia. Atmósfera de progreso tecnológico. Realismo sci-fi.",
    colorPaletteHint: "Plateado, azul eléctrico, blanco brillante, negro profundo, naranja",
  },
  minimalist: {
    name: "minimalist",
    displayName: "Minimalista",
    description: "Diseño limpio y moderno",
    instructions: "Genera imágenes minimalistas con diseño limpio y moderno. Espacios vacíos y composición simple. Pocos elementos pero significativos. Colores sólidos o degradados suaves. Tipografía clara y legible. Enfoque en la esencia del mensaje. Elegancia a través de la simplicidad.",
    colorPaletteHint: "Blanco, negro, gris, un color de acento",
  },
};

export type StylePresetKey = keyof typeof STYLE_PRESETS;

export function getStylePreset(key: StylePresetKey) {
  return STYLE_PRESETS[key];
}

export function getStyleInstructions(key: StylePresetKey): string {
  return STYLE_PRESETS[key]?.instructions || "";
}
