# QA Checklist - fix-rectangle-gradient-transparency

## Automated Verification

- [x] Unit test: rectangle gradient keeps rectangular falloff characteristics
- [x] Unit test: circle gradient keeps radial falloff characteristics
- [x] Lint passes (`pnpm lint`)
- [x] Build passes (`pnpm build`)

## Manual Verification (Pending)

- [x] Preview: select Shape Mask = Rectangle + Gradient Transparency ON, confirm overlay outline remains visually rectangular
- [x] Export: with Rectangle + Gradient Transparency ON, exported PNG matches preview result
- [x] Regression: Shape Mask = Circle + Gradient Transparency ON still shows radial fade behavior

## Notes

- Automated checks validate falloff behavior in code.
- Manual UI verification is still required for final visual acceptance.
