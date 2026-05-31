import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { DEFAULT_PANEL_LAB } from '@repo/panelLabSchema';

const DEF_DIR = DEFAULT_PANEL_LAB.lighting.directional;
const DEF_POINT_POS = [0, 3, 0];
const DEF_SPOT_POS = [0, 5, 0];
const DEF_SPOT_TARGET = [0, 0, 0];
const AXIS_HALF = 0.18;
/** Viewport helper: lamp sphere radius; target sphere is half (smaller “look-at” marker). */
const HELPER_SOURCE_RADIUS = 0.1;
const HELPER_TARGET_RADIUS = HELPER_SOURCE_RADIUS / 2;

function vec3(arr, fallback) {
  const a = Array.isArray(arr) ? arr : fallback;
  return [Number(a[0]) || 0, Number(a[1]) || 0, Number(a[2]) || 0];
}

function markerColor(seed, kind) {
  const base = kind === 'spot' ? 0.02 : kind === 'point' ? 0.28 : 0.5;
  const h = ((seed * 0.21 + base) % 1 + 1) % 1;
  return new THREE.Color().setHSL(h, 0.82, 0.52);
}

function wantsHelper(light) {
  return light && light.sceneHelper !== false;
}

/** Directional: overlay only when the lamp is on and Helper is checked (avoids stray line when all lights off). */
function wantsDirectionalHelper(dir) {
  return dir && dir.sceneHelper !== false && dir.enabled !== false;
}

function MarkerSphere({ position, color, radius = HELPER_SOURCE_RADIUS }) {
  return (
    <mesh position={position} renderOrder={10}>
      <sphereGeometry args={[radius, 20, 20]} />
      <meshBasicMaterial
        color={color}
        depthTest={false}
        depthWrite={false}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function RayLine({ from, to, color }) {
  const points = useMemo(() => [from, to].map((p) => new THREE.Vector3(...p)), [from, to]);
  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      depthTest={false}
      transparent
      opacity={0.85}
      renderOrder={9}
    />
  );
}

/** Short world axes through a point (omni light has no target). */
function PointAxesCross({ center, color }) {
  const [x, y, z] = center;
  const h = AXIS_HALF;
  return (
    <group>
      <RayLine from={[x - h, y, z]} to={[x + h, y, z]} color={color} />
      <RayLine from={[x, y - h, z]} to={[x, y + h, z]} color={color} />
      <RayLine from={[x, y, z - h]} to={[x, y, z + h]} color={color} />
    </group>
  );
}

/** Lab only (parent gates). Each light: On + hlp (sceneHelper); line = lamp position → target (dir/spot), axes = point. */
export function PanelLabLightHelpers({ lighting }) {
  const directional = lighting?.directional;
  const directionalLights = Array.isArray(lighting?.directionalLights) ? lighting.directionalLights : [];
  const pointLights = Array.isArray(lighting?.pointLights) ? lighting.pointLights : [];
  const spotLights = Array.isArray(lighting?.spotLights) ? lighting.spotLights : [];

  return (
    <group>
      {directional && wantsDirectionalHelper(directional) ? (
        <group key="dir-main">
          {(() => {
            const pos = vec3(directional.position, DEF_DIR.position);
            const tgt = vec3(directional.target, DEF_DIR.target);
            const c = markerColor(0, 'dir').getStyle();
            return (
              <>
                <MarkerSphere position={pos} color={c} />
                <MarkerSphere position={tgt} color={c} radius={HELPER_TARGET_RADIUS} />
                <RayLine from={pos} to={tgt} color={c} />
              </>
            );
          })()}
        </group>
      ) : null}

      {directionalLights.map((dl, i) => {
        if (!dl || !wantsDirectionalHelper(dl)) return null;
        const pos = vec3(dl.position, DEF_DIR.position);
        const tgt = vec3(dl.target, DEF_DIR.target);
        const c = markerColor(i + 1, 'dir').getStyle();
        return (
          <group key={`dir-extra-${i}`}>
            <MarkerSphere position={pos} color={c} />
            <MarkerSphere position={tgt} color={c} radius={HELPER_TARGET_RADIUS} />
            <RayLine from={pos} to={tgt} color={c} />
          </group>
        );
      })}

      {pointLights.map((pl, i) => {
        if (!pl || !wantsHelper(pl)) return null;
        const pos = vec3(pl.position, DEF_POINT_POS);
        const c = markerColor(i, 'point').getStyle();
        return (
          <group key={`point-helper-${i}`}>
            <MarkerSphere position={pos} color={c} />
            <PointAxesCross center={pos} color={c} />
          </group>
        );
      })}

      {spotLights.map((sl, i) => {
        if (!sl || !wantsHelper(sl)) return null;
        const pos = vec3(sl.position, DEF_SPOT_POS);
        const tgt = vec3(sl.target, DEF_SPOT_TARGET);
        const c = markerColor(i + 5, 'spot').getStyle();
        return (
          <group key={`spot-helper-${i}`}>
            <MarkerSphere position={pos} color={c} />
            <MarkerSphere position={tgt} color={c} radius={HELPER_TARGET_RADIUS} />
            <RayLine from={pos} to={tgt} color={c} />
          </group>
        );
      })}
    </group>
  );
}
