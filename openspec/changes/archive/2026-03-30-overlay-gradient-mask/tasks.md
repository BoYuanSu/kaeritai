## 1. State & Types

- [x] 1.1 Add `maskShape` (`'none' | 'circle' | 'rectangle'`) and `gradientMask` (boolean) properties to the overlay state type
- [x] 1.2 Initialise the new properties in default overlay state with `maskShape: 'none'` and `gradientMask: false`

## 2. Canvas Rendering – Shape Mask

- [x] 2.1 In the canvas draw function, apply `ctx.save()` / `ctx.restore()` around overlay drawing
- [x] 2.2 When `maskShape === 'circle'`, define an ellipse clipping path before drawing the overlay image
- [x] 2.3 When `maskShape === 'rectangle'`, define a rect clipping path matching the overlay bounding box before drawing
- [x] 2.4 Call `ctx.clip()` to activate the path before rendering the overlay

## 3. Canvas Rendering – Gradient Mask

- [x] 3.1 Create an off-screen canvas helper that composites the overlay image with a radial gradient using `globalCompositeOperation = 'destination-in'`
- [x] 3.2 When `gradientMask` is true, use the off-screen canvas result instead of the raw overlay image when drawing to the main canvas
- [x] 3.3 Ensure the gradient mask is applied after (or combined with) any active shape mask

## 4. UI Controls

- [x] 4.1 Add a "Shape Mask" select/radio control in the sidebar that sets `maskShape` (`None`, `Circle`, `Rectangle`)
- [x] 4.2 Add a "Gradient Transparency" toggle in the sidebar that sets `gradientMask`
- [x] 4.3 Disable / hide gradient and mask controls when no overlay image is loaded

## 5. Export Validation

- [x] 5.1 Verify that exporting via `canvas.toDataURL()` correctly captures the shape-masked overlay
- [x] 5.2 Verify that exporting correctly captures the gradient-masked overlay
