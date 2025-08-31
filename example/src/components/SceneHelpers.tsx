/**
 * シーンヘルパーコンポーネント
 * 
 * 3Dシーンの方向とスケール参照のための視覚的な支援を提供
 */

import React from 'react';
import { AxisLabels } from './AxisLabels';

interface SceneHelpersProps {
  /** グリッドのサイズ（デフォルト: 10000） */
  gridSize?: number;
  /** グリッドの分割数（デフォルト: 100） */
  gridDivisions?: number;
  /** 軸ヘルパーのサイズ（デフォルト: 5000） */
  axesSize?: number;
  /** グリッドを表示（デフォルト: true） */
  showGrid?: boolean;
  /** 軸を表示（デフォルト: true） */
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
      {/* グリッドヘルパー - XZ平面上にグリッドを作成 */}
      {showGrid && (
        <gridHelper 
          args={[
            gridSize,           // サイズ
            gridDivisions,      // 分割数
            0x444444,          // 中央線の色
            0x222222           // グリッドの色
          ]} 
        />
      )}
      
      {/* 軸ヘルパー - XYZ軸を表示 */}
      {showAxes && (
        <>
          {/* 原点のメイン軸 */}
          <axesHelper args={[axesSize]} />
          
          {/* テキスト付き軸ラベル */}
          <AxisLabels size={axesSize} />
        </>
      )}
      
      {/* 原点マーカー */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[50, 16, 16]} />
        <meshBasicMaterial color={0xffffff} opacity={0.5} transparent />
      </mesh>
    </>
  );
};