## Context

We are adding a client-side image editor to allow users to combine a background image with an overlay image. The overlay can be cropped and its opacity adjusted. All operations are local to the browser.

## Goals / Non-Goals

**Goals:**
- Provide a smooth, client-side only image rendering and export experience.
- Export compositions as an optimized PNG without requiring a backend round-trip.

**Non-Goals:**
- Server-side image processing or hosting of images.
- Complex photo editing features like filtering, red-eye removal, or healing brushes.

## Decisions

- **Rendering & Export: HTML5 Canvas**: We will use the HTML5 Canvas API to render the background and the manipulated overlay to generate the final PNG.
  - *Rationale*: Canvas is built-in, performant, and reliable for combining image data compared to `html2canvas`-like DOM snapshot solutions.
- **Local File Handling: `URL.createObjectURL`**: Uploaded image files will be kept in memory and referenced via temporary object URLs.
  - *Rationale*: This avoids the overhead of reading large files into base64 strings and solves any potential upload delay.
- **Cropping Implementation**: We will leverage a robust client-side cropping component/library for the UI to get the crop coordinates, which will then be applied to the Canvas during the final render.

## Risks / Trade-offs

- **Memory constraints with large images**: Browsers might crash if the user uploads 4K+ images and we try to manipulate them raw.
  - *Mitigation*: We may need to limit file upload size or downscale extremely large images before painting them to the canvas.
- **Canvas Taint / CORS**: If we ever support external image URLs, the canvas cannot be exported.
  - *Mitigation*: We are strictly supporting local file uploads right now, so `File` objects will not taint the canvas.
