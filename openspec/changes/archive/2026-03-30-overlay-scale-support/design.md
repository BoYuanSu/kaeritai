## Context

The image editor already supports uploading a background and overlay image, moving the overlay, applying opacity/cropping/masking, and exporting PNG output. The current transform model stores translation but not explicit scale, so users cannot resize overlays to fit composition needs. This change introduces a persistent scale transform that must remain consistent across preview interactions and export rendering.

## Goals / Non-Goals

**Goals:**
- Add explicit overlay scaling controls with immediate visual feedback.
- Preserve a single transform state (position + scale) across drag, render, and export.
- Ensure scaling remains compatible with existing overlay manipulation features.
- Define guardrails for minimum and maximum scale to avoid invalid renders.

**Non-Goals:**
- Adding arbitrary rotation or perspective transforms.
- Building advanced multi-layer editing workflows.
- Replacing existing cropping/masking algorithms.

## Decisions

1. Introduce a normalized scale state for overlay transform.
- Decision: Store overlay transform as `{ x, y, scale }` in editor state (with default `scale = 1`).
- Rationale: Keeps preview and export logic aligned around one canonical transform model.
- Alternative considered: Derive scale from rendered width/height only. Rejected because it duplicates computation and increases drift risk between UI and export.

2. Provide direct UI scaling controls with bounded range.
- Decision: Add a slider input for scale with bounded values (for example 0.1 to 3.0) and predictable step size.
- Rationale: Slider is easy to discover, mobile-friendly, and provides deterministic control.
- Alternative considered: Gesture-only pinch zoom. Rejected for initial scope due to desktop accessibility and cross-device complexity.

3. Keep drag behavior in screen-space while applying scale in rendering.
- Decision: Continue storing drag translation in editor coordinates and apply scale during overlay draw/render.
- Rationale: Reuses existing movement mental model while enabling composable transforms.
- Alternative considered: Scale around dynamic drag anchor points. Rejected for now to reduce interaction complexity.

4. Apply identical transform composition in export pipeline.
- Decision: Export path uses the same transform state and draw order as preview (translate then scale before drawing overlay content).
- Rationale: Prevents WYSIWYG mismatch between on-screen result and downloaded PNG.
- Alternative considered: Recompute placement from DOM dimensions at export time. Rejected due to fragility and layout coupling.

## Risks / Trade-offs

- [Scale and crop/mask interaction may visually shift expected output] -> Mitigation: define and document transform order, then verify with combined interaction cases.
- [Large scale values can degrade performance or clip unexpectedly] -> Mitigation: enforce min/max bounds and clamp at state update boundaries.
- [Preview/export mismatch if coordinate spaces diverge] -> Mitigation: share transform utility logic between preview and export code paths.

## Migration Plan

1. Extend overlay transform state model to include `scale` with backward-compatible default.
2. Add scale control UI and bind updates through a single transform updater.
3. Update preview rendering path to apply scale consistently.
4. Update export rendering to use the same transform composition.
5. Validate combined behaviors: drag + scale, opacity + scale, crop/mask + scale, then finalize.

Rollback strategy:
- If regressions are found, disable scale control UI and fall back to `scale = 1` while preserving prior move/export behavior.

## Open Questions

- Should scaling anchor at overlay center or top-left in the first release?
- Do we need different min/max scale bounds for very large source images?
- Should keyboard shortcuts for scale be added in this change or a follow-up?
