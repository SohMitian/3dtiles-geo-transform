/**
 * 3D Tiles Sample Component
 * 
 * This sample demonstrates how to use the 3dtiles-geo-transform package
 * to load and display geographic 3D Tiles data with proper coordinate transformation.
 */

import React, { useEffect, useRef, useContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { TilesRenderer } from '3d-tiles-renderer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { CesiumRTCPlugin, PlateauTilesetTransformContext } from '3dtiles-geo-transform';
import * as THREE from 'three';

interface PlateauTilesetProps {
  /** URL to tileset.json file */
  url: string;
  /** Callback when tileset is loaded */
  onLoad?: (tiles: TilesRenderer) => void;
}

export const PlateauTileset: React.FC<PlateauTilesetProps> = ({ url, onLoad }) => {
  const { camera, gl } = useThree();
  const tilesRef = useRef<TilesRenderer | null>(null);
  const [tiles, setTiles] = React.useState<TilesRenderer | null>(null);
  const context = useContext(PlateauTilesetTransformContext) as any;
  const setCenter = context?.setCenter;

  useEffect(() => {
    // Step 1: Set up DRACO decoder for compressed geometry
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

    // Step 2: Set up GLTF loader with DRACO support
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    
    // Step 3: Register CesiumRTCPlugin to handle CESIUM_RTC extension
    // This is important for PLATEAU data that uses RTC coordinates
    gltfLoader.register((parser: any) => new CesiumRTCPlugin(parser));

    // Step 4: Create TilesRenderer with tileset URL
    const tiles = new TilesRenderer(url);
    
    // Step 5: Set up loaders for different file formats
    tiles.manager.addHandler(/\.gltf$/, gltfLoader);
    tiles.manager.addHandler(/\.b3dm$/, gltfLoader);
    
    // Step 6: Set camera and resolution for LOD management
    tiles.setCamera(camera);
    tiles.setResolutionFromRenderer(camera, gl);

    // Step 7: Configure LOD settings
    tiles.errorTarget = 6;
    tiles.maxDepth = 15;

    tilesRef.current = tiles;
    setTiles(tiles);  // Trigger re-rendering

    // Step 8: Handle tileset load event
    tiles.addEventListener('load-tile-set', () => {
      // Calculate center from bounding box
      const box = new THREE.Box3();
      if (tiles.getBoundingBox(box)) {
        const center = new THREE.Vector3();
        box.getCenter(center);
        
        // Set center for coordinate transformation
        if (setCenter) {
          setCenter(center);
        }
        
        // Adjust camera position
        const sphere = new THREE.Sphere();
        tiles.getBoundingSphere(sphere);
        const distance = sphere.radius * 2.5;
        camera.position.set(distance, distance * 0.5, distance);
        camera.lookAt(0, 0, 0);
      }
      
      if (onLoad) {
        onLoad(tiles);
      }
    });
    
    // Error handling
    tiles.addEventListener('load-tile-set-error', (error: any) => {
      console.error('Failed to load tileset:', error);
      console.error('URL:', url);
    });

    // Cleanup
    return () => {
      if (tilesRef.current) {
        tilesRef.current.dispose();
        setTiles(null);
      }
    };
  }, [url, camera, gl, setCenter, onLoad]);

  // Update tiles every frame
  useFrame(() => {
    if (tilesRef.current) {
      tilesRef.current.update();
    }
  });

  // Render tiles group
  return tiles ? <primitive object={tiles.group} /> : null;
};