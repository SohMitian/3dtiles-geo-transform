import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
  ReactNode,
  useRef,
  useEffect
} from 'react';
import * as THREE from 'three';

interface PlateauTilesetTransformContextType {
  setCenter: (center: THREE.Vector3) => void;
}

export const PlateauTilesetTransformContext = createContext<PlateauTilesetTransformContextType>({
  setCenter: () => {}
});

interface PlateauTilesetTransformProps {
  children: ReactNode;
}

interface TransformState {
  offset?: THREE.Vector3;
  rotation?: THREE.Quaternion;
}

/**
 * React component for transforming 3D Tiles
 * This component provides context and transformation group for 3D Tiles
 */
export const PlateauTilesetTransform: React.FC<PlateauTilesetTransformProps> = ({ children }) => {
  const [{ offset, rotation }, setState] = useState<TransformState>({});
  const groupRef = useRef<THREE.Group>(new THREE.Group());

  const setCenter = useCallback((center: THREE.Vector3) => {
    const direction = center.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const rotation = new THREE.Quaternion();
    rotation.setFromUnitVectors(direction, up);
    
    setState({
      offset: new THREE.Vector3(0, -center.length(), 0),
      rotation
    });
  }, []);

  useEffect(() => {
    if (offset && rotation) {
      groupRef.current.position.copy(offset);
      groupRef.current.quaternion.copy(rotation);
    }
  }, [offset, rotation]);

  const context = useMemo(() => ({ setCenter }), [setCenter]);

  // Use React.createElement to avoid JSX type issues
  return React.createElement(
    PlateauTilesetTransformContext.Provider,
    { value: context },
    React.createElement(
      'primitive' as any,
      { object: groupRef.current },
      children
    )
  );
};