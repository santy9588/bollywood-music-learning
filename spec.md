# RouteTrail

## Current State
New project — no existing application files.

## Requested Changes (Diff)

### Add
- Map view using Google Maps (Leaflet.js as fallback) showing current position and route
- Start/End journey recording with timestamps
- Live GPS route tracking storing coordinates
- Distance calculation between start and current/end point
- Checkpoint system: user can drop named waypoints during a trip
- Trip history: list of all saved journeys with date, distance, duration
- Trip detail view: map replay of route, all checkpoints, start/end info
- Return navigation: from current position back to trip's starting point
- Vehicle type selector (car, bike, truck, walk)
- Trip notes/checklist per journey
- Backend storage for all trips and checkpoints
- Authorization so each user sees their own trips

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: Trip actor with create/update/end trip, add checkpoint, get trips, get trip by ID
2. Authorization component for user identity
3. Frontend: Home screen with map + Start Journey button
4. Active trip screen: live position, route polyline, Add Checkpoint, End Trip
5. Trip history screen: list of past journeys
6. Trip detail screen: map replay, checklist, return navigation link
7. Vehicle type + notes fields on trip creation
