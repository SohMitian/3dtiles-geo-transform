import * as THREE from 'three';
import { ecefToGeodetic, ECEFCoordinates } from '../core/ecef';
import { createECEFToLocalRotation, ecefToLocal } from '../core/transform';

/**
 * 3D Tiles transformation options
 */
export interface TilesetTransformOptions {
  /** Center point in ECEF coordinates */
  center?: ECEFCoordinates;
  /** Whether to auto-rotate to align with local up direction */
  autoRotate?: boolean;
  /** Scale factor for tiles */
  scale?: number;
  /** Offset to apply after transformation */
  offset?: THREE.Vector3;
}

/**
 * Three.js Group for 3D Tiles transformation from ECEF to local coordinates
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
   * Set the center point for transformation
   * 
   * @param center - Center point in ECEF coordinates
   */
  setCenter(center: ECEFCoordinates): void {
    this._center = center;
    
    // Calculate offset (negative center length along Y-axis)
    const centerVector = new THREE.Vector3(center.x, center.y, center.z);
    const offset = new THREE.Vector3(0, -centerVector.length(), 0);
    
    // Apply rotation if autoRotate is enabled
    if (this.options.autoRotate) {
      const rotation = createECEFToLocalRotation(center);
      this._rotation = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
      this.quaternion.copy(this._rotation);
    }
    
    // Apply offset
    this.position.copy(this.options.offset || offset);
    
    // Apply scale if specified
    if (this.options.scale && this.options.scale !== 1) {
      this.scale.setScalar(this.options.scale);
    }
  }

  /**
   * Get the current center point
   */
  getCenter(): ECEFCoordinates | undefined {
    return this._center;
  }

  /**
   * Get the geodetic coordinates of the center point
   */
  getCenterGeodetic(): ReturnType<typeof ecefToGeodetic> | undefined {
    if (!this._center) return undefined;
    return ecefToGeodetic(this._center.x, this._center.y, this._center.z);
  }

  /**
   * Transform a point from ECEF to local coordinates
   * 
   * @param ecef - Point in ECEF coordinates
   * @returns Point in local coordinates
   */
  transformPoint(ecef: ECEFCoordinates): THREE.Vector3 {
    if (!this._center) {
      throw new Error('Center must be set before transforming points');
    }
    
    // Transform to local coordinates relative to center
    const local = ecefToLocal(ecef, this._center);
    const localVector = new THREE.Vector3(local.x, local.y, local.z);
    
    // Apply rotation if it exists
    if (this._rotation) {
      localVector.applyQuaternion(this._rotation);
    }
    
    // Apply scale
    if (this.options.scale) {
      localVector.multiplyScalar(this.options.scale);
    }
    
    return localVector;
  }

  /**
   * Update transformation based on TilesRenderer instance
   * Automatically extracts center from tileset
   * 
   * @param tilesRenderer - TilesRenderer instance
   */
  updateFromTilesRenderer(tilesRenderer: any): void {
    // Attempt to get center from tileset
    if (tilesRenderer.root && tilesRenderer.root.boundingVolume) {
      const bv = tilesRenderer.root.boundingVolume;
      
      // If center property exists (for bounding sphere)
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
 * Create transformation matrix from ECEF to local
 * 
 * @param center - Center point in ECEF coordinates
 * @param options - Transformation options
 * @returns Transformation matrix
 */
export function createTransformMatrix(
  center: ECEFCoordinates,
  options: { autoRotate?: boolean; scale?: number } = {}
): THREE.Matrix4 {
  const matrix = new THREE.Matrix4();
  
  // Create translation to move center to origin
  const translation = new THREE.Matrix4().makeTranslation(
    -center.x,
    -center.y,
    -center.z
  );
  
  matrix.multiply(translation);
  
  // Apply rotation if needed
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