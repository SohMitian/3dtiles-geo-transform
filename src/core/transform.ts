import { ECEFCoordinates } from './ecef';

/**
 * 3x3回転行列
 */
export type RotationMatrix = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

/**
 * クォータニオン表現
 */
export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

/**
 * ECEFからローカル座標への変換設定
 */
export interface TransformConfig {
  /** ECEF座標の参照中心点 */
  center: ECEFCoordinates;
  /** 適用するオプションの回転 */
  rotation?: Quaternion;
  /** オプションのスケール係数 */
  scale?: number;
}

/**
 * ECEF座標を中心点に対するローカル座標に変換
 * 
 * @param ecef - 変換するECEF座標
 * @param center - ECEFの参照中心点
 * @returns 中心に対するローカル座標
 */
export function ecefToLocal(ecef: ECEFCoordinates, center: ECEFCoordinates): ECEFCoordinates {
  return {
    x: ecef.x - center.x,
    y: ecef.y - center.y,
    z: ecef.z - center.z,
  };
}

/**
 * ローカル座標をECEF座標に変換
 * 
 * @param local - ローカル座標
 * @param center - ECEFの参照中心点
 * @returns ECEF座標
 */
export function localToECEF(local: ECEFCoordinates, center: ECEFCoordinates): ECEFCoordinates {
  return {
    x: local.x + center.x,
    y: local.y + center.y,
    z: local.z + center.z,
  };
}

/**
 * ECEF座標をローカルの上方向に合わせるためのクォータニオンを作成
 * 
 * @param center - ECEF座標の中心点
 * @returns 回転用のクォータニオン
 */
export function createECEFToLocalRotation(center: ECEFCoordinates): Quaternion {
  // 中心ベクトルを正規化して地球中心からの方向を取得
  const length = Math.sqrt(center.x * center.x + center.y * center.y + center.z * center.z);
  const dirX = center.x / length;
  const dirY = center.y / length;
  const dirZ = center.z / length;
  
  // この方向をY軸（上）に合わせるための回転を計算
  // これはECEFの「上」方向をローカルY軸に回転させることと同等
  const angle = Math.acos(dirY);
  const s = Math.sin(angle / 2);
  
  // 回転軸は方向とY軸の外積
  const axisX = dirZ;
  const axisY = 0;
  const axisZ = -dirX;
  const axisLength = Math.sqrt(axisX * axisX + axisZ * axisZ);
  
  if (axisLength < 0.00001) {
    // 方向はすでにY軸に合わせられている
    return { x: 0, y: 0, z: 0, w: 1 };
  }
  
  return {
    x: (axisX / axisLength) * s,
    y: axisY * s,
    z: (axisZ / axisLength) * s,
    w: Math.cos(angle / 2),
  };
}

/**
 * 点にクォータニオン回転を適用
 * 
 * @param point - 回転させる点
 * @param quaternion - 回転クォータニオン
 * @returns 回転後の点
 */
export function applyQuaternion(point: ECEFCoordinates, quaternion: Quaternion): ECEFCoordinates {
  const { x, y, z } = point;
  const { x: qx, y: qy, z: qz, w: qw } = quaternion;
  
  // クォータニオン乗算: q * p * q^-1
  const ix = qw * x + qy * z - qz * y;
  const iy = qw * y + qz * x - qx * z;
  const iz = qw * z + qx * y - qy * x;
  const iw = -qx * x - qy * y - qz * z;
  
  return {
    x: ix * qw + iw * -qx + iy * -qz - iz * -qy,
    y: iy * qw + iw * -qy + iz * -qx - ix * -qz,
    z: iz * qw + iw * -qz + ix * -qy - iy * -qx,
  };
}

/**
 * ECEFからローカル座標への完全な変換を作成
 * 
 * @param config - 変換設定
 * @returns 変換関数
 */
export function createTransform(config: TransformConfig) {
  const { center, rotation, scale = 1 } = config;
  
  return (ecef: ECEFCoordinates): ECEFCoordinates => {
    // まずローカル座標に平行移動
    let local = ecefToLocal(ecef, center);
    
    // 指定されていれば回転を適用
    if (rotation) {
      local = applyQuaternion(local, rotation);
    }
    
    // 指定されていればスケールを適用
    if (scale !== 1) {
      local = {
        x: local.x * scale,
        y: local.y * scale,
        z: local.z * scale,
      };
    }
    
    return local;
  };
}

/**
 * ECEF座標のバウンディングボックスを計算
 */
export function calculateBounds(points: ECEFCoordinates[]): {
  min: ECEFCoordinates;
  max: ECEFCoordinates;
  center: ECEFCoordinates;
} {
  if (points.length === 0) {
    throw new Error('Cannot calculate bounds of empty array');
  }
  
  const min = { ...points[0] };
  const max = { ...points[0] };
  
  for (const point of points) {
    min.x = Math.min(min.x, point.x);
    min.y = Math.min(min.y, point.y);
    min.z = Math.min(min.z, point.z);
    max.x = Math.max(max.x, point.x);
    max.y = Math.max(max.y, point.y);
    max.z = Math.max(max.z, point.z);
  }
  
  return {
    min,
    max,
    center: {
      x: (min.x + max.x) / 2,
      y: (min.y + max.y) / 2,
      z: (min.z + max.z) / 2,
    },
  };
}