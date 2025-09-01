/**
 * 3D Tiles Geographic Transform Sample Application
 * 
 * This sample demonstrates how to use the 3dtiles-geo-transform package
 * to load and display geographic 3D Tiles data 
 * in a React application.
 * 
 * Key features:
 * - Loading 3D Tiles with CESIUM_RTC extension support
 * - Automatic coordinate transformation from ECEF to local
 * - Proper camera positioning and controls
 */

import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { TilesetTransformComponent } from '3dtiles-geo-transform';
import { GeoTileset } from './components/GeoTileset';
import { SceneHelpers } from './components/SceneHelpers';

// Style definitions
const styles = {
  app: {
    width: '100vw',
    height: '100vh',
    position: 'relative' as const,
  },
  controls: {
    position: 'absolute' as const,
    top: 20,
    left: 20,
    background: 'rgba(20, 20, 20, 0.95)',
    padding: 20,
    borderRadius: 8,
    boxShadow: '0 2px 20px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 100,
    maxWidth: 300,
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: 18,
    color: '#ffffff',
  },
  text: {
    margin: '10px 0',
    fontSize: 14,
    color: '#aaaaaa',
  },
  loading: {
    margin: '10px 0',
    fontSize: 14,
    color: '#0099ff',
    fontWeight: 500 as const,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
};

// Add pulse animation
const pulseKeyframes = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

// PLATEAU dataset
// Note: This URL uses a proxy to avoid CORS issues.
// The actual data is hosted at https://plateau.geospatial.jp
const GEO_DATASET = {
  name: 'Tokyo Chiyoda Ward Buildings (with textures)',
  url: '/api/tiles/main/data/3d-tiles/bldg/13100_tokyo/13101_chiyoda-ku/texture/tileset.json'
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <style>{pulseKeyframes}</style>
      <div style={styles.app}>
        {/* Information panel */}
        <div style={styles.controls}>
          <h1 style={styles.title}>3D Tiles Geo Transform Example</h1>
          <p style={styles.text}>Dataset: {GEO_DATASET.name}</p>
          {isLoading && <p style={styles.loading}>Loading...</p>}
        </div>

      {/* 3D canvas with dark background */}
      <Canvas 
        camera={{ position: [1000, 1000, 1000], near: 1, far: 1000000 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          // Set dark background color
          gl.setClearColor(0x0a0a0a, 1);
        }}
      >
        {/* Enhanced lighting for dark scene */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[100, 100, 50]} intensity={0.8} castShadow />
        <directionalLight position={[-100, 100, -50]} intensity={0.4} />
        
        {/* Scene helpers - grid and axes */}
        <SceneHelpers 
          gridSize={10000}
          gridDivisions={100}
          axesSize={5000}
          showGrid={true}
          showAxes={true}
        />

        {/* tileset with transformation */}
        <Suspense fallback={null}>
          {/* 
            TilesetTransformComponent provides:
            - Coordinate transformation from ECEF to local
            - Proper rotation aligned with local up direction
            - Context for child components
          */}
          <TilesetTransformComponent>
            <GeoTileset 
              url={GEO_DATASET.url}
              onLoad={() => {
                setIsLoading(false);
              }}
            />
          </TilesetTransformComponent>
        </Suspense>

        {/* Camera controls */}
        <OrbitControls 
          enableDamping
          dampingFactor={0.05}
          screenSpacePanning={false}
          maxPolarAngle={Math.PI / 2}
        />

        {/* Performance statistics */}
        <Stats />
      </Canvas>
      </div>
    </>
  );
};

export default App;