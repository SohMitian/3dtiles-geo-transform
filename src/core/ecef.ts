import { WGS84, MATH } from './constants';

/**
 * 地理座標（緯度、経度、高さ）
 */
export interface GeodeticCoordinates {
  /** 緯度（度） */
  lat: number;
  /** 経度（度） */
  lon: number;
  /** 楕円体上の高さ（メートル） */
  height: number;
}

/**
 * ECEF（地球中心・地球固定）座標
 */
export interface ECEFCoordinates {
  /** X座標（メートル） */
  x: number;
  /** Y座標（メートル） */
  y: number;
  /** Z座標（メートル） */
  z: number;
}

/**
 * ECEF座標を測地座標（緯度/経度/高さ）に変換
 * 
 * @param x - ECEF X座標（メートル）
 * @param y - ECEF Y座標（メートル）
 * @param z - ECEF Z座標（メートル）
 * @returns 測地座標
 */
export function ecefToGeodetic(x: number, y: number, z: number): GeodeticCoordinates {
  const a = WGS84.a;
  const b = WGS84.b;
  const e2 = WGS84.e2;
  
  const p = Math.sqrt(x * x + y * y);
  const theta = Math.atan2(z * a, p * b);
  
  const lat = Math.atan2(
    z + e2 * b * Math.pow(Math.sin(theta), 3),
    p - e2 * a * Math.pow(Math.cos(theta), 3)
  );
  
  const lon = Math.atan2(y, x);
  
  const N = a / Math.sqrt(1 - e2 * Math.pow(Math.sin(lat), 2));
  const height = p / Math.cos(lat) - N;
  
  return {
    lat: lat * MATH.RAD_TO_DEG,
    lon: lon * MATH.RAD_TO_DEG,
    height: height
  };
}

/**
 * 測地座標をECEF座標に変換
 * 
 * @param lat - 緯度（度）
 * @param lon - 経度（度）
 * @param height - 楕円体上の高さ（メートル）
 * @returns ECEF座標
 */
export function geodeticToECEF(lat: number, lon: number, height: number = 0): ECEFCoordinates {
  const a = WGS84.a;
  const e2 = WGS84.e2;
  
  const latRad = lat * MATH.DEG_TO_RAD;
  const lonRad = lon * MATH.DEG_TO_RAD;
  
  const N = a / Math.sqrt(1 - e2 * Math.pow(Math.sin(latRad), 2));
  
  const x = (N + height) * Math.cos(latRad) * Math.cos(lonRad);
  const y = (N + height) * Math.cos(latRad) * Math.sin(lonRad);
  const z = (N * (1 - e2) + height) * Math.sin(latRad);
  
  return { x, y, z };
}

/**
 * 2つのECEF点間の距離を計算
 * 
 * @param p1 - 最初のECEF座標
 * @param p2 - 2番目のECEF座標
 * @returns 距離（メートル）
 */
export function ecefDistance(p1: ECEFCoordinates, p2: ECEFCoordinates): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * ECEF座標の配列から中心点を取得
 * 
 * @param points - ECEF座標の配列
 * @returns 中心ECEF座標
 */
export function ecefCenter(points: ECEFCoordinates[]): ECEFCoordinates {
  if (points.length === 0) {
    throw new Error('Cannot calculate center of empty array');
  }
  
  const sum = points.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y,
      z: acc.z + point.z,
    }),
    { x: 0, y: 0, z: 0 }
  );
  
  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
    z: sum.z / points.length,
  };
}