## MODIFIED Requirements

### Requirement: PNG Export
The system SHALL allow the user to export the composed canvas (containing the background and overlay images) as a single PNG file that reflects the final overlay transform state.

#### Scenario: User exports composition with transformed overlay
- **WHEN** the user clicks the "Export" button after moving and scaling the overlay
- **THEN** a PNG file of the composed graphic is downloaded to the user's device with overlay position and scale matching the editor preview
