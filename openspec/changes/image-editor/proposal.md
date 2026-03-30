## Why

Users need the ability to combine two images, consisting of a background and an overlay, to create composed graphics. This solves the problem of needing an external, complex image editing software for simple photo combinations.

## What Changes

- Add an interface to upload a background image and an overlay image.
- Add controls to adjust the transparency (opacity) of the overlay image.
- Add a mechanism to crop the overlay image.
- Add a canvas or preview area to see the composed result in real-time.
- Add an export function to download the composed image as a PNG file.

## Capabilities

### New Capabilities
- `image-composition`: Covers uploading multiple image layers (background and overlay), rendering them in stacking order, and exporting the final composition as a PNG.
- `overlay-manipulation`: Covers interactions with the overlay image, specifically cropping and adjusting transparency opacity.

### Modified Capabilities
- (None)

## Impact

- New UI components for image editing.
- State management for handling multiple image layers (source URL, crop coordinates, opacity).
- Canvas or similar Web API integration for rendering and exporting the final PNG.
