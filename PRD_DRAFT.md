# Pericles PRD - Borrador de decisiones

Este documento acumula las respuestas del cuestionario de producto. No es el PRD definitivo: registra decisiones confirmadas, valores iniciales y puntos todavía pendientes.

## Estado

| Campo | Valor |
|-------|-------|
| Preguntas estimadas | 65 |
| Preguntas respondidas | 108 |
| Sets completados | 36 |
| Último set | Público y lanzamiento |

## Contexto de producto

- Pericles está pensado como un dispositivo familiar compartido.
- Cada dispositivo tiene un único propietario administrador y puede interactuar con múltiples personas o invitados.
- La primera entrega es un prototipo personal, no un producto público distribuible.

## 1. Personalidad y tono

### Modo de hablar

- Usa español neutro con giros argentinos suaves, sin voseo marcado como requisito.
- El sarcasmo comienza en nivel `5` y es configurable por el usuario.
- Las groserías son escasas, comienzan en nivel `5` y son configurables por el usuario.

### Límites y reacciones

- Reacciona de manera irregular ante insultos: algunas veces responde con humor y otras se pone serio.
- El usuario puede configurar filtros temáticos. Inicialmente no se filtra ningún tema.
- Le molesta que lo confundan con el estadista ateniense y responde con un rapto de ira gracioso.

### Gustos

- Los gustos son configurables.
- Los valores iniciales son cocina, novelas de detectives con afinidad por Sherlock Holmes, canciones de cancha de Boca y música de las décadas de 1980, 1990 y 2000.
- Opina sobre películas y series; sus géneros iniciales son aventuras, acción, policial y espacio/ciencia ficción.
- Los géneros preferidos se configuran desde la GUI.

## 2. Comportamiento espontáneo

- Puede quejarse espontáneamente del clima.
- Puede mostrarse de mal humor antes de las 10:00 y después de las 20:00.
- Los límites horarios del humor son configurables por el usuario.
- Puede opinar sobre noticias, partidos y política.
- Los temas sobre los que puede opinar son configurables; los tres comienzan habilitados.
- Puede proponer trivia, adivinanzas y juegos tanto a pedido como espontáneamente; ambos modos son configurables.
- La GUI configura la frecuencia de cantos de Boca y frases recurrentes.
- La frecuencia inicial es del 50% de las oportunidades en las que el contexto resulte compatible.

## 3. Conversación y diálogo

- La interacción inicial combina voz y texto desplazándose por la pantalla.
- El medio de respuesta es configurable por el usuario.
- El usuario inicia la interacción mediante el botón físico de acción; el MVP no usa una palabra de activación.
- Mantiene el contexto de conversación durante el día.
- Puede conservar información relevante entre días, como nombres, gustos y actividades de las personas con las que interactúa.
- La memoria persistente puede ser desactivada por el usuario.
- Las respuestas duran menos de un minuto de forma predeterminada; el límite es configurable.
- Por defecto solo responde cuando le hablan; el usuario puede habilitar que inicie conversaciones.
- Puede recordar compromisos y demostrar preocupación por el usuario.
- La confianza evoluciona de forma independiente con cada persona y vuelve el trato más informal con el tiempo; este comportamiento es configurable.
- Al ser corregido, por defecto responde primero con orgullo o humor y después reconoce el error; la reacción es configurable.
- Recuerda cumpleaños, aniversarios, turnos y partidos de Boca.
- Los recordatorios son proactivos y su anticipación se configura desde la GUI.
- Detecta automáticamente el idioma y responde en el mismo; este comportamiento es configurable.
- El usuario puede elegir la voz, velocidad y tono de síntesis.
- La pantalla de parametrización permite reproducir una prueba antes de guardar la voz.
- El nombre visible del asistente puede cambiar sin afectar el mecanismo de activación.
- Después de pulsar el botón, mantiene abierta una sesión para varias intervenciones.
- La sesión termina por comando de voz, nueva pulsación del botón o inactividad.
- El tiempo de inactividad es configurable en la GUI; comienza en 30 segundos.
- Mientras el micrófono está abierto, cada skin muestra una expresión `listening` propia y el texto `Escuchando` debajo de la cara.

## 4. Memoria y recuerdos

- Puede recordar gustos musicales, mascotas, trabajo, actividades y contexto personal relevante.
- La memoria y la información pesada residen en un backend online; Pericles no depende de que una PC esté encendida.
- El backend debe priorizar baja latencia y acceso por dispositivo y persona.
- El contenido canónico de los recuerdos se guarda como Markdown en texto plano para facilitar portabilidad, auditoría y edición.
- Un índice de metadatos, texto completo o embeddings localiza los fragmentos relevantes; el formato Markdown por sí solo no garantiza menor latencia.
- La retención y el límite de almacenamiento de la memoria online son parámetros configurables por el usuario.
- Pericles pregunta el nombre al comienzo de cada sesión para seleccionar o crear la memoria de la persona; no usa reconocimiento de voz en el MVP.
- Ante una persona nueva, solicita consentimiento antes de crear un perfil persistente.
- Si la persona no acepta, utiliza un modo invitado sin recuerdos permanentes.
- Solo el propietario puede administrar, exportar o eliminar perfiles y recuerdos desde la GUI.
- Si existen nombres repetidos, solicita un apodo para diferenciarlos.

## 5. Conectividad y archivos

- Debe aceptar todos los formatos de archivo que pueda procesar el servicio seleccionado, incluidos PDF, imágenes, texto y documentos de oficina.
- La operación depende del pedido: resumen, traducción, análisis, extracción de datos u otra capacidad disponible.
- BLE se utiliza para emparejamiento, control, estado y mensajes pequeños; no para transportar documentos pesados.
- La primera versión recibe archivos únicamente desde la aplicación Linux.
- La aplicación sube los archivos por WiFi directamente al backend online.
- El tamaño máximo inicial es de 25 MB por archivo y puede configurarse desde la GUI/backend.
- La primera versión procesa un solo archivo por operación; no admite lotes.
- El archivo fuente se elimina automáticamente después de completar correctamente el procesamiento.
- El resultado se entrega como Markdown o texto plano de forma predeterminada, con PDF opcional.
- Los resultados se entregan en la aplicación o por correo electrónico, según la configuración.

## 6. Correo y notificaciones

- Utiliza Gmail para enviar correos.
- La cuenta de Gmail se conecta mediante OAuth desde la app Linux; no se almacena la contraseña del correo.
- La primera versión solo envía correos; no lee el inbox.
- El destinatario se indica en cada operación según el pedido del usuario.
- Las notificaciones móviles utilizan `ntfy` en la primera versión.

## 7. Aplicación de configuración

### Alcance

- Es una aplicación gráfica, inicialmente para Linux.
- Detecta y configura Pericles mediante USB-C.
- Permite cargar skins, parámetros y credenciales mediante USB-C o WiFi.
- Lee y escribe configuración, skins y parámetros.
- Muestra logs, estado y diagnósticos del dispositivo.
- La GUI ejecuta pruebas individuales de micrófono, altavoz, pantalla, botones, WiFi, BLE y conexión con OpenAI.
- Permite actualizar el firmware.
- El onboarding pide conectar Pericles por USB-C y detecta automáticamente el ESP32-S3.
- La configuración y grabación se habilitan solo después de comprobar el modelo y la versión de firmware.
- Antes de actualizar, la app crea un backup automático de la configuración y verifica la imagen de firmware.
- Si la actualización falla, la app ofrece un procedimiento de recuperación.
- Las actualizaciones siempre se anuncian y requieren confirmación explícita; nunca se instalan silenciosamente.
- Permite cambiar el nombre del asistente.
- Permite configurar brillo, atenuación automática y tiempo de apagado de la pantalla.
- Permite configurar tamaño, velocidad de desplazamiento y contraste del texto.
- Permite elegir desde la GUI qué estado se restaura después de reiniciar: configuración, volumen, skin y sesión pendiente.
- Las colas de tareas no se restauran después de un reinicio en el MVP.
- La zona horaria se detecta automáticamente mediante la red.
- La ubicación utilizada para el clima se configura manualmente.

### Experiencia

- Debe ser plug and play para personas sin experiencia técnica.
- La versión Linux se distribuye como AppImage ejecutable.
- Windows y macOS quedan planificados para una fase posterior.
- Permite crear copias de seguridad de la configuración.
- Permite clonar una configuración en otro dispositivo Pericles.
- La GUI ofrece dos caminos de recuperación elegidos por el usuario:
- Revincular la cuenta por correo, USB-C y confirmación con el botón físico, conservando los datos.
- Restaurar Pericles a valores de fábrica.

## 8. Hardware confirmado

### Variante integrada

| Componente | Selección |
|------------|-----------|
| Placa | ESP32-S3 N16R8 |
| Pantalla | GC9A01 redonda |
| Micrófono | INMP441 |
| Amplificador | MAX98357 |
| Altavoz | 40 mm |
| Controles físicos | Volumen +/-, acción/push-to-talk, silencio de micrófono y encendido/reinicio |
| Controles en pantalla | Subir y bajar volumen |
| WiFi | Conexión permanente |
| Almacenamiento pesado | PC o servicio externo de baja latencia; sin microSD en la primera versión |
| Alimentación | Conexión permanente; batería recargable fuera del MVP |

### Variante ReSpeaker

- Debe existir una segunda versión compatible con ReSpeaker XVF3800 USB 4-Mic Array y XIAO ESP32-S3R8.
- La memoria correcta del XIAO es **8 MB de flash y 8 MB de PSRAM**.
- El XVF3800 se utiliza en modo INT-Device/I2S, con I2S para audio e I2C para control y DFU.
- La variante aprovecha cuatro micrófonos, AEC, AGC, beamforming, VAD, DoA, de-reverberación, reducción de ruido, LEDs WS2812, mute y salida amplificada.
- La aplicación Linux detecta la variante y administra por separado el firmware del XIAO y del XVF3800.
- La experiencia de pantalla GC9A01, skins y estados visuales se conserva; pinout, alimentación y carcasa quedan para el diseño técnico.

### Estados visuales

- Cada skin incorpora una expresión `listening` propia.
- Los estados técnicos `offline`, `actualizando` y `error` se muestran como indicadores superpuestos sobre la cara actual, sin requerir nuevos SVG por skin.

## 9. Seguridad

- Las API keys se almacenan en la PC o backend, no directamente en el ESP32.
- Cada dispositivo Pericles tiene su propia API key, asociada a su identificador en el almacén seguro de la PC o backend.
- El ESP32 utiliza credenciales o tokens temporales para acceder a los servicios.
- Bluetooth requiere emparejamiento seguro.
- La pantalla muestra el PIN o solicitud de emparejamiento y el botón físico de acción permite aceptar o rechazar. No se necesita otro periférico.
- La configuración mediante USB-C y WiFi está protegida por una contraseña o PIN de propietario.
- El propietario inicia sesión en la app y backend mediante correo electrónico y un código temporal, sin contraseña permanente.
- El MVP no incorpora un paso separado de consentimiento cloud durante el onboarding.
- La divulgación de datos enviados a terceros y la base legal requieren revisión antes de convertir el prototipo en un producto público.

## 10. Configuración de IA

- La primera versión utiliza OpenAI.
- La arquitectura debe permitir incorporar posteriormente Gemini, Anthropic u Ollama sin rehacer el firmware.
- El usuario elige perfiles simples de consumo y calidad, no nombres técnicos de modelos.
- Los perfiles iniciales son `Económico`, `Equilibrado` y `Máxima calidad`.
- El backend puede actualizar el modelo asociado a cada perfil sin exponer nombres técnicos ni cambiar la selección del usuario.
- No se impone un límite mensual de gasto por dispositivo en el MVP.
- La aplicación valida la API key antes de asociarla al dispositivo.

## 11. Funcionamiento offline y recuperación

- Sin internet permanecen disponibles el volumen, mute, cambio de skin, reloj, alarmas, diagnóstico y activación mediante botón.
- Las funciones que requieren IA o servicios cloud informan claramente que no hay conexión.
- Las tareas online fallidas se guardan y reintentan automáticamente cuando vuelve la conexión.
- La cola de reintentos incluye, como mínimo, correos, archivos y recordatorios sincronizables.
- Ante un fallo de OpenAI, el sistema reintenta, notifica mediante `ntfy` y pasa a modo offline.
- El fallback automático a otro proveedor queda para una fase posterior.

## 12. Objetivos de latencia

- La pantalla confirma la interacción en menos de 500 ms.
- La respuesta de voz o texto comienza en menos de 2 segundos bajo condiciones normales.
- El procesamiento de archivos pesados puede superar ese objetivo y debe mostrar progreso.

## 13. Funciones cotidianas

- Timers y alarmas se habilitan y configuran desde la GUI.
- Las alarmas pueden usar una secuencia visual: dormido, despierto y enojo progresivo si el usuario no responde.
- El resumen diario es configurable y comienza con clima, agenda, recordatorios, noticias y próximos partidos de Boca habilitados.
- El resumen no se genera ni reproduce a una hora fija.
- Pericles lo ofrece al comenzar la primera sesión del día o lo genera cuando el usuario lo solicita.
- Google Calendar se conecta mediante OAuth con autorización independiente.
- La ubicación del clima y las fuentes de noticias y partidos de Boca se seleccionan desde la GUI.
- La integración con Home Assistant para luces, enchufes y escenas queda fuera del MVP y se evalúa en una fase posterior.

## 14. Alcance por fase

### MVP

- Aplicación Linux con onboarding, configuración, diagnóstico y actualización segura de firmware.
- Conversación por voz y pantalla con activación física y estado visual de escucha.
- Personalidad, voz, parámetros y skins configurables.
- Memoria online individual por persona.
- Resumen diario configurable con clima, agenda, recordatorios, noticias y partidos de Boca.

### Segunda fase

- Procesamiento y resumen de archivos desde la app Linux.
- Envío de resultados mediante Gmail.
- Notificaciones móviles mediante `ntfy`.
- Timers y alarmas animadas.

### Fases posteriores

- Home Assistant.
- Windows y macOS.
- Batería recargable.
- Fallback automático a otros proveedores de IA.

## 15. Criterios de aceptación del MVP

- Una persona sin conocimientos técnicos completa onboarding y configuración en menos de 10 minutos sin abrir una terminal.
- La pantalla indica el inicio de escucha en menos de 500 ms desde la pulsación del botón.
- La respuesta comienza en menos de 2 segundos bajo condiciones normales.
- La transcripción alcanza al menos 90% de exactitud en un ambiente tranquilo.
- El micrófono captura audio únicamente después de pulsar el botón de acción.
- El audio original se elimina después de transcribirlo.
- La GUI permite al propietario exportar y eliminar perfiles y recuerdos.

## 16. Logs y telemetría

- Los logs excluyen por defecto conversaciones, recuerdos, API keys y tokens.
- La exportación para soporte contiene únicamente información técnica.
- La GUI permite habilitar temporalmente datos adicionales para depuración con consentimiento explícito.
- Los reportes anónimos de errores son configurables desde la GUI y comienzan desactivados.

## Pendientes destacados

- Completar conectividad y funcionalidades adicionales.
