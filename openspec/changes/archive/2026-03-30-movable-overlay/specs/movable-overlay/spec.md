## ADDED Requirements

### Requirement: Overlay Image Mobility
The image editor SHALL allow users to move the overlay image freely across the background using pointer events (mouse or touch).

#### Scenario: Dragging the overlay
- **WHEN** the user presses down on the overlay image and moves the pointer
- **THEN** the overlay image position updates to follow the pointer continuously

#### Scenario: Dropping the overlay
- **WHEN** the user releases the pointer after dragging the overlay
- **THEN** the overlay stays at its newly acquired position

### Requirement: Exporting Translated Overlay
The system SHALL correctly calculate the overlay's translated coordinates relative to the underlying image when exporting.

#### Scenario: Exporting composited image
- **WHEN** the user clicks export
- **THEN** the final image must contain the overlay drawn at the exact user-defined coordinates corresponding to its final drag position relative to the image borders
