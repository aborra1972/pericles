# PRD de Pericles

| Campo | Definición |
|-------|------------|
| Estado | Definición inicial aprobada |
| Etapa | Prototipo personal |
| Plataforma inicial | ESP32-S3 + aplicación Linux + backend online |
| Fuente | 108 respuestas documentadas en [`PRD_DRAFT.md`](PRD_DRAFT.md) |

## 1. Resumen ejecutivo

Pericles es un asistente físico familiar con voz, pantalla redonda, memoria personal y una identidad inspirada en Pericles Addams. Debe conversar, recordar información autorizada, mostrar emociones mediante skins animadas y ofrecer un resumen diario relevante.

La primera entrega es un prototipo personal administrado desde una aplicación gráfica para Linux. El producto debe soportar una variante ESP32-S3 integrada y otra basada en ReSpeaker XVF3800 con XIAO ESP32-S3. El procesamiento de IA, la memoria y los datos pesados residen en un backend online.

## 2. Problema

Los asistentes convencionales suelen ser impersonales, opacos y difíciles de configurar. Pericles debe resolver tres problemas:

- Ofrecer una interacción física con identidad, humor y expresividad visual.
- Mantener recuerdos útiles por persona sin perder control sobre privacidad y eliminación.
- Permitir que una persona sin experiencia técnica configure, diagnostique y actualice el dispositivo.

## 3. Objetivos

- Conversar por voz y mostrar la respuesta en pantalla.
- Mantener contexto diario y memoria persistente por persona.
- Permitir personalizar identidad, voz, carácter, skins e interacción.
- Ofrecer un resumen diario útil al comenzar el día o cuando se solicite.
- Proporcionar onboarding y actualización de firmware sin terminal.
- Mantener una experiencia clara cuando falle internet o un servicio cloud.

## 4. No objetivos del MVP

- Transferir o procesar archivos.
- Enviar correo o notificaciones móviles.
- Proporcionar timers o alarmas.
- Controlar dispositivos mediante Home Assistant.
- Funcionar con batería.
- Soportar Windows o macOS.
- Cambiar automáticamente a otro proveedor de IA.
- Distribuirse como producto público.

## 5. Usuarios

### Propietario

Existe un único propietario administrador por dispositivo. Puede configurar Pericles, administrar perfiles y memoria, actualizar firmware, consultar diagnósticos y restaurar el sistema.

### Persona conocida

Interactúa mediante un perfil persistente creado con consentimiento. Pericles recuerda su nombre, gustos, actividades, mascotas, trabajo, fechas y contexto relevante.

### Invitado

Puede conversar sin crear un perfil. La sesión no genera recuerdos permanentes.

## 6. Principios de producto

- **Personaje antes que interfaz genérica:** Pericles conserva personalidad y expresión visual en toda interacción.
- **Control explícito:** el botón físico inicia la captura de audio; no existe wake word en el MVP.
- **Configuración antes que rigidez:** los comportamientos subjetivos deben ser parámetros del usuario.
- **Privacidad visible:** la pantalla indica cuándo el micrófono está abierto y el audio se elimina después de transcribir.
- **Complejidad fuera del dispositivo:** memoria, IA y datos pesados viven en el backend.
- **Recuperación segura:** una actualización fallida no debe dejar el dispositivo inutilizable.

## 7. Alcance del MVP

### 7.1 Aplicación Linux

La aplicación se distribuye como AppImage y debe:

- Pedir al usuario que conecte Pericles por USB-C.
- Detectar automáticamente la variante de hardware conectada.
- Validar ESP32-S3 N16R8 y ReSpeaker XVF3800 con XIAO ESP32-S3R8.
- Verificar modelo y firmware antes de habilitar configuración o grabación.
- Leer y escribir parámetros, skins y configuración.
- Mostrar estado, logs y diagnósticos.
- Probar micrófono, altavoz, pantalla, botones, WiFi, BLE y OpenAI por separado.
- Crear y restaurar backups de configuración.
- Clonar una configuración en otro Pericles.
- Actualizar firmware con confirmación explícita.
- Crear un backup y verificar la imagen antes de actualizar.
- Guiar la recuperación si una actualización falla.
- Revincular la cuenta mediante email, USB-C y botón físico, o restaurar a fábrica.

### 7.2 Conversación

- El botón físico de acción abre una sesión de escucha.
- Una sesión permite varias intervenciones.
- La sesión termina por comando de voz, nueva pulsación o inactividad.
- El timeout inicial es de 30 segundos y se configura desde la GUI.
- La respuesta combina voz y texto desplazándose por la pantalla de forma predeterminada.
- El usuario puede elegir voz, texto o ambos como medio de respuesta.
- El límite inicial de respuesta es menor a un minuto y es configurable.
- Pericles detecta el idioma y responde en el mismo; esta función puede desactivarse.
- Pericles no inicia conversaciones por defecto; el usuario puede habilitarlo.

### 7.3 Identidad y personalidad

La personalidad base se conserva según [`CHARACTER.md`](CHARACTER.md). La GUI permite configurar:

| Parámetro | Valor inicial |
|-----------|---------------|
| Nombre visible | `Pericles` |
| Modo de habla | Español neutro con giros argentinos suaves |
| Sarcasmo | 5 |
| Groserías | 5, uso escaso |
| Temas permitidos | Sin filtros |
| Opiniones de actualidad | Noticias, partidos y política activados |
| Mal humor horario | Antes de 10:00 y después de 20:00 |
| Cantos y frases | 50% de oportunidades contextualmente compatibles |
| Iniciativa | Desactivada |
| Longitud máxima | Menos de un minuto |

La personalidad también debe:

- Reaccionar de forma variable ante insultos.
- Mostrar ira graciosa si lo confunden con el estadista ateniense.
- Interesarse inicialmente por cocina, Sherlock Holmes, Boca y música de los 80, 90 y 2000; los gustos son configurables.
- Preferir inicialmente películas de aventuras, acción, policiales y espacio/ciencia ficción; los géneros son configurables.
- Quejarse espontáneamente del clima.
- Proponer trivia, juegos y adivinanzas a pedido o espontáneamente; ambos modos pueden activarse por separado.
- Ganar confianza por persona y volverse más informal; la progresión puede desactivarse.
- Responder con orgullo o humor antes de admitir una corrección; la reacción puede configurarse.
- Recordar fechas importantes y ajustar la anticipación de recordatorios.

### 7.4 Voz y pantalla

- El usuario elige voz, velocidad y tono del TTS.
- La GUI reproduce una prueba antes de guardar la voz.
- El nombre visible no altera la activación física.
- Cada skin incorpora un estado `listening` propio.
- Mientras escucha, muestra la expresión correspondiente y el texto `Escuchando`.
- Los estados `offline`, `actualizando` y `error` son overlays sobre la cara actual.
- La GUI configura brillo, atenuación, apagado, tamaño de texto, velocidad de scroll y contraste.
- El usuario configura volumen desde botones físicos y pantalla.

### 7.5 Memoria

- Pericles pregunta el nombre al comenzar cada sesión.
- El MVP no utiliza reconocimiento de voz para identificar personas.
- Una persona nueva elige entre perfil persistente y modo invitado.
- Los nombres repetidos requieren un apodo.
- El contexto conversacional se mantiene durante el día.
- La memoria persistente puede desactivarse.
- Los recuerdos se guardan en Markdown como representación canónica.
- Un índice de metadatos, búsqueda de texto o embeddings recupera fragmentos relevantes.
- Retención y cuota son configurables por el propietario.
- Solo el propietario puede administrar, exportar o eliminar perfiles y recuerdos.
- El backend debe separar datos por dispositivo y persona.

### 7.6 Resumen diario

- Se ofrece al comenzar la primera sesión del día o se genera a pedido.
- No se reproduce automáticamente a una hora fija.
- Incluye inicialmente clima, agenda, recordatorios, noticias y próximos partidos de Boca.
- Cada categoría del resumen puede activarse o desactivarse desde la GUI.
- Google Calendar usa OAuth con autorización independiente.
- Ubicación, fuentes de noticias y fuentes deportivas se configuran desde la GUI.

### 7.7 IA

- OpenAI es el proveedor del MVP.
- Cada Pericles tiene una API key propia almacenada en el backend.
- El ESP32 recibe únicamente tokens o credenciales temporales.
- La app valida la key antes de vincularla.
- El usuario elige `Económico`, `Equilibrado` o `Máxima calidad`.
- El backend puede cambiar el modelo interno de cada perfil sin exponer nombres técnicos.
- No existe límite mensual obligatorio de gasto en el MVP.
- La arquitectura debe admitir Gemini, Anthropic u Ollama en fases posteriores.

### 7.8 Seguridad

- Bluetooth Low Energy requiere pairing con PIN mostrado en pantalla.
- El botón físico confirma o rechaza el pairing.
- USB-C y WiFi requieren PIN o contraseña del propietario.
- El acceso a app y backend usa email con código temporal.
- No se almacenan API keys permanentes en el ESP32.
- Los perfiles persistentes requieren consentimiento de la persona.
- El prototipo no incluye un consentimiento cloud separado en onboarding.
- Antes de una distribución pública se debe revisar divulgación, privacidad y base legal.

### 7.9 Modo offline

Sin internet permanecen disponibles:

- Volumen y mute.
- Cambio de skin.
- Reloj.
- Diagnóstico.
- Activación mediante botón.

Las funciones cloud muestran un estado `offline`. Ante un fallo de OpenAI, el sistema reintenta y luego pasa a modo offline. Las tareas fallidas se encolan y reintentan automáticamente al recuperar la conexión mientras el dispositivo continúa encendido. La cola es volátil y no se restaura después de reiniciar en el MVP.

### 7.10 Persistencia del dispositivo

La GUI permite elegir si se restauran después de un reinicio:

- Configuración.
- Volumen.
- Skin.
- Sesión pendiente.

La zona horaria se detecta por red y la ubicación del clima se configura manualmente.

## 8. Hardware

El firmware y la aplicación deben soportar dos perfiles de hardware sin alterar las funciones de producto, personalidad o skins.

### 8.1 Variante integrada

| Componente | Definición |
|------------|------------|
| MCU | ESP32-S3 N16R8 |
| Pantalla | GC9A01 redonda |
| Micrófono | INMP441 |
| Amplificador | MAX98357 |
| Altavoz | 40 mm |
| Botones | Volumen +/-, acción, mute y encendido/reinicio |
| WiFi | Conexión permanente |
| Bluetooth | BLE para pairing, control y mensajes pequeños |
| Alimentación | Permanente por cable |
| Datos pesados | Backend online |

No se presupone microSD. La batería queda fuera del MVP.

### 8.2 Variante ReSpeaker

| Componente | Definición |
|------------|------------|
| Placa de audio | ReSpeaker XVF3800 USB 4-Mic Array con XIAO ESP32-S3 |
| MCU | XIAO ESP32-S3R8, dual core hasta 240 MHz |
| Memoria | 8 MB de flash + 8 MB de PSRAM |
| Procesador de audio | XMOS XVF3800 |
| Micrófonos | Array circular de cuatro micrófonos PDM, captura 360° |
| Procesamiento | AEC, AGC, beamforming, VAD, DoA, de-reverberación y reducción de ruido |
| Audio codec | TLV320AIC3104 |
| Comunicación MCU/audio | I2S para audio e I2C para control |
| Firmware XVF3800 | INT-Device/I2S |
| Salida | Conector de altavoz amplificado de hasta 5 W y jack de 3,5 mm |
| Controles integrados | Mute, reset, indicador de mute y 12 LEDs WS2812 |
| Pantalla | Debe conservar la experiencia GC9A01 y los ocho estados visuales; integración eléctrica pendiente de diseño técnico |

La aplicación debe identificar por separado el firmware del XIAO y del XVF3800. La actualización del XVF3800 debe contemplar I2C DFU en modo I2S y recuperación mediante Safe Mode. Los algoritmos de audio integrados reemplazan al INMP441 y MAX98357 de la variante integrada.

## 9. Requisitos no funcionales

### Rendimiento

- Confirmación visual de escucha en menos de 500 ms.
- Inicio de respuesta en menos de 2 segundos bajo condiciones normales.
- Al menos 90% de transcripciones correctas en ambiente tranquilo.
- Las operaciones largas deben mostrar progreso.

### Privacidad

- El audio se captura únicamente después de pulsar el botón.
- El audio original se elimina después de transcribir.
- Los logs excluyen conversaciones, recuerdos, API keys y tokens.
- Los paquetes exportados para soporte contienen exclusivamente información técnica.
- El debug ampliado requiere habilitación temporal y explícita.
- Los reportes anónimos de errores comienzan desactivados y se configuran desde la GUI; no incluyen telemetría general de uso.

### Usabilidad

- Un usuario no técnico completa onboarding y configuración en menos de 10 minutos.
- El flujo no requiere terminal.
- Los errores deben explicar la causa y ofrecer una acción de recuperación.

### Mantenibilidad

- Los perfiles de IA se actualizan desde backend.
- Los overlays técnicos son independientes de las skins.
- La configuración puede respaldarse y clonarse.
- El firmware nunca se actualiza silenciosamente.

## 10. Segunda fase

### Archivos

- La app Linux sube por WiFi un archivo por operación al backend.
- El límite inicial es 25 MB y puede configurarse.
- Admite PDF, imágenes, texto y documentos de oficina soportados por el servicio.
- Ejecuta resumen, traducción, análisis o extracción según el pedido.
- El archivo fuente se elimina después de procesarlo correctamente.
- El resultado predeterminado es Markdown/texto, con PDF opcional.

### Gmail y notificaciones

- Gmail se conecta mediante OAuth; no se guarda la contraseña.
- Solo se envían correos; no se lee el inbox.
- El usuario indica el destinatario en cada operación.
- Los resultados se entregan en la app o por correo.
- `ntfy` proporciona notificaciones móviles.
- Los fallos de OpenAI y de tareas encoladas se notifican mediante `ntfy` cuando esta fase está disponible.

### Timers y alarmas

- Se habilitan y configuran desde la GUI.
- Pueden usar una secuencia visual dormido, despierto y enojo progresivo.
- Reloj, timers y alarmas continúan funcionando sin internet una vez implementados.
- Cuando estas funciones existan, sus tareas podrán reintentarse mientras el dispositivo permanezca encendido.

## 11. Fases posteriores

- Integración con Home Assistant.
- Aplicaciones para Windows y macOS.
- Batería recargable.
- Fallback automático a proveedores distintos de OpenAI.
- Carga de archivos desde teléfono o web móvil.
- Procesamiento de múltiples archivos por operación.

## 12. Criterios de aceptación del MVP

| ID | Criterio |
|----|----------|
| AC-01 | Un usuario no técnico completa onboarding en menos de 10 minutos sin terminal. |
| AC-02 | La app detecta la variante conectada y valida MCU, memoria y firmware antes de habilitar grabación. |
| AC-03 | La pantalla indica escucha en menos de 500 ms desde el botón. |
| AC-04 | La respuesta comienza en menos de 2 segundos bajo condiciones normales. |
| AC-05 | La transcripción alcanza 90% o más en ambiente tranquilo. |
| AC-06 | El audio solo se captura tras pulsar acción y se elimina después de transcribir. |
| AC-07 | Una persona puede rechazar memoria persistente y usar modo invitado. |
| AC-08 | Solo el propietario puede exportar o eliminar perfiles. |
| AC-09 | Cada skin muestra su estado `listening` y los estados técnicos aparecen como overlays. |
| AC-10 | El resumen diario se ofrece en la primera sesión o se genera a pedido. |
| AC-11 | Sin internet, los controles locales siguen funcionando y la pantalla informa el estado. |
| AC-12 | Una actualización de firmware exige confirmación, backup y verificación. |
| AC-13 | Los paquetes de soporte contienen exclusivamente información técnica y ningún dato personal o secreto. |

## 13. Riesgos y decisiones pendientes

| Riesgo | Tratamiento |
|--------|-------------|
| Dependencia total del backend | Modo offline limitado, estados claros y reintentos. |
| Latencia de IA y memoria | Objetivos medibles, índices y contexto selectivo. |
| Costo sin límite mensual | Mostrar consumo en diagnóstico aunque no se imponga un bloqueo. |
| Privacidad cloud sin consentimiento separado | Aceptable solo para prototipo personal; revisión obligatoria antes de distribución. |
| Recuperación de firmware | Backup, validación y flujo guiado por USB-C. |
| Divergencia entre variantes | Perfiles de hardware explícitos, contrato funcional común y pruebas por variante. |
| Complejidad de personalidad | Parámetros con valores iniciales y posibilidad de restaurar defaults. |

Pendientes para diseño técnico:

- Seleccionar modelos concretos detrás de cada perfil de IA.
- Elegir almacenamiento, índice y proveedor del backend online.
- Definir formato exacto del archivo de configuración y esquema de migraciones.
- Definir proveedores de clima, noticias y partidos.
- Diseñar particiones y estrategia de recuperación de firmware.
- Definir pinout, alimentación, pantalla GC9A01 y carcasa para la variante ReSpeaker.
- Definir pruebas de audio equivalentes entre INMP441/MAX98357 y XVF3800.
- Definir comportamiento exacto de la restauración de una sesión pendiente.

## 14. Trazabilidad

- [`PRD_DRAFT.md`](PRD_DRAFT.md): decisiones acumuladas del cuestionario.
- [`TASKS.md`](TASKS.md): backlog ejecutable del MVP.
- [`PROJECT_STATE.md`](PROJECT_STATE.md): checkpoint exacto para reanudar trabajo.
- [`CHARACTER.md`](CHARACTER.md): personalidad canónica.
- [`skins/README.md`](skins/README.md): contrato actual de skins.
- [`USER_MANUAL.md`](USER_MANUAL.md): manual de la demo existente.
- [Documentación oficial ReSpeaker XVF3800 con XIAO ESP32-S3](https://wiki.seeedstudio.com/respeaker_xvf3800_xiao_getting_started/).
- [Especificaciones oficiales XIAO ESP32-S3](https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/).
