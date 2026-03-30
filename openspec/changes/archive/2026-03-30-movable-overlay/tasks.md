## 1. State

- [x] 1.1 Add `overlayPosition` (comprising `x` and `y` coordinates) to the `ImageEditor` component's state, initializing to `{ x: 0, y: 0 }`.
- [x] 1.2 Add a state `isDragging` (boolean) to track if the overlay is continuously being moved.
- [x] 1.3 Add a state `dragStartPos` to track the initial pointer coords relative to the overlay when a drag event begins.

## 2. Drag Handlers Implementation

- [x] 2.1 Implement `handlePointerDown` on the overlay image to capture pointer start position and set `isDragging` to true. Use `e.stopPropagation()`.
- [x] 2.2 Implement `handlePointerMove` on the document or container to calculate the delta based on `dragStartPos` and update `overlayPosition`.
- [x] 2.3 Implement `handlePointerUp` to finalize the drag and set `isDragging` to false.
- [x] 2.4 Apply appropriate CSS cursor changes (e.g., `cursor: grab` and `grabbing`) to indicate draggability.

## 3. Positioning the UI Element

- [x] 3.1 Update the overlay image element's inline styling to reflect its position using `transform: translate({x}px, {y}px)`.

## 4. Canvas Export Update

- [x] 4.1 In the export logic (`handleExport` or similar), calculate the scaling factor between the dynamically displayed image size and the natural background size.
- [x] 4.2 Apply this scale to `overlayPosition.x` and `overlayPosition.y`.
- [x] 4.3 Use the scaled coordinates as the `dx` and `dy` parameters in the canvas `ctx.drawImage` call for the overlay so it composites at the correct visual location.
