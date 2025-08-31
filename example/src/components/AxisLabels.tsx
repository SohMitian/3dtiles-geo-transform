/**
 * Axis Labels Component
 * 
 * Creates 3D text labels for XYZ axes
 */

import React from 'react';
import { Text } from '@react-three/drei';

interface AxisLabelsProps {
  size?: number;
}

export const AxisLabels: React.FC<AxisLabelsProps> = ({ size = 5000 }) => {
  const labelOffset = size * 1.2;
  const fontSize = size * 0.1;
  
  return (
    <>
      {/* X-axis label - Red */}
      <Text
        position={[labelOffset, 0, 0]}
        fontSize={fontSize}
        color="#ff0000"
        anchorX="center"
        anchorY="middle"
      >
        X
      </Text>
      
      {/* Y-axis label - Green */}
      <Text
        position={[0, labelOffset, 0]}
        fontSize={fontSize}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
      >
        Y
      </Text>
      
      {/* Z-axis label - Blue */}
      <Text
        position={[0, 0, labelOffset]}
        fontSize={fontSize}
        color="#0088ff"
        anchorX="center"
        anchorY="middle"
      >
        Z
      </Text>
      
      {/* Axis legend box */}
      <group position={[size * 0.8, size * 0.8, 0]}>
        {/* Background */}
        <mesh>
          <planeGeometry args={[size * 0.3, size * 0.15]} />
          <meshBasicMaterial color={0x1a1a1a} opacity={0.95} transparent />
        </mesh>
        
        {/* X-axis info */}
        <Text
          position={[0, fontSize * 0.4, 1]}
          fontSize={fontSize * 0.3}
          color="#ff0000"
          anchorX="center"
        >
          X-axis: Red
        </Text>
        
        {/* Y-axis info */}
        <Text
          position={[0, 0, 1]}
          fontSize={fontSize * 0.3}
          color="#00ff00"
          anchorX="center"
        >
          Y-axis: Green
        </Text>
        
        {/* Z-axis info */}
        <Text
          position={[0, -fontSize * 0.4, 1]}
          fontSize={fontSize * 0.3}
          color="#0088ff"
          anchorX="center"
        >
          Z-axis: Blue
        </Text>
      </group>
    </>
  );
};