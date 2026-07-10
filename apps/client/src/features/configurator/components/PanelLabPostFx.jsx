import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';

export function PanelLabPostFx({ postprocessing }) {
  if (!postprocessing?.enabled) return null;

  const bloomOn = postprocessing.bloom?.enabled;
  const vignetteOn = postprocessing.vignette?.enabled;

  if (!bloomOn && !vignetteOn) return null;

  return (
    <EffectComposer enableNormalPass={false}>
      {bloomOn ? (
        <Bloom
          intensity={postprocessing.bloom.strength}
          luminanceThreshold={postprocessing.bloom.threshold}
          radius={postprocessing.bloom.radius}
          mipmapBlur
        />
      ) : null}
      {vignetteOn ? (
        <Vignette offset={postprocessing.vignette.offset} darkness={postprocessing.vignette.darkness} />
      ) : null}
    </EffectComposer>
  );
}
