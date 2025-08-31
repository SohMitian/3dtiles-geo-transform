/**
 * 3D Tiles Geographic Transform サンプルアプリケーション
 * 
 * このサンプルは、3dtiles-geo-transformパッケージを使用して
 * 地理座標系の3D Tilesデータ（PLATEAU等）をReactアプリケーションで
 * 読み込み、表示する方法を示しています。
 * 
 * 主な機能:
 * - CESIUM_RTC拡張をサポートした3D Tilesの読み込み
 * - ECEFからローカル座標への自動座標変換
 * - 適切なカメラ位置とコントロール
 */

import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { PlateauTilesetTransform } from '3dtiles-geo-transform';
import { PlateauTileset } from './components/PlateauTileset';
import { SceneHelpers } from './components/SceneHelpers';

// スタイル定義
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

// パルスアニメーションを追加
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

// PLATEAUデータセット
// 注: このURLはCORS問題を回避するためにプロキシを使用しています。
// 実際のデータは https://plateau.geospatial.jp でホストされています
const PLATEAU_DATASET = {
  name: '東京都千代田区 建築物（テクスチャ付き）',
  url: '/api/plateau/main/data/3d-tiles/bldg/13100_tokyo/13101_chiyoda-ku/texture/tileset.json'
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <style>{pulseKeyframes}</style>
      <div style={styles.app}>
        {/* 情報パネル */}
        <div style={styles.controls}>
          <h1 style={styles.title}>3D Tiles Geo Transform Example</h1>
          <p style={styles.text}>Dataset: {PLATEAU_DATASET.name}</p>
          {isLoading && <p style={styles.loading}>Loading...</p>}
        </div>

      {/* ダークな背景の3Dキャンバス */}
      <Canvas 
        camera={{ position: [1000, 1000, 1000], near: 1, far: 1000000 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          // ダークな背景色を設定
          gl.setClearColor(0x0a0a0a, 1);
        }}
      >
        {/* ダークシーン用の強化された照明 */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[100, 100, 50]} intensity={0.8} castShadow />
        <directionalLight position={[-100, 100, -50]} intensity={0.4} />
        
        {/* シーンヘルパー - グリッドと軸 */}
        <SceneHelpers 
          gridSize={10000}
          gridDivisions={100}
          axesSize={5000}
          showGrid={true}
          showAxes={true}
        />

        {/* 変換付きPLATEAUタイルセット */}
        <Suspense fallback={null}>
          {/* 
            PlateauTilesetTransformが提供する機能:
            - ECEFからローカル座標への座標変換
            - ローカルの上方向に合わせた適切な回転
            - 子コンポーネント用のコンテキスト
          */}
          <PlateauTilesetTransform>
            <PlateauTileset 
              url={PLATEAU_DATASET.url}
              onLoad={() => {
                setIsLoading(false);
              }}
            />
          </PlateauTilesetTransform>
        </Suspense>

        {/* カメラコントロール */}
        <OrbitControls 
          enableDamping
          dampingFactor={0.05}
          screenSpacePanning={false}
          maxPolarAngle={Math.PI / 2}
        />

        {/* パフォーマンス統計 */}
        <Stats />
      </Canvas>
      </div>
    </>
  );
};

export default App;