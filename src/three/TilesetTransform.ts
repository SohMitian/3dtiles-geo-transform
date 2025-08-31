import * as THREE from 'three';
import { ecefToGeodetic, ECEFCoordinates } from '../core/ecef';
import { createECEFToLocalRotation, ecefToLocal } from '../core/transform';

/**
 * 3D Tilesの変換オプション
 */
export interface TilesetTransformOptions {
  /** ECEF座標の中心点 */
  center?: ECEFCoordinates;
  /** ローカルの上方向に合わせて自動回転するかどうか */
  autoRotate?: boolean;
  /** タイルのスケール係数 */
  scale?: number;
  /** 変換後に適用するオフセット */
  offset?: THREE.Vector3;
}

/**
 * ECEFからローカル座標への3D Tiles変換用Three.js Group
 * 
 * @example
 * ```typescript
 * import { TilesetTransform } from '3dtiles-geo-transform/three';
 * 
 * const transform = new TilesetTransform({
 *   center: { x: -3950000, y: 3360000, z: 3700000 },
 *   autoRotate: true
 * });
 * 
 * scene.add(transform);
 * transform.add(tilesRenderer.group);
 * ```
 */
export class TilesetTransform extends THREE.Group {
  private options: TilesetTransformOptions;
  private _center?: ECEFCoordinates;
  private _rotation?: THREE.Quaternion;

  constructor(options: TilesetTransformOptions = {}) {
    super();
    this.options = {
      autoRotate: true,
      scale: 1,
      ...options
    };

    if (options.center) {
      this.setCenter(options.center);
    }
  }

  /**
   * 変換の中心点を設定
   * 
   * @param center - ECEF座標の中心点
   */
  setCenter(center: ECEFCoordinates): void {
    this._center = center;
    
    // オフセットを計算（Y軸に沿った中心長の負値）
    const centerVector = new THREE.Vector3(center.x, center.y, center.z);
    const offset = new THREE.Vector3(0, -centerVector.length(), 0);
    
    // autoRotateが有効な場合は回転を適用
    if (this.options.autoRotate) {
      const rotation = createECEFToLocalRotation(center);
      this._rotation = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
      this.quaternion.copy(this._rotation);
    }
    
    // オフセットを適用
    this.position.copy(this.options.offset || offset);
    
    // 指定されていればスケールを適用
    if (this.options.scale && this.options.scale !== 1) {
      this.scale.setScalar(this.options.scale);
    }
  }

  /**
   * 現在の中心点を取得
   */
  getCenter(): ECEFCoordinates | undefined {
    return this._center;
  }

  /**
   * 中心点の測地座標を取得
   */
  getCenterGeodetic(): ReturnType<typeof ecefToGeodetic> | undefined {
    if (!this._center) return undefined;
    return ecefToGeodetic(this._center.x, this._center.y, this._center.z);
  }

  /**
   * ECEFからローカル座標へ点を変換
   * 
   * @param ecef - ECEF座標の点
   * @returns ローカル座標の点
   */
  transformPoint(ecef: ECEFCoordinates): THREE.Vector3 {
    if (!this._center) {
      throw new Error('Center must be set before transforming points');
    }
    
    // 中心に対するローカル座標に変換
    const local = ecefToLocal(ecef, this._center);
    const localVector = new THREE.Vector3(local.x, local.y, local.z);
    
    // 回転が存在する場合は適用
    if (this._rotation) {
      localVector.applyQuaternion(this._rotation);
    }
    
    // スケールを適用
    if (this.options.scale) {
      localVector.multiplyScalar(this.options.scale);
    }
    
    return localVector;
  }

  /**
   * TilesRendererインスタンスに基づいて変換を更新
   * タイルセットから中心を自動的に抽出
   * 
   * @param tilesRenderer - TilesRendererインスタンス
   */
  updateFromTilesRenderer(tilesRenderer: any): void {
    // タイルセットから中心を取得を試みる
    if (tilesRenderer.root && tilesRenderer.root.boundingVolume) {
      const bv = tilesRenderer.root.boundingVolume;
      
      // centerプロパティがある場合（バウンディングスフィア用）
      if (bv.center) {
        this.setCenter({
          x: bv.center[0],
          y: bv.center[1],
          z: bv.center[2]
        });
      }
    }
  }
}

/**
 * ECEFからローカルへの変換行列を作成
 * 
 * @param center - ECEF座標の中心点
 * @param options - 変換オプション
 * @returns 変換行列
 */
export function createTransformMatrix(
  center: ECEFCoordinates,
  options: { autoRotate?: boolean; scale?: number } = {}
): THREE.Matrix4 {
  const matrix = new THREE.Matrix4();
  
  // 中心を原点に移動する平行移動を作成
  const translation = new THREE.Matrix4().makeTranslation(
    -center.x,
    -center.y,
    -center.z
  );
  
  matrix.multiply(translation);
  
  // 必要に応じて回転を適用
  if (options.autoRotate) {
    const rotation = createECEFToLocalRotation(center);
    const quaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
    const rotationMatrix = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
    matrix.multiply(rotationMatrix);
  }
  
  // Apply scale if specified
  if (options.scale && options.scale !== 1) {
    const scaleMatrix = new THREE.Matrix4().makeScale(
      options.scale,
      options.scale,
      options.scale
    );
    matrix.multiply(scaleMatrix);
  }
  
  return matrix;
}