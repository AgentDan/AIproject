/**
 * Упрощённый превью сцены (заглушка под three.js в целевой архитектуре).
 * @param {{ previewObject?: object, previewColor?: string, showRedCircle?: boolean }} props
 */
export default function Preview3D({ previewObject, previewColor, showRedCircle = false }) {
  const previewX = (previewObject?.transform?.position?.x || 0) * 90;
  const previewY = -(previewObject?.transform?.position?.y || 0) * 90;

  return (
    <section className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.22),_rgba(15,23,42,0.26)_34%,_rgba(2,6,23,1)_78%)]">
      {showRedCircle ? (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-red-500 bg-red-500/25 shadow-[0_0_48px_rgba(239,68,68,0.45)]"
          aria-hidden="true"
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="relative h-[min(70vw,620px)] w-[min(70vw,620px)]">
        <div className="absolute inset-x-12 bottom-20 h-24 rounded-[50%] bg-cyan-400/10 blur-2xl" />
        <div
          className="absolute left-[25%] top-[22%] h-[34%] w-[34%] rotate-12 rounded-[2rem] border border-cyan-200/45 bg-cyan-300/15 shadow-2xl shadow-cyan-500/25 transition-transform duration-500"
          style={{
            backgroundColor: previewColor || undefined,
            transform: `translate3d(${previewX}px, ${previewY}px, 0) rotate(12deg)`
          }}
        />
        <div className="absolute right-[20%] top-[34%] h-[27%] w-[27%] -rotate-6 rounded-[1.5rem] border border-violet-200/40 bg-violet-300/15 shadow-2xl shadow-violet-500/20" />
        <div className="absolute bottom-[22%] left-1/2 h-[18%] w-[58%] -translate-x-1/2 rounded-[1.25rem] border border-emerald-200/30 bg-emerald-300/10" />
      </div>
    </section>
  );
}
