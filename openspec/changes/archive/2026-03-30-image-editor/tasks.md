## 1. Setup and UI Foundation

- [x] 1.1 Create the basic component layout for the Image Editor (upload controls, preview area, export button).
- [x] 1.2 Evaluate and install a reliable front-end image cropping library (if not implementing bespoke Canvas cropping).

## 2. Image Loading

- [x] 2.1 Implement the background image uploader using `URL.createObjectURL()`.
- [x] 2.2 Implement the overlay image uploader.
- [x] 2.3 Manage uploaded image dimensions and states (background URL, overlay URL).

## 3. Overlay Manipulation

- [x] 3.1 Implement an opacity slider and bind its value (0 to 1) to the component state.
- [x] 3.2 Implement the crop UI for the overlay image, yielding crop box dimensions.

## 4. Canvas Rendering

- [x] 4.1 Set up the main `<canvas>` element mapping to the background image dimensions.
- [x] 4.2 Draw the background image to the canvas on state changes.
- [x] 4.3 Draw the cropped overlay image onto the canvas, applying the selected opacity using `ctx.globalAlpha`.

## 5. Export Feature

- [x] 5.1 Implement the logic for the "Export" button.
- [x] 5.2 Use `canvas.toDataURL('image/png')` to capture the final composition.
- [x] 5.3 Trigger a file download for the generated PNG file.
