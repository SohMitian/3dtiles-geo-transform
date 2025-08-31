// Minimal type definitions to avoid Three.js type conflicts
interface GLTFScene {
  position: {
    set: (...args: number[]) => void;
  };
  userData: any;
}

interface GLTFResult {
  scene: GLTFScene;
}

interface GLTFParserLike {
  json?: any;
}

interface GLTFLoaderPluginLike {
  name: string;
  afterRoot?: (result: GLTFResult) => null | Promise<null>;
}

/**
 * CESIUM_RTC extension data structure
 */
export interface CesiumRTCExtension {
  center: [number, number, number];
}

/**
 * GLTFLoader plugin to handle CESIUM_RTC extension
 * 
 * CESIUM_RTC (Relative To Center) extension is used in 3D Tiles to define
 * a local coordinate system relative to a center point in ECEF coordinates.
 * This helps avoid precision issues when dealing with large coordinate values.
 * 
 * @example
 * ```typescript
 * import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
 * import { CesiumRTCPlugin } from '3dtiles-geo-transform';
 * 
 * const loader = new GLTFLoader();
 * loader.register(parser => new CesiumRTCPlugin(parser));
 * ```
 */
export class CesiumRTCPlugin implements GLTFLoaderPluginLike {
  public readonly name = 'CESIUM_RTC';
  private parser: GLTFParserLike;
  private centerCallback?: (center: [number, number, number]) => void;

  /**
   * Create a new CesiumRTCPlugin instance
   * 
   * @param parser - GLTFParser instance from GLTFLoader
   * @param onCenterFound - Optional callback when RTC center is found
   */
  constructor(parser: any, onCenterFound?: (center: [number, number, number]) => void) {
    this.parser = parser as GLTFParserLike;
    this.centerCallback = onCenterFound;
  }

  /**
   * Called after the root scene is loaded
   * Applies RTC center offset to scene position
   * 
   * @param result - Loaded GLTF result
   * @returns null (required by GLTFLoaderPlugin interface)
   */
  afterRoot(result: any): null {
    const extensions = (this.parser as any).json?.extensions;
    
    if (extensions?.CESIUM_RTC?.center != null) {
      const center = extensions.CESIUM_RTC.center as [number, number, number];
      
      // Apply RTC center as scene position
      result.scene.position.set(...center);
      
      // Notify if callback is provided
      if (this.centerCallback) {
        this.centerCallback(center);
      }
      
      // Store center in userData for later reference
      result.scene.userData.cesiumRTC = {
        center: center
      };
    }
    
    return null;
  }

  /**
   * Get RTC center from parsed GLTF data
   * 
   * @returns RTC center coordinates or null if not found
   */
  getRTCCenter(): [number, number, number] | null {
    const extensions = (this.parser as any).json?.extensions;
    
    if (extensions?.CESIUM_RTC?.center != null) {
      return extensions.CESIUM_RTC.center as [number, number, number];
    }
    
    return null;
  }
}

/**
 * Factory function to create CesiumRTCPlugin with configuration
 * 
 * @param config - Plugin configuration
 * @returns Plugin factory function for GLTFLoader
 */
export function createCesiumRTCPlugin(config?: {
  onCenterFound?: (center: [number, number, number]) => void;
}) {
  return (parser: any) => new CesiumRTCPlugin(parser, config?.onCenterFound);
}