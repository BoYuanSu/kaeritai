## Why

Users currently can only apply a uniform transparency to the overlay. Having gradient transparency and shape masks (e.g. circles) would greatly enhance the creative possibilities and allow blending images much more seamlessly.

## What Changes

- Add capability to apply gradient transparency (e.g., radial gradient from the center to edges) to the overlay.
- Add capability to apply specific shape masks (e.g. circle) to the overlay.
- Introduce new UI controls for users to toggle and adjust these masks and gradients.

## Capabilities

### New Capabilities
- `overlay-masking`: The ability to apply gradient transparencies and shape-based masking to the overlay.

### Modified Capabilities


## Impact

- Image Editor UI (new controls for shape and gradient configuration)
- Canvas rendering logic (drawing the overlay with specific `globalCompositeOperation`, creating gradients and clipping paths)
- Export logic (ensuring the drawn masks and gradients export correctly)
