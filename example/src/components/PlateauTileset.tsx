/**
 * 3D Tiles サンプルコンポーネント
 * 
 * このサンプルは、3dtiles-geo-transformパッケージを使用して
 * 地理座標系の3D Tilesデータを適切な座標変換で読み込み、表示する方法を示しています。
 */

import React, { useEffect, useRef, useContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { TilesRenderer } from '3d-tiles-renderer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { CesiumRTCPlugin, PlateauTilesetTransformContext } from '3dtiles-geo-transform';
import * as THREE from 'three';

interface PlateauTilesetProps {
  /** tileset.jsonファイルへのURL */
  url: string;
  /** タイルセットがロードされたときのコールバック */
  onLoad?: (tiles: TilesRenderer) => void;
}

export const PlateauTileset: React.FC<PlateauTilesetProps> = ({ url, onLoad }) => {
  const { camera, gl } = useThree();
  const tilesRef = useRef<TilesRenderer | null>(null);
  const [tiles, setTiles] = React.useState<TilesRenderer | null>(null);
  const context = useContext(PlateauTilesetTransformContext) as any;
  const setCenter = context?.setCenter;

  useEffect(() => {
    // ステップ1: 圧縮ジオメトリ用のDRACOデコーダーをセットアップ
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

    // ステップ2: DRACOサポート付きGLTFローダーをセットアップ
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    
    // ステップ3: CESIUM_RTC拡張を処理するCesiumRTCPluginを登録
    // これはRTC座標を使用するPLATEAUデータにとって重要です
    gltfLoader.register((parser: any) => new CesiumRTCPlugin(parser));

    // ステップ4: タイルセットURLでTilesRendererを作成
    const tiles = new TilesRenderer(url);
    
    // ステップ5: 異なるファイル形式用のローダーを設定
    tiles.manager.addHandler(/\.gltf$/, gltfLoader);
    tiles.manager.addHandler(/\.b3dm$/, gltfLoader);
    
    // ステップ6: LOD管理のためのカメラと解像度を設定
    tiles.setCamera(camera);
    tiles.setResolutionFromRenderer(camera, gl);

    // ステップ7: LOD設定を構成
    tiles.errorTarget = 6;
    tiles.maxDepth = 15;

    tilesRef.current = tiles;
    setTiles(tiles);  // 再レンダリングをトリガー

    // ステップ8: タイルセットロードイベントを処理
    tiles.addEventListener('load-tile-set', () => {
      // バウンディングボックスから中心を計算
      const box = new THREE.Box3();
      if (tiles.getBoundingBox(box)) {
        const center = new THREE.Vector3();
        box.getCenter(center);
        
        // 座標変換のための中心を設定
        if (setCenter) {
          setCenter(center);
        }
        
        // カメラ位置を調整
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
    
    // エラー処理
    tiles.addEventListener('load-tile-set-error', (error: any) => {
      console.error('Failed to load tileset:', error);
      console.error('URL:', url);
    });

    // クリーンアップ
    return () => {
      if (tilesRef.current) {
        tilesRef.current.dispose();
        setTiles(null);
      }
    };
  }, [url, camera, gl, setCenter, onLoad]);

  // 毎フレームタイルを更新
  useFrame(() => {
    if (tilesRef.current) {
      tilesRef.current.update();
    }
  });

  // タイルグループをレンダリング
  return tiles ? <primitive object={tiles.group} /> : null;
};