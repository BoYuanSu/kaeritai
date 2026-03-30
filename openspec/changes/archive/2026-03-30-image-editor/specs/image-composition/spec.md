## ADDED Requirements

### Requirement: Background and Overlay Upload
The system SHALL allow the user to select and upload two distinct image files: a background image and an overlay image.

#### Scenario: User uploads required images
- **WHEN** the user selects a background image and an overlay image
- **THEN** both images are loaded into the editor memory and displayed on the canvas.

### Requirement: PNG Export
The system SHALL allow the user to export the composed canvas (containing the background and the overlay images) as a single PNG file.

#### Scenario: User exports the composition
- **WHEN** the user clicks the "Export" button
- **THEN** a PNG file of the composed graphic is downloaded to the user's device.
