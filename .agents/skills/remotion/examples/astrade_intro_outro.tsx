import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
  Audio,
  staticFile,
} from 'remotion';

/**
 * Plantilla Remotion: Intro Cyber-Institucional AsTrade (5 segundos / 150 frames a 30fps)
 */
export const AsTradeIntro: React.FC<{
  tutorialNumber?: string;
  tutorialTitle?: string;
  subtitle?: string;
}> = ({
  tutorialNumber = "Tutorial #1",
  tutorialTitle = "Creación y Configuración de Cuentas de Trading",
  subtitle = "Domina la gestión de capital y reglas de fondeo",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Entrada elástica del isotipo (A geométrica neón)
  const logoScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 120 },
  });

  const logoGlow = interpolate(frame, [10, 35, 60], [0, 45, 25], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 2. Revelación de la marca AsTrade y Badge
  const brandOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const brandTranslateY = interpolate(frame, [25, 45], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 3. Entrada del Título del Tutorial
  const titleOpacity = interpolate(frame, [50, 75], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleScale = spring({
    frame: frame - 50,
    fps,
    config: { damping: 14, mass: 0.5, stiffness: 100 },
  });

  // 4. Salida hacia la aplicación
  const fadeOut = interpolate(frame, [135, 150], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center bg-[#0b0f19] text-white relative overflow-hidden font-sans select-none"
      style={{ opacity: fadeOut }}
    >
      {/* Resplandor radial de fondo */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(11,15,25,0) 70%)',
          transform: `scale(${interpolate(frame, [0, 150], [0.8, 1.2])})`,
        }}
      />

      {/* Isotipo + Marca */}
      <div className="flex items-center gap-5 mb-8 z-10">
        {/* Isotipo 'A' Esmeralda */}
        <div
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-2xl"
          style={{
            transform: `scale(${logoScale})`,
            boxShadow: `0 0 ${logoGlow}px rgba(16, 185, 129, 0.7)`,
          }}
        >
          <span className="text-4xl font-black text-gray-950 tracking-tighter">A</span>
        </div>

        {/* Nombre AsTrade */}
        <div
          style={{
            opacity: brandOpacity,
            transform: `translateY(${brandTranslateY}px)`,
          }}
        >
          <div className="text-5xl font-black tracking-tight text-white flex items-center gap-2">
            As<span className="text-emerald-400">Trade</span>
          </div>
          <div className="text-xs uppercase tracking-[0.3em] font-extrabold text-emerald-500/80 mt-1">
            Trading Journal Pro
          </div>
        </div>
      </div>

      {/* Título de la Lección */}
      <div
        className="text-center z-10 max-w-3xl px-6"
        style={{
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-sm font-black uppercase tracking-widest mb-3">
          {tutorialNumber}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-2 drop-shadow-lg">
          {tutorialTitle}
        </h1>
        <p className="text-base text-gray-400 font-medium">{subtitle}</p>
      </div>
    </div>
  );
};

/**
 * Plantilla Remotion: Outro Cyber-Institucional AsTrade (6 segundos / 180 frames a 30fps)
 */
export const AsTradeOutro: React.FC<{
  brandUrl?: string;
  callToAction?: string;
}> = ({
  brandUrl = "astradehub.com",
  callToAction = "Comienza hoy tu prueba gratuita de 7 días",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 100 },
  });

  const urlOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0b0f19] text-white relative overflow-hidden font-sans select-none">
      {/* Halo esmeralda de fondo */}
      <div
        className="absolute w-[900px] h-[900px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(11,15,25,0) 75%)',
        }}
      />

      <div
        className="flex flex-col items-center text-center z-10 max-w-2xl px-6"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Isotipo */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-2xl mb-6 shadow-emerald-500/40">
          <span className="text-5xl font-black text-gray-950">A</span>
        </div>

        <h2 className="text-5xl font-black tracking-tight text-white mb-3">
          As<span className="text-emerald-400">Trade</span>
        </h2>
        <p className="text-lg text-gray-300 font-semibold mb-6">{callToAction}</p>

        {/* Badge de URL Oficial */}
        <div
          className="px-8 py-3.5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.35)] flex items-center gap-3"
          style={{ opacity: urlOpacity }}
        >
          <span className="text-emerald-400 text-xl">🌐</span>
          <span className="text-2xl font-black text-white tracking-wide font-mono">
            {brandUrl}
          </span>
        </div>

        <p className="text-xs text-gray-500 uppercase tracking-widest mt-8 font-bold">
          La bitácora definitiva para traders de fondeo y cuentas reales
        </p>
      </div>
    </div>
  );
};
