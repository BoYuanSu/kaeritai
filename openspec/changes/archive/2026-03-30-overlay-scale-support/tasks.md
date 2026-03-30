## 1. Transform State and Constraints

- [x] 1.1 Extend overlay transform state to include `scale` with default value `1` and clamp helper for min/max bounds.
- [x] 1.2 Update state update paths so drag operations preserve current scale value.
- [x] 1.3 Add shared transform utility for applying translation + scale consistently in preview and export paths.

## 2. Editor UI and Interaction

- [x] 2.1 Add overlay scale control UI (slider) with configured min/max/step values in the editor panel.
- [x] 2.2 Bind scale control to transform state updates and apply clamping at input boundaries.
- [x] 2.3 Verify real-time preview updates during scale changes and combined drag + scale interactions.

## 3. Rendering and Export Consistency

- [x] 3.1 Update preview rendering to apply transform order consistently when drawing overlay content.
- [x] 3.2 Update export canvas drawing to use the same transform model and order as preview.
- [ ] 3.3 Validate exported PNG output matches preview for position and scale in representative cases.

## 4. Regression and Compatibility Checks

- [ ] 4.1 Verify opacity, cropping, and masking remain functional when overlay scale is not `1`.
- [x] 4.2 Add/adjust tests (or manual verification checklist) for scale bounds, drag persistence, and export parity.
- [ ] 4.3 Perform final QA pass on desktop and touch interactions for overlay move + scale flow.
