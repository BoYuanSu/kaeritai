## ADDED Requirements

### Requirement: Overlay Opacity Adjustment
The system SHALL provide a control to adjust the opacity (transparency) of the overlay image from 0% to 100%.

#### Scenario: User changes overlay opacity
- **WHEN** the user adjusts the opacity slider
- **THEN** the overlay image transparency updates in real-time on the preview canvas.

### Requirement: Overlay Cropping
The system SHALL allow the user to crop the overlay image before or during composition.

#### Scenario: User crops the overlay image
- **WHEN** the user applies a crop selection to the overlay
- **THEN** only the cropped area of the overlay is rendered onto the final composition.
