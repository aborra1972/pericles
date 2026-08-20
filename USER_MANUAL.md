# Manual de usuario

Este manual permite recorrer la colección visual de Pericles, comparar modelos y elegir los archivos que debe mostrar el dispositivo.

## Ver la demo

### Online

Abrí la [galería interactiva publicada en GitHub Pages](https://aborra1972.github.io/pericles/demo/). La galería obtiene los SVG directamente desde este repositorio, por lo que siempre muestra la versión publicada más reciente.

### En tu computadora

1. Cloná el repositorio y entrá al proyecto.
2. Iniciá un servidor web local.
3. Abrí `http://localhost:8000/demo/`.

```bash
git clone https://github.com/aborra1972/pericles.git
cd pericles
python3 -m http.server 8000
```

También podés abrir `demo/index.html` directamente en un navegador moderno. El servidor local es preferible porque reproduce el entorno de publicación.

## Usar la galería

1. Recorré las cinco secciones para comparar los modelos.
2. Elegí un estado en la barra superior para verlo en todos los modelos.
3. Presioná **Reiniciar** para reproducir las animaciones desde el comienzo.
4. Anotá el nombre de la carpeta del modelo elegido, por ejemplo `backwards-cap`.

## Modelos disponibles

| Modelo | Estilo |
|--------|--------|
| `pixel` | Pixel art de neón; conserva variantes estáticas y `-anim`. |
| `expressive` | Cara redonda con movimientos faciales y efectos secundarios. |
| `windswept` | Pelo lateral con mechones animados. |
| `knit-beanie` | Flequillo lateral, gorro tejido y pompón. |
| `backwards-cap` | Flequillo frontal y gorra hacia atrás. |

## Estados disponibles

Todos los modelos completos ofrecen estos archivos:

| Estado | Archivo | Uso recomendado |
|--------|---------|-----------------|
| Neutral | `idle.svg` | Espera y escucha. |
| Feliz | `happy.svg` | Respuesta exitosa o saludo. |
| Pensando | `thinking.svg` | Procesamiento de una solicitud. |
| Sorprendido | `surprised.svg` | Resultado inesperado. |
| Gracioso | `funny.svg` | Chiste o comentario travieso. |
| Enojado | `angry.svg` | Error o frustración controlada. |
| Escuchando | `listening.svg` | Micrófono abierto durante una sesión. |
| Hablando | `speaking.svg` | Reproducción de voz mediante TTS. |

El modelo `pixel` también incluye variantes animadas como `happy-anim.svg`. La galería elige esas variantes automáticamente.

## Integrar un modelo

Primero elegí una carpeta de skin y después resolvé el estado dentro de ella:

```text
skins/<modelo>/<estado>.svg
```

Ejemplo:

```text
skins/backwards-cap/happy.svg
```

Al abrir el micrófono, cambiá a `listening.svg`; el asset muestra la expresión de escucha y el texto **Escuchando**. Durante la reproducción de voz, cambiá temporalmente a `speaking.svg`. Al finalizar, restaurá el estado que estaba activo antes de escuchar o hablar.

## Solución de problemas

| Problema | Solución |
|----------|----------|
| La demo online devuelve 404 | Revisá la publicación desde `main` en **Settings → Pages**. |
| Las caras no aparecen localmente | Ejecutá el servidor desde la raíz del repositorio, no desde `demo/`. |
| Una animación ya terminó | Presioná **Reiniciar**. |
| GitHub Pages muestra una versión anterior | Esperá a que termine la publicación disparada por el último push a `main`. |

## Referencias

- [Galería interactiva](https://aborra1972.github.io/pericles/demo/)
- [Contrato de skins](skins/README.md)
- [Perfil del personaje](CHARACTER.md)
