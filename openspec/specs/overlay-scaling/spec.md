# Overlay Scaling

## Purpose

Defines requirements for interactive overlay scaling in the editor and parity between preview and export output.

## Requirements

### Requirement: Overlay Scale Control
The system SHALL provide a user control to resize the overlay image with continuous visual feedback in the editor preview.

#### Scenario: User adjusts overlay scale
- **WHEN** the user changes the scale control value
- **THEN** the overlay is re-rendered immediately at the new scale in the preview

### Requirement: Overlay Scale Bounds and Persistence
The system SHALL clamp overlay scale to configured minimum and maximum bounds and preserve the effective scale for export.

#### Scenario: User tries to scale beyond allowed limits
- **WHEN** the user input requests a scale smaller than minimum or larger than maximum
- **THEN** the system applies the nearest allowed bound and keeps rendering stable

#### Scenario: Export uses final overlay scale
- **WHEN** the user exports the composition after scaling the overlay
- **THEN** the exported image contains the overlay at the same effective scale shown in preview
