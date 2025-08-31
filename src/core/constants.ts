/**
 * WGS84 ellipsoid parameters
 */
export const WGS84 = {
  /** Semi-major axis (equatorial radius) in meters */
  a: 6378137.0,
  /** Flattening */
  f: 1 / 298.257223563,
  /** Semi-minor axis (polar radius) in meters */
  b: 6378137.0 * (1 - 1 / 298.257223563),
  /** Square of first eccentricity */
  e2: 1 - Math.pow(1 - 1 / 298.257223563, 2),
} as const;

/**
 * Mathematical constants
 */
export const MATH = {
  /** Conversion factor from degrees to radians */
  DEG_TO_RAD: Math.PI / 180,
  /** Conversion factor from radians to degrees */
  RAD_TO_DEG: 180 / Math.PI,
} as const;