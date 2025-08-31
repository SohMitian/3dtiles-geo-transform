import { ECEFCoordinates } from './ecef';

/**
 * 3x3 rotation matrix
 */
export type RotationMatrix = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

/**
 * Quaternion representation
 */
export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

/**
 * Transform configuration from ECEF to local coordinates
 */
export interface TransformConfig {
  /** Reference center point in ECEF coordinates */
  center: ECEFCoordinates;
  /** Optional rotation to apply */
  rotation?: Quaternion;
  /** Optional scale factor */
  scale?: number;
}

/**
 * Convert ECEF coordinates to local coordinates relative to center point
 * 
 * @param ecef - ECEF coordinates to convert
 * @param center - ECEF reference center point
 * @returns Local coordinates relative to center
 */
export function ecefToLocal(ecef: ECEFCoordinates, center: ECEFCoordinates): ECEFCoordinates {
  return {
    x: ecef.x - center.x,
    y: ecef.y - center.y,
    z: ecef.z - center.z,
  };
}

/**
 * Convert local coordinates to ECEF coordinates
 * 
 * @param local - Local coordinates
 * @param center - ECEF reference center point
 * @returns ECEF coordinates
 */
export function localToECEF(local: ECEFCoordinates, center: ECEFCoordinates): ECEFCoordinates {
  return {
    x: local.x + center.x,
    y: local.y + center.y,
    z: local.z + center.z,
  };
}

/**
 * Create a quaternion to align ECEF coordinates with local up direction
 * 
 * @param center - Center point in ECEF coordinates
 * @returns Quaternion for rotation
 */
export function createECEFToLocalRotation(center: ECEFCoordinates): Quaternion {
  // Normalize center vector to get direction from Earth center
  const length = Math.sqrt(center.x * center.x + center.y * center.y + center.z * center.z);
  const dirX = center.x / length;
  const dirY = center.y / length;
  const dirZ = center.z / length;
  
  // Calculate rotation to align this direction with Y-axis (up)
  // This is equivalent to rotating ECEF 'up' direction to local Y-axis
  const angle = Math.acos(dirY);
  const s = Math.sin(angle / 2);
  
  // Rotation axis is cross product of direction and Y-axis
  const axisX = dirZ;
  const axisY = 0;
  const axisZ = -dirX;
  const axisLength = Math.sqrt(axisX * axisX + axisZ * axisZ);
  
  if (axisLength < 0.00001) {
    // Direction is already aligned with Y-axis
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
 * Apply quaternion rotation to a point
 * 
 * @param point - Point to rotate
 * @param quaternion - Rotation quaternion
 * @returns Rotated point
 */
export function applyQuaternion(point: ECEFCoordinates, quaternion: Quaternion): ECEFCoordinates {
  const { x, y, z } = point;
  const { x: qx, y: qy, z: qz, w: qw } = quaternion;
  
  // Quaternion multiplication: q * p * q^-1
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
 * Create a complete transform from ECEF to local coordinates
 * 
 * @param config - Transform configuration
 * @returns Transform function
 */
export function createTransform(config: TransformConfig) {
  const { center, rotation, scale = 1 } = config;
  
  return (ecef: ECEFCoordinates): ECEFCoordinates => {
    // First translate to local coordinates
    let local = ecefToLocal(ecef, center);
    
    // Apply rotation if specified
    if (rotation) {
      local = applyQuaternion(local, rotation);
    }
    
    // Apply scale if specified
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
 * Calculate bounding box of ECEF coordinates
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