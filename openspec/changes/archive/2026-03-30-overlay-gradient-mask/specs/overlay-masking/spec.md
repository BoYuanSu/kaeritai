## ADDED Requirements

### Requirement: Apply shape masks to overlay
The system MUST allow users to select a shape mask (e.g. circle) to apply to the overlay. The selected shape MUST clip the overlay image both in the editor canvas and in the final exported image.

#### Scenario: Selecting a circle mask
- **WHEN** the user selects "Circle" from the shape mask options
- **THEN** the overlay is clipped to a circular shape centered within its bounding box

#### Scenario: Removing the mask
- **WHEN** the user selects "None" from the shape mask options
- **THEN** the overlay is drawn without any shape clipping

### Requirement: Apply gradient transparency to overlay
The system MUST provide a toggle for applying a gradient transparency to the overlay. When active, the overlay MUST fade out from the center to its edges.

#### Scenario: Toggling gradient transparency ON
- **WHEN** the user switches on "Gradient Transparency"
- **THEN** the overlay is visually blended using a radial gradient from opaque center to transparent edges

#### Scenario: Exporting with gradient mask
- **WHEN** a gradient mask is applied to the overlay and the user exports the image
- **THEN** the exported image reflects the same gradient transparency on the overlay
