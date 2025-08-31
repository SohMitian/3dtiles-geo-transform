import { WGS84, MATH } from './constants';

/**
 * Geographic coordinates (latitude, longitude, height)
 */
export interface GeodeticCoordinates {
  /** Latitude in degrees */
  lat: number;
  /** Longitude in degrees */
  lon: number;
  /** Height above ellipsoid in meters */
  height: number;
}

/**
 * ECEF (Earth-Centered, Earth-Fixed) coordinates
 */
export interface ECEFCoordinates {
  /** X coordinate in meters */
  x: number;
  /** Y coordinate in meters */
  y: number;
  /** Z coordinate in meters */
  z: number;
}

/**
 * Convert ECEF coordinates to geodetic coordinates (latitude/longitude/height)
 * 
 * @param x - ECEF X coordinate in meters
 * @param y - ECEF Y coordinate in meters
 * @param z - ECEF Z coordinate in meters
 * @returns Geodetic coordinates
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
 * Convert geodetic coordinates to ECEF coordinates
 * 
 * @param lat - Latitude in degrees
 * @param lon - Longitude in degrees
 * @param height - Height above ellipsoid in meters
 * @returns ECEF coordinates
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
 * Calculate distance between two ECEF points
 * 
 * @param p1 - First ECEF coordinate
 * @param p2 - Second ECEF coordinate
 * @returns Distance in meters
 */
export function ecefDistance(p1: ECEFCoordinates, p2: ECEFCoordinates): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Get center point from array of ECEF coordinates
 * 
 * @param points - Array of ECEF coordinates
 * @returns Center ECEF coordinate
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