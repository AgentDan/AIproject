import { PanelLabIntro } from './PanelLabIntro.jsx';
import { PanelLabKeyBadge } from './PanelLabKeyBadge.jsx';
import { PanelLabCollapsibleSection } from './PanelLabCollapsibleSection.jsx';
import { PanelLabEnvironmentSection } from './PanelLabEnvironmentSection.jsx';
import {
  PanelLabAmbientLightingSection,
  PanelLabHemisphereLightingSection,
  PanelLabDirectionalLightingSection,
  PanelLabPointLightsSection,
  PanelLabSpotLightsSection,
  PanelLabShadowsSection,
} from './PanelLabLightingSection.jsx';
import { PanelLabGroundSection } from './PanelLabGroundSection.jsx';
import { PanelLabRendererSection } from './PanelLabRendererSection.jsx';
import { PanelLabPostSection } from './PanelLabPostSection.jsx';
import { PanelLabOrbitSection } from './PanelLabOrbitSection.jsx';
import { PanelLabCameraSection } from './PanelLabCameraSection.jsx';
import { PanelLabAnnotationsSection } from './PanelLabAnnotationsSection.jsx';

export function PanelLabPanelBody({
  labKey,
  panelLab,
  patchEnvironment,
  patchLighting,
  patchGround,
  patchRenderer,
  patchPostprocessing,
  patchCamera,
  patchControls,
  patchAnnotations,
  onResetToDefaults,
}) {
  return (
    <div id="panel-lab-panel-body" className="flex min-w-0 flex-col gap-3 text-xs">
      <PanelLabIntro />
      <PanelLabKeyBadge labKey={labKey} onResetClick={onResetToDefaults} />

      <div className="flex flex-col gap-2">
        <PanelLabCollapsibleSection title="Environment" defaultOpen={false}>
          <PanelLabEnvironmentSection environment={panelLab.environment} patchEnvironment={patchEnvironment} />
        </PanelLabCollapsibleSection>
        <PanelLabCollapsibleSection title="Lighting Ambient" defaultOpen={false}>
          <PanelLabAmbientLightingSection lighting={panelLab.lighting} patchLighting={patchLighting} />
        </PanelLabCollapsibleSection>
        <PanelLabCollapsibleSection title="Lighting Hemisphere" defaultOpen={false}>
          <PanelLabHemisphereLightingSection lighting={panelLab.lighting} patchLighting={patchLighting} />
        </PanelLabCollapsibleSection>
        <PanelLabCollapsibleSection title="Lighting Directional" defaultOpen={false}>
          <PanelLabDirectionalLightingSection
            lighting={panelLab.lighting}
            patchLighting={patchLighting}
          />
        </PanelLabCollapsibleSection>
        <PanelLabCollapsibleSection title="Lighting Point" defaultOpen={false}>
          <PanelLabPointLightsSection lighting={panelLab.lighting} patchLighting={patchLighting} />
        </PanelLabCollapsibleSection>
        <PanelLabCollapsibleSection title="Lighting Spot" defaultOpen={false}>
          <PanelLabSpotLightsSection lighting={panelLab.lighting} patchLighting={patchLighting} />
        </PanelLabCollapsibleSection>
        <PanelLabCollapsibleSection title="Shadows" defaultOpen={false}>
          <PanelLabShadowsSection
            lighting={panelLab.lighting}
            patchLighting={patchLighting}
            renderer={panelLab.renderer}
            patchRenderer={patchRenderer}
          />
        </PanelLabCollapsibleSection>
        <PanelLabCollapsibleSection title="Ground" defaultOpen={false}>
          <PanelLabGroundSection ground={panelLab.ground} patchGround={patchGround} />
        </PanelLabCollapsibleSection>
        <PanelLabCollapsibleSection title="Renderer" defaultOpen={false}>
          <PanelLabRendererSection renderer={panelLab.renderer} patchRenderer={patchRenderer} />
        </PanelLabCollapsibleSection>
        <PanelLabCollapsibleSection title="Postprocessing" defaultOpen={false}>
          <PanelLabPostSection postprocessing={panelLab.postprocessing} patchPostprocessing={patchPostprocessing} />
        </PanelLabCollapsibleSection>
        <PanelLabCollapsibleSection title="Camera" defaultOpen={false}>
          <PanelLabCameraSection camera={panelLab.camera} patchCamera={patchCamera} />
        </PanelLabCollapsibleSection>
        <PanelLabCollapsibleSection title="Controls (Orbit)" defaultOpen={false}>
          <PanelLabOrbitSection controls={panelLab.controls} patchControls={patchControls} />
        </PanelLabCollapsibleSection>
        <PanelLabCollapsibleSection title="Annotations" defaultOpen={false}>
          <PanelLabAnnotationsSection
            annotations={panelLab.annotations}
            patchAnnotations={patchAnnotations}
          />
        </PanelLabCollapsibleSection>
      </div>
    </div>
  );
}
