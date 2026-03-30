## MODIFIED Requirements

### Requirement: Apply gradient transparency to overlay
The system MUST provide a toggle for applying a gradient transparency to the overlay. When active, the overlay MUST fade out according to the selected shape mask geometry so that the perceived outline remains consistent with the mask.

#### Scenario: Toggling gradient transparency ON with circle mask
- **WHEN** the user selects "Circle" as the shape mask and switches on "Gradient Transparency"
- **THEN** the overlay is visually blended using a radial gradient from opaque center to transparent circular edges

#### Scenario: Toggling gradient transparency ON with rectangle mask
- **WHEN** the user selects "Rectangle" as the shape mask and switches on "Gradient Transparency"
- **THEN** the overlay transparency follows a rectangle-preserving gradient that keeps the overlay outline visually rectangular instead of circular

#### Scenario: Exporting with rectangle gradient mask
- **WHEN** a rectangle shape mask and gradient transparency are applied to the overlay and the user exports the image
- **THEN** the exported image reflects the same rectangle-preserving gradient transparency shown in the editor preview
