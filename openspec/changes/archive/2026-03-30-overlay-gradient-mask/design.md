## Context

The photo editor currently supports simple uniform transparency for the overlay image. To create more advanced and seamless blending, we want to allow users to apply gradients and shape masks to the overlay. The existing project is built with React and uses HTML Canvas for applying changes and exporting. The state is maintained via a centralized state hook or contexts.

## Goals / Non-Goals

**Goals:**
- Implement a shape mask option (e.g., Circle, Rectangle) for the overlay.
- Implement a gradient transparency option (e.g., radial from center) for the overlay.
- Ensure the canvas handles these new properties natively without lagging.
- Update UI controls in the sidebar/controls area to allow toggling/adjusting these options.

**Non-Goals:**
- Advanced masking (e.g. magic wand, arbitrary freehand drawing masks).
- Multiple overlays on a single background.
- Video support or animated masks.

## Decisions

**Decision 1: Use Canvas API Native Masking (globalCompositeOperation)**
- **Rationale:** The Canvas API already supports clipping paths (`ctx.clip()`) and gradient fills (`ctx.createRadialGradient`). For a gradient mask, we can draw the mask on an off-screen canvas using `globalCompositeOperation = 'destination-in'` or by applying the image to a shape with `source-in`.
- **Alternatives Considered:** Using CSS masks. However, CSS masks would not be captured during the `.toDataURL()` export. We must do it on the canvas for the final export to work.

**Decision 2: State Expansion**
- **Rationale:** We'll add new properties to our overlay state object: `maskShape` (e.g., 'none', 'circle', 'rectangle') and `gradientMask` (boolean). These will be configurable in the UI controls and read during the canvas redraw loop.

## Risks / Trade-offs

- risk: **Performance overhead when drawing on canvas.** → Mitigation: Creating gradient objects and applying clipping paths on the fly can be slow. Since the canvas is redrawn frequently (e.g. during dragging), we must ensure we rely on `ctx.save()` and `ctx.restore()` carefully, and avoid redundant computations if the state hasn't changed.
- risk: **Complex Canvas Operations interfering with each other.** → Mitigation: We already support scaling, moving, and uniform transparency. We need to apply clipping *before* drawing the image, and gradient masking by using an offscreen canvas to combine the gradient with the image first, then drawing it to the main canvas.
