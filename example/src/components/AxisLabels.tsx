/**
 * 軸ラベルコンポーネント
 * 
 * XYZ軸用の3Dテキストラベルを作成
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
      {/* X軸ラベル - 赤 */}
      <Text
        position={[labelOffset, 0, 0]}
        fontSize={fontSize}
        color="#ff0000"
        anchorX="center"
        anchorY="middle"
      >
        X
      </Text>
      
      {/* Y軸ラベル - 緑 */}
      <Text
        position={[0, labelOffset, 0]}
        fontSize={fontSize}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
      >
        Y
      </Text>
      
      {/* Z軸ラベル - 青 */}
      <Text
        position={[0, 0, labelOffset]}
        fontSize={fontSize}
        color="#0088ff"
        anchorX="center"
        anchorY="middle"
      >
        Z
      </Text>
      
      {/* 軸凡例ボックス */}
      <group position={[size * 0.8, size * 0.8, 0]}>
        {/* 背景 */}
        <mesh>
          <planeGeometry args={[size * 0.3, size * 0.15]} />
          <meshBasicMaterial color={0x1a1a1a} opacity={0.95} transparent />
        </mesh>
        
        {/* X軸情報 */}
        <Text
          position={[0, fontSize * 0.4, 1]}
          fontSize={fontSize * 0.3}
          color="#ff0000"
          anchorX="center"
        >
          X軸: 赤 (Red)
        </Text>
        
        {/* Y軸情報 */}
        <Text
          position={[0, 0, 1]}
          fontSize={fontSize * 0.3}
          color="#00ff00"
          anchorX="center"
        >
          Y軸: 緑 (Green)
        </Text>
        
        {/* Z軸情報 */}
        <Text
          position={[0, -fontSize * 0.4, 1]}
          fontSize={fontSize * 0.3}
          color="#0088ff"
          anchorX="center"
        >
          Z軸: 青 (Blue)
        </Text>
      </group>
    </>
  );
};