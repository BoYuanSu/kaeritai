## Why

The editor currently allows moving overlays but not resizing them, which blocks common use cases where users need precise size control to match the background composition. Adding overlay scale support now closes a core editing gap and makes export results more usable.

## What Changes

- Add user-facing controls to scale the overlay up and down within defined minimum and maximum bounds.
- Update interaction behavior so overlay scaling is reflected immediately in preview and preserved while dragging.
- Ensure export uses the final transformed overlay size and position.
- Keep existing upload, masking, and opacity/cropping workflows compatible with scaling.

## Capabilities

### New Capabilities
- `overlay-scaling`: Adds requirements for interactive overlay resize behavior, limits, and transform persistence in editor preview and export.

### Modified Capabilities
- `movable-overlay`: Extend movement requirements to include combined translation + scale transform behavior.
- `image-composition`: Clarify that PNG export must include the overlay with its final scaled dimensions.

## Impact

- Specs: add `specs/overlay-scaling/spec.md`; update delta specs for `movable-overlay` and `image-composition`.
- UI/editor logic: overlay transform state handling in `src/components/ImageEditor.tsx` and related styling/controls.
- Export pipeline: canvas draw logic must apply both overlay translation and scale consistently.
