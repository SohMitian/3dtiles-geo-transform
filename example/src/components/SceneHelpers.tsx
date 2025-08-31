/**
 * Scene Helper Component
 * 
 * Provides visual aids for orientation and scale reference in 3D scene
 */

import React from 'react';
import { AxisLabels } from './AxisLabels';

interface SceneHelpersProps {
  /** Grid size (default: 10000) */
  gridSize?: number;
  /** Grid divisions (default: 100) */
  gridDivisions?: number;
  /** Axes helper size (default: 5000) */
  axesSize?: number;
  /** Show grid (default: true) */
  showGrid?: boolean;
  /** Show axes (default: true) */
  showAxes?: boolean;
}

export const SceneHelpers: React.FC<SceneHelpersProps> = ({
  gridSize = 10000,
  gridDivisions = 100,
  axesSize = 5000,
  showGrid = true,
  showAxes = true,
}) => {
  return (
    <>
      {/* Grid helper - creates grid on XZ plane */}
      {showGrid && (
        <gridHelper 
          args={[
            gridSize,           // Size
            gridDivisions,      // Divisions
            0x444444,          // Center line color
            0x222222           // Grid color
          ]} 
        />
      )}
      
      {/* Axes helper - shows XYZ axes */}
      {showAxes && (
        <>
          {/* Main axes at origin */}
          <axesHelper args={[axesSize]} />
          
          {/* Axis labels with text */}
          <AxisLabels size={axesSize} />
        </>
      )}
      
      {/* Origin marker */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[50, 16, 16]} />
        <meshBasicMaterial color={0xffffff} opacity={0.5} transparent />
      </mesh>
    </>
  );
};