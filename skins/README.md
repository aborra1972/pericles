# Face skins

Each subdirectory is a complete, interchangeable visual style for the round display.

- `pixel/` preserves the original neon pixel-art assets, including distinct static and `-anim` variants.
- `expressive/` contains self-contained 240x240 animated SVGs with layered facial motion and secondary effects.
- `windswept/` features layered hair and independently animated fringe locks with restrained wind follow-through.

Standard mood filenames are `idle.svg`, `happy.svg`, `thinking.svg`, `surprised.svg`, `funny.svg`, and `angry.svg`. A skin may also provide `all-moods.svg` as a visual overview and style-specific variants such as `happy-anim.svg`.

Firmware should select a skin directory first, then resolve mood files relative to that directory, for example `skins/expressive/happy.svg`. This keeps mood selection independent from any particular visual style or implementation.
