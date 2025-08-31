// Three.jsの型競合を避けるための最小限の型定義
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
 * CESIUM_RTC拡張データ構造
 */
export interface CesiumRTCExtension {
  center: [number, number, number];
}

/**
 * CESIUM_RTC拡張を処理するGLTFLoaderプラグイン
 * 
 * CESIUM_RTC（Relative To Center）拡張は、3D TilesでECEF座標の中心点に
 * 対するローカル座標系を定義するために使用されます。
 * これにより、大きな座標値を扱う際の精度の問題を回避できます。
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
   * 新しいCesiumRTCPluginインスタンスを作成
   * 
   * @param parser - GLTFLoaderからのGLTFParserインスタンス
   * @param onCenterFound - RTC中心が見つかったときのオプションコールバック
   */
  constructor(parser: any, onCenterFound?: (center: [number, number, number]) => void) {
    this.parser = parser as GLTFParserLike;
    this.centerCallback = onCenterFound;
  }

  /**
   * ルートシーンがロードされた後に呼ばれる
   * RTC中心オフセットをシーン位置に適用
   * 
   * @param result - ロードされたGLTF結果
   * @returns null（GLTFLoaderPluginインターフェースで必須）
   */
  afterRoot(result: any): null {
    const extensions = (this.parser as any).json?.extensions;
    
    if (extensions?.CESIUM_RTC?.center != null) {
      const center = extensions.CESIUM_RTC.center as [number, number, number];
      
      // RTC中心をシーン位置として適用
      result.scene.position.set(...center);
      
      // コールバックが提供されていれば通知
      if (this.centerCallback) {
        this.centerCallback(center);
      }
      
      // 後で参照できるようにuserDataに中心を保存
      result.scene.userData.cesiumRTC = {
        center: center
      };
    }
    
    return null;
  }

  /**
   * パースされたGLTFデータからRTC中心を取得
   * 
   * @returns RTC中心座標または見つからない場合はnull
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
 * 設定付きでCesiumRTCPluginを作成するファクトリ関数
 * 
 * @param config - プラグイン設定
 * @returns GLTFLoader用のプラグインファクトリ関数
 */
export function createCesiumRTCPlugin(config?: {
  onCenterFound?: (center: [number, number, number]) => void;
}) {
  return (parser: any) => new CesiumRTCPlugin(parser, config?.onCenterFound);
}