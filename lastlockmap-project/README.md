# LastLockFall2024 - Lock It Like It's Hot - Frontend Capstone Project
# Lock Data Map Visualization

## Overview
This project is an interactive map-based application that displays lock data for various rooms based on access logs and GeoJSON data. Built using JSX and the Mapbox API, the application provides detailed insights into room usage, accessibility, and state. Users can interact with the map to view room-specific data, visualize time series trends, and manage room states through a set of intuitive toggles and visual elements.

## Authors
Elijah Gauger, Joe Untrecht, Justin Bildner, Patrick Tuohy, and Shreyas Natarajan

## Features
### 1. Interactive Room Data
- **Click on a Room**: Displays access logs, room hours, and a bar chart representing access intensity over time.
- **Room Lock Status**: Automatically locks rooms when accessed outside of set hours.

### 2. Room Name Toggle
- **Toggle Feature**: Room names can be toggled on or off using the checkbox on the top-left corner.
- **Reason**: Helps declutter the map when multiple rooms are displayed, replacing names with dots to avoid overlapping labels.

### 3. Time Series Visualization
- **Access Pattern Insights**: The second toggle enables a time-series visualization where room dots adjust in size based on the number of accesses at a given time.
- **Adjustable Time Slider**: Users can customize the displayed time range to explore access trends.

### 4. Conference Room States
- **Room Filters**: The third toggle filters conference rooms, highlighting their current state:
  - **Red**: In use.
  - **Yellow**: Booked and about to be used within the next 30 minutes.
  - **Green**: Free and available.
  - **Orange**: Booked but no access logs are recorded, indicating the room is likely free.

### 5. Mock Data and Potential API Integration
- **Mock Data**: The application currently uses mock access logs and GeoJSON data.
- **Future Potential**: Ideally, real-time data would be retrieved from an API for enhanced functionality.

## How It Works
1. **Map Display**: The application renders a map of rooms and conference spaces using the Mapbox API.
2. **Data Visualization**:
   - Clicking on a room opens a detailed view with:
     - Access logs.
     - Hours of operation (modifiable).
     - A bar chart of access intensity.
3. **Toggles and Filters**:
   - **Room Name Toggle**: Helps declutter the map.
   - **Time Series Toggle**: Visualizes access trends with adjustable parameters.
   - **Conference Room Filter**: Highlights room states using color-coded dots.

## Usage
1. Open the application.
2. Use the checkboxes in the top-left corner:
   - **Show Room Names**: Display or hide room names.
   - **Time Series Visualization**: Analyze access patterns over time.
   - **Conference Room Filter**: Focus on specific conference room availability.
3. Click on a room for detailed information and charts.
4. Modify room hours to manage lock status dynamically.

## Technical Details
- **Frameworks and Libraries**:
  - **JSX**: Used for UI components and interactivity.
  - **Mapbox API**: Handles map rendering and geographic data.
- **Data**:
  - Mock access logs and GeoJSON data are used to simulate real-world scenarios.
- **Visualizations**:
  - Bar charts for access intensity.
  - Interactive map with state-based visual cues.

## Future Enhancements
- **API Integration**: Replace mock data with real-time access logs and room schedules.
- **Enhanced User Interface**: Provide additional customization options for map display and filters.
- **Advanced Analytics**: Introduce predictive models for room usage based on historical data.

## Installation and Setup
1. Clone the repository.
2. Install dependencies using:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open the application in your browser.

## License
This project is licensed under [insert license here].

