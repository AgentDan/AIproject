import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/** Matches light-helper marker scale in PanelLabLightHelpers. */
const CAMERA_MARKER_RADIUS = 0.1;

/** Lab viewport: red sphere = actual camera world position (follows orbit). */
export function PanelLabCameraOrbitHelpers() {
  const { camera } = useThree();
  const camMarkerRef = useRef(null);

  useFrame(() => {
    if (camMarkerRef.current && camera) {
      camMarkerRef.current.position.copy(camera.position);
    }
  });

  return (
    <mesh ref={camMarkerRef} renderOrder={11}>
      <sphereGeometry args={[CAMERA_MARKER_RADIUS, 20, 20]} />
      <meshBasicMaterial
        color="#ff2222"
        depthTest={false}
        depthWrite={false}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}
