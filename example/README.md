# 3dtiles-geo-transform Example

This example demonstrates how to use the `3dtiles-geo-transform` library to load and display geographic 3D Tiles data (such as PLATEAU datasets) with proper coordinate transformations.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features Demonstrated

- Loading 3D Tiles with CESIUM_RTC extension support
- Automatic ECEF to local coordinate transformation
- Camera controls and positioning
- Visual helpers (grid, axes with labels)
- Integration with React Three Fiber

## Data Source

This example uses PLATEAU 3D city model data from Tokyo's Chiyoda ward, served through a proxy to handle CORS issues.

## Key Components

- **PlateauTileset**: Demonstrates how to load 3D Tiles with the CesiumRTCPlugin
- **PlateauTilesetTransform**: Shows coordinate transformation usage
- **SceneHelpers**: Provides visual debugging aids

## Learn More

For more information about the library, see the [main README](../README.md).