import { useCallback, useEffect, useState } from 'react';
import { Billboard, Html, Text } from '@react-three/drei';
import ReactMarkdown from 'react-markdown';

function AnnotationMarker({ item, open, onToggle }) {
  const [x, y, z] = Array.isArray(item.position) ? item.position.map((n) => Number(n) || 0) : [0, 0, 0];
  const md = typeof item.text === 'string' ? item.text.trim() : '';
  const body = md || '_Empty — add Markdown in Panel Lab._';

  const handlePointerDown = useCallback(
    (e) => {
      e.stopPropagation();
      onToggle(item.id);
    },
    [item.id, onToggle],
  );

  return (
    <group position={[x, y, z]}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          fontSize={0.22}
          color="#0d47a1"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#ffffff"
          depthOffset={-1}
          onPointerDown={handlePointerDown}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          i
        </Text>
      </Billboard>
      {open ? (
        <Html
          position={[0, 0.38, 0]}
          center
          distanceFactor={6}
          style={{ pointerEvents: 'auto' }}
          zIndexRange={[16777271, 16777272]}
        >
          <div
            className="max-w-[min(20rem,72vw)] rounded-lg border border-slate-600/80 bg-white/95 px-3 py-2 text-left text-slate-900 shadow-xl"
            onPointerDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={typeof item.label === 'string' && item.label ? item.label : 'Annotation'}
          >
            {typeof item.label === 'string' && item.label ? (
              <div className="mb-1 border-b border-slate-200 pb-1 text-[11px] font-semibold text-slate-800">
                {item.label}
              </div>
            ) : null}
            <div className="annotation-md max-h-[40vh] overflow-y-auto text-[11px] leading-snug [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-0.5 [&_p]:my-1 [&_strong]:font-semibold [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4">
              <ReactMarkdown>{body}</ReactMarkdown>
            </div>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

export function ConfiguratorAnnotations({ annotations }) {
  const [openId, setOpenId] = useState(null);

  const onToggle = useCallback((id) => {
    setOpenId((cur) => (cur === id ? null : id));
  }, []);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openId]);

  if (!annotations || annotations.enabled !== true) return null;
  const items = Array.isArray(annotations.items) ? annotations.items : [];
  const visible = items.filter((it) => it && it.visible !== false);

  return (
    <group>
      {visible.map((item) => (
        <AnnotationMarker key={item.id} item={item} open={openId === item.id} onToggle={onToggle} />
      ))}
    </group>
  );
}
