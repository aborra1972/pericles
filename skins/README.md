# Face skins

The finalized collection contains five interchangeable visual styles for the round display:

- `pixel/` preserves the original neon pixel-art assets, including distinct static and `-anim` variants.
- `expressive/` contains self-contained 240x240 animated SVGs with layered facial motion and secondary effects.
- `windswept/` features dimensional blonde hair swept to one side with independently animated fringe locks.
- `knit-beanie/` combines a side fringe with a ribbed wool beanie and restrained pom follow-through.
- `backwards-cap/` combines a front fringe with a backwards cap whose rear opening, strap, and rear visor remain readable at display size.

Standard mood filenames are `idle.svg`, `happy.svg`, `thinking.svg`, `surprised.svg`, `funny.svg`, and `angry.svg`. Complete selectable skins also provide the operational states `listening.svg` and `speaking.svg`. The `all-moods.svg` overview shows all eight runtime states, and a skin may provide style-specific variants such as `happy-anim.svg`.

Firmware should select a skin directory first, then resolve mood files relative to that directory, for example `skins/expressive/happy.svg`. This keeps mood selection independent from any particular visual style or implementation.

When the microphone opens, firmware switches to `listening.svg`. Every listening asset combines an attentive expression, an animated input indicator, and the `Escuchando` label. During TTS playback, firmware switches to `speaking.svg`; that asset owns the looping phoneme-like mouth motion. When the interaction ends, firmware restores the mood that was active before listening or speaking.
