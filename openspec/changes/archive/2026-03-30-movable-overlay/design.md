## Context

The image editor currently allows users to upload a background and an overlay image, but the overlay is statically positioned. To give users more creative freedom, we need to allow moving the overlay. The app uses React and HTML Canvas for the final export.

## Goals / Non-Goals

**Goals:**
- Enable mouse and pointer-based drag-and-drop for the overlay image on top of the background.
- Update the export logic so the newly positioned overlay and background are composited correctly onto the `<canvas>`.
- Use a lightweight, native approach (React pointer events) for dragging.

**Non-Goals:**
- Advanced transformations like rotating or freely scaling the overlay in this iteration (focus is strictly on 2D translation).
- Snap-to-grid or alignment guides.

## Decisions

- **State Management**: We will add `overlayPosition` `{x: number, y: number}` to the state in our React component.
- **Dragging Mechanism**: Implement standard pointer event handlers (`onPointerDown`, `onPointerMove`, `onPointerUp`) on the overlay element itself or its container to track the offset changes. 
- **Styling**: We will use CSS `transform: translate(px, px)` or absolute `top`/`left` styling for the drag visualization because it is highly performant.
- **Export Compositing**: During canvas drawing, we will incorporate the `overlayPosition` values into the `ctx.drawImage()` call to reflect the user's chosen placement.

## Risks / Trade-offs

- **Risk:** Conflicts with `react-image-crop` if the background crop is active simultaneously.
  - *Mitigation:* We will ensure pointer events on the overlay call `e.stopPropagation()` so we don't accidentally trigger a crop while dragging the overlay.
- **Risk:** Calculating export coordinates correctly if the container is scaled.
  - *Mitigation:* We will compute the scale ratio of the displayed image versus its natural size and apply that scaling factor to the drag coordinates during final export.
