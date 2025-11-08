import React from "react";

export const HeaderDHXIII: React.FC = () => {
  const PALETTE = {
    blue: "#0C6CD4",
    cyan: "#00AEEF",
    cyan2: "#1CC7FF",
    orange: "#FF8A00",
    yellow: "#FFC447",
  };

  return (
    <header className="relative text-white overflow-hidden">
      {/* Gradient nền theo ảnh */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, ${PALETTE.blue} 0%, ${PALETTE.cyan} 55%, ${PALETTE.cyan2} 100%)`,
        }}
      />
      {/* Trống đồng chìm */}
      <BronzeDrumBG className="absolute inset-0 opacity-[0.10]" stroke="#ffffff" />

      {/* Sóng highlight mờ */}
      <div className="pointer-events-none absolute -top-10 left-0 w-full opacity-30">
        <svg viewBox="0 0 1440 120" className="w-full h-[60px]">
          <path
            d="M0,80 C240,140 480,20 720,60 C960,100 1200,40 1440,90 L1440,0 L0,0 Z"
            fill="url(#gradHeaderTop)"
          />
          <defs>
            <linearGradient id="gradHeaderTop" x1="0" x2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Banner không bị cắt */}
      <div className="relative container mx-auto px-4 py-5">
        <div className="rounded-2xl overflow-hidden ring-1 ring-white/25 bg-white/5 backdrop-blur-sm shadow-2xl">
          <img
            src="/4. Bandroll ĐH XIII-01.png"
            alt="Đại hội Hội Sinh viên Việt Nam XIII • HCMUS"
            className="w-full max-h-[420px] md:max-h-[480px] object-contain p-3"
          />
        </div>
      </div>

      {/* Ribbon cam–vàng dưới banner */}
      <div
        className="absolute inset-x-0 bottom-0 h-2"
        style={{ background: `linear-gradient(90deg, ${PALETTE.orange}, ${PALETTE.yellow})` }}
      />
      {/* Fade xuống section kế */}
      <div className="absolute inset-x-0 -bottom-6 h-14 bg-gradient-to-t from-white to-transparent" />
    </header>
  );
};

const BronzeDrumBG: React.FC<{ className?: string; stroke?: string }> = ({
  className = "",
  stroke = "#fff",
}) => (
  <svg className={className} viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
    <g fill="none" stroke={stroke} strokeOpacity="0.25">
      <circle cx="600" cy="300" r="260" strokeWidth="2" />
      <circle cx="600" cy="300" r="210" strokeWidth="1.5" />
      <circle cx="600" cy="300" r="160" strokeWidth="1.25" />
      <circle cx="600" cy="300" r="110" strokeWidth="1" />
      <circle cx="600" cy="300" r="70" strokeWidth="1" />
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={i}
          x1="600"
          y1="300"
          x2={600 + 70 * Math.cos((i * 45 * Math.PI) / 180)}
          y2={300 + 70 * Math.sin((i * 45 * Math.PI) / 180)}
          strokeWidth="1"
          strokeOpacity="0.22"
        />
      ))}
      {[
        [600, 40],
        [600, 560],
        [40, 300],
        [1160, 300],
        [200, 120],
        [1000, 120],
        [220, 500],
        [980, 500],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={stroke} opacity="0.18" />
      ))}
    </g>
  </svg>
);
