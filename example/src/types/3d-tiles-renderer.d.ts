declare module '3d-tiles-renderer' {
  import { Camera, Group, WebGLRenderer, Box3, Sphere } from 'three';
  
  export class TilesRenderer {
    constructor(url: string);
    
    group: Group;
    manager: {
      addHandler: (regex: RegExp, loader: any) => void;
    };
    errorTarget: number;
    errorThreshold: number;
    maxDepth: number;
    
    setCamera(camera: Camera): void;
    setResolutionFromRenderer(camera: Camera, renderer: WebGLRenderer): void;
    update(): void;
    dispose(): void;
    getBoundingBox(box: Box3): boolean;
    getBoundingSphere(sphere: Sphere): boolean;
    addEventListener(event: string, callback: (event?: any) => void): void;
    removeEventListener(event: string, callback: (event?: any) => void): void;
  }
}