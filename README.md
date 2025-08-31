# 3dtiles-geo-transform

A geographic coordinate transformation library for 3D Tiles, providing ECEF (Earth-Centered, Earth-Fixed) coordinate transformations and CESIUM_RTC extension support for Three.js and React applications.

## Features

- 🌍 **Geographic Coordinate Transformation**: Convert 3D Tiles from ECEF/WGS84 coordinates to local coordinate systems
- 🎮 **CESIUM_RTC Support**: Handle Cesium's Relative To Center (RTC) extension for improved precision
- ⚡ **Three.js Integration**: Seamless integration with Three.js for 3D rendering
- ⚛️ **React Components**: Ready-to-use React components for React Three Fiber applications
- 📦 **TypeScript Support**: Full TypeScript definitions included
- 🚀 **Framework Agnostic Core**: Core transformation logic can be used independently

## Installation

```bash
npm install 3dtiles-geo-transform
```

or

```bash
yarn add 3dtiles-geo-transform
```

## Quick Start

### Basic Three.js Usage

```javascript
import { CesiumRTCPlugin, createTransformMatrix } from '3dtiles-geo-transform';
import { TilesRenderer } from '3d-tiles-renderer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Setup GLTF loader with CESIUM_RTC support
const gltfLoader = new GLTFLoader();
gltfLoader.register((parser) => new CesiumRTCPlugin(parser));

// Create tiles renderer
const tilesRenderer = new TilesRenderer(tilesetUrl);
tilesRenderer.manager.addHandler(/\.gltf$/, gltfLoader);

// Apply geographic transformation
const center = new THREE.Vector3(x, y, z); // ECEF coordinates
const transformMatrix = createTransformMatrix(center);
tilesRenderer.group.applyMatrix4(transformMatrix);
```

### React Three Fiber Usage

```jsx
import { PlateauTilesetTransform } from '3dtiles-geo-transform';
import { Canvas } from '@react-three/fiber';

function App() {
  return (
    <Canvas>
      <PlateauTilesetTransform>
        {/* Your 3D Tiles components */}
      </PlateauTilesetTransform>
    </Canvas>
  );
}
```

## API Reference

### Core Functions

#### `ecefToLngLat(x, y, z)`
Convert ECEF coordinates to longitude/latitude/height.

#### `lngLatToEcef(lng, lat, height)`
Convert longitude/latitude/height to ECEF coordinates.

#### `createTransformMatrix(center)`
Create a transformation matrix for converting from ECEF to local coordinates.

### Three.js Classes

#### `CesiumRTCPlugin`
GLTFLoader plugin for handling CESIUM_RTC extension.

```javascript
const plugin = new CesiumRTCPlugin(parser);
```

#### `TilesetTransform`
Class for managing 3D tileset transformations.

### React Components

#### `PlateauTilesetTransform`
React component that provides transformation context for child components.

## Supported Data

This library works with any 3D Tiles dataset that uses:
- WGS84/ECEF coordinate system
- CESIUM_RTC extension
- Standard 3D Tiles format (OGC specification)

Compatible with:
- PLATEAU (Japanese 3D city models)
- Cesium ion tilesets
- Any geographic 3D Tiles data

## Example

Check out the `example/` directory for a complete working example using PLATEAU data.

```bash
cd example
npm install
npm start
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Roadmap

- [ ] Babylon.js support
- [ ] WebGL-only implementation
- [ ] Additional coordinate systems support
- [ ] Performance optimizations

## Credits

This library is designed to work with 3D Tiles data, including PLATEAU datasets provided by the Ministry of Land, Infrastructure, Transport and Tourism of Japan.