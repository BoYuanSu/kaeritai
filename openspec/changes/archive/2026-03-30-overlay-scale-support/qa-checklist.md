## Overlay Scale QA Checklist

### Setup

- Load one background image and one overlay image.
- Keep browser zoom at 100% for consistent pointer behavior.

### Functional Checks

- Scale slider updates overlay size in real-time.
- Scale value clamps at min (10%) and max (300%).
- Dragging overlay after scaling preserves current scale value.
- Exported PNG matches on-screen overlay position and scale.

### Compatibility Checks

- Opacity slider still affects scaled overlay correctly.
- Crop area output remains correct after scaling and moving.
- Shape mask (`none`/`circle`/`rectangle`) clips correctly with scaled overlay.
- Gradient transparency mask still applies correctly when scaled.

### Interaction Checks

- Desktop mouse drag works smoothly with scale applied.
- Touch drag works without page scrolling while dragging on canvas.
- Pointer cancel/leave does not keep editor stuck in dragging state.

### Regression Notes

- Compare output with scale = 100% against previous behavior baseline.
- Verify no TypeScript/eslint/build failures before release.
