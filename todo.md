# AI Video Director Pro - TODO

## Base de Datos y Backend
- [x] Crear tabla `projects` (id, userId, nombre, descripción, createdAt, updatedAt)
- [x] Crear tabla `visual_bibles` (id, projectId, estilo, paleta, personajes, descripción, generatedAt)
- [x] Crear tabla `scenes` (id, projectId, número, timeStart, timeEnd, audioText, imagePrompt, animationPrompt, sequenceNote, imageUrl, imageKey, createdAt)
- [x] Crear tabla `style_presets` (id, nombre, descripción, instrucciones)
- [x] Implementar procedimiento tRPC para crear proyecto
- [x] Implementar procedimiento tRPC para obtener proyecto con escenas
- [x] Implementar procedimiento tRPC para actualizar escena (prompts manuales)
- [x] Implementar procedimiento tRPC para eliminar proyecto

## Transcripción de Audio
- [x] Implementar endpoint para subir archivo de audio (estructura lista)
- [ ] Integrar Whisper API para transcripción automática
- [ ] Validar formatos de audio (mp3, wav, m4a)
- [ ] Manejar errores de transcripción

## Motor de Análisis Narrativo con IA
- [x] Implementar generación de "Biblia Visual" con LLM
- [x] Extraer estilo, paleta de colores, personajes del texto narrativo
- [x] Generar instrucciones de coherencia visual
- [x] Almacenar Biblia Visual en base de datos

## Segmentación y Generación de Prompts
- [x] Implementar lógica de segmentación en bloques de 5 segundos
- [x] Generar prompts de imagen base para cada escena
- [x] Generar prompts de animación de 5 segundos
- [x] Inyectar estilo visual en todos los prompts
- [x] Generar notas de conexión de secuencia entre escenas
- [x] Asegurar coherencia visual absoluta entre escenas

## Generación de Imágenes
- [x] Integrar API de generación de imágenes (API integrada)
- [x] Generar imagen base para cada escena
- [ ] Usar imagen anterior como referencia para coherencia visual entre frames
- [x] Almacenar URLs de imágenes en base de datos
- [x] Manejar errores de generación de imágenes
- [ ] Implementar reintento de generación si falla
- [ ] Mostrar estado claro cuando una imagen no se genera

## Interfaz Principal (Retro-Futurista)
- [x] Diseñar estética retro-futurista con scanlines y aberración cromática
- [x] Implementar entrada dual: upload de audio + textarea de texto
- [x] Crear selector de estilo visual (Cinematográfico, Cyberpunk, Pixar, Documental, Cine Negro, etc.)
- [x] Implementar botón para generar proyecto (conectar con tRPC)
- [x] Mostrar indicador de progreso durante procesamiento
- [x] Mostrar estado de generación de Biblia Visual
- [x] Mostrar estado de generación de escenas
- [x] Mostrar errores de generación de forma clara

## Vista de Storyboard
- [x] Crear galería de escenas con layout grid/list
- [x] Mostrar número de escena
- [x] Mostrar rango de tiempo (00:00–00:05)
- [x] Mostrar texto del audio de la escena
- [x] Mostrar imagen base generada
- [x] Mostrar prompt de animación
- [x] Mostrar nota de conexión de secuencia
- [ ] Implementar scroll/paginación si hay muchas escenas
- [x] Mostrar estado 'solo-prompts' en escenas sin imagen
- [ ] Mostrar estado de error cuando imagen no se genera

## Editor Manual de Prompts
- [x] Crear modal/panel de edición para cada escena
- [x] Permitir editar prompt de imagen base
- [x] Permitir editar prompt de animación
- [x] Permitir editar nota de conexión de secuencia
- [x] Guardar cambios en base de datos
- [ ] Opcionalmente regenerar imagen si se edita prompt

## Modo Solo-Prompts
- [x] Agregar toggle/checkbox para "Modo Solo-Prompts"
- [x] Cuando está activo, no generar imágenes base
- [x] Mostrar claramente que está en modo solo-prompts
- [ ] Exportar solo prompts sin imágenes

## Exportación
- [x] Implementar descarga de prompts en TXT
- [x] Implementar descarga de prompts en PDF (usar manus-md-to-pdf)
- [ ] Implementar descarga individual de imágenes por escena
- [ ] Implementar descarga de todas las imágenes en ZIP
- [x] Incluir información de escena en archivos exportados
- [ ] Nombrar imágenes por número de escena

## Pruebas y Ajustes
- [x] Pruebas de generación de Biblia Visual
- [x] Pruebas de generación de prompts coherentes
- [x] Pruebas de inyección de estilo en todos los prompts
- [x] Pruebas de coherencia visual entre escenas consecutivas
- [ ] Pruebas de transcripción de audio
- [ ] Pruebas de generación de imágenes
- [ ] Pruebas de exportación
- [x] Ajustes de UI/UX retro-futurista
- [ ] Optimización de rendimiento
- [ ] Pruebas de responsividad

## Despliegue
- [x] Crear checkpoint 1 (estructura base)
- [x] Crear checkpoint 2 (exportación y errores)
- [ ] Crear checkpoint final (antes de publicar)
- [ ] Desplegar aplicación

## Notas de Implementación

### Funcionalidades Completadas:
1. **Motor de Análisis Narrativo**: Utiliza LLM para generar Biblia Visual con estilo, paleta, personajes y ambiente
2. **Segmentación Automática**: Divide narrativas en bloques de 5 segundos con prompts coherentes
3. **Generación de Imágenes**: API integrada genera imágenes base para cada escena
4. **Editor Manual**: Permite editar prompts de imagen, animación y notas de conexión
5. **Modo Solo-Prompts**: Opción para generar solo prompts sin imágenes
6. **Exportación TXT**: Descarga de prompts en formato texto plano
7. **Manejo de Errores**: Backend retorna lista de escenas con errores, frontend muestra warnings
8. **Dashboard**: Gestión de proyectos del usuario con vista de lista
9. **Interfaz Retro-Futurista**: Diseño con scanlines, neón cian/magenta y aberración cromática

### Funcionalidades Pendientes:
1. **Exportación PDF**: Usar manus-md-to-pdf para generar PDF descargable
2. **Descarga de Imágenes**: Individual y en ZIP
3. **Transcripción de Audio**: Integrar Whisper API
4. **Pruebas de Responsividad**: Validar en móviles y tablets
5. **Optimización**: Performance y caching

### Arquitectura Clave:
- **Base de Datos**: 4 tablas (projects, visual_bibles, scenes, style_presets)
- **Backend**: tRPC con procedimientos para CRUD de proyectos y generación
- **Frontend**: React con Tailwind CSS, entrada dual (audio/texto)
- **IA**: LLM para análisis narrativo, generación de imágenes integrada
- **Coherencia Visual**: Biblia Visual se aplica a todas las escenas sin excepción
- [ ] Validar funcionamiento en producción

## Nueva Solicitud - Descarga de Imágenes en ZIP
- [x] Crear servicio para generar ZIP con todas las imágenes
- [x] Implementar procedimiento tRPC para descargar ZIP
- [x] Agregar botón de descarga ZIP en Storyboard.tsx
- [x] Validar que el ZIP contenga todas las imágenes nombradas correctamente
- [x] Manejar errores cuando no hay imágenes disponibles
- [x] Crear endpoint HTTP para descargar ZIP
- [x] Agregar tests para validar funcionalidad de ZIP

## Bug Fix - Error al crear proyecto
- [x] Identificar que createProject retornaba projectId: 0
- [x] Corregir función createProject para extraer insertId correctamente
- [x] Actualizar procedimiento tRPC para validar ID válido
- [x] Ejecutar tests para validar corrección (10/10 ✓)


## Nueva Solicitud - Galería de Videos
- [x] Crear página Gallery.tsx con vista de galería de proyectos
- [x] Mostrar tarjetas de proyectos con thumbnail/preview
- [x] Mostrar información: nombre, fecha creación, número de escenas, estilo
- [x] Implementar búsqueda y filtrado de proyectos
- [x] Agregar opciones de gestión: editar, duplicar, eliminar proyecto
- [x] Mostrar confirmación antes de eliminar
- [x] Implementar procedimiento tRPC para listar proyectos del usuario
- [x] Implementar procedimiento tRPC para eliminar proyecto
- [x] Implementar procedimiento tRPC para duplicar proyecto
- [x] Agregar ruta en App.tsx para acceder a la galería
- [x] Agregar botón "VER MIS PROYECTOS" en Home.tsx
- [x] Mostrar estado vacío cuando no hay proyectos
- [ ] Agregar tests para funcionalidad de galería
- [ ] Agregar navegación desde Dashboard a Galería
- [ ] Implementar thumbnail/preview real por proyecto (primera imagen de escena)
- [ ] Agregar acción explícita de editar proyecto desde la galería
