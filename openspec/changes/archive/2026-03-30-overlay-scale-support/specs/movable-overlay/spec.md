## MODIFIED Requirements

### Requirement: Overlay Image Mobility
The image editor SHALL allow users to move the overlay image freely across the background using pointer events (mouse or touch) while preserving the current overlay scale.

#### Scenario: Dragging the overlay at any scale
- **WHEN** the user presses down on the overlay image and moves the pointer after changing overlay scale
- **THEN** the overlay position updates to follow the pointer continuously without resetting the current scale

#### Scenario: Dropping the overlay after drag
- **WHEN** the user releases the pointer after dragging the overlay
- **THEN** the overlay stays at its newly acquired position with the same scale value as during drag

### Requirement: Exporting Translated Overlay
The system SHALL correctly calculate the overlay transform relative to the underlying image when exporting, including both translation and scale.

#### Scenario: Exporting composited image with scaled overlay
- **WHEN** the user clicks export after moving and scaling the overlay
- **THEN** the final image contains the overlay drawn at the exact user-defined position and scaled dimensions relative to the image borders
