import React from "react";
import type { BMIResult } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface BMIGaugeProps {
  bmi: BMIResult;
}

export default function BMIGauge({ bmi }: BMIGaugeProps) {
  const { t } = useLanguage();

  // SVG arc gauge: range 10–40 BMI
  const min = 10, max = 40;
  const clampedBMI = Math.min(Math.max(bmi.value, min), max);
  const pct = (clampedBMI - min) / (max - min);

  // Arc parameters
  const cx = 100, cy = 85, r = 70;
  const startAngle = -180; // degrees
  const totalAngle = 180;
  const angle = startAngle + pct * totalAngle;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const needleX = cx + r * Math.cos(toRad(angle));
  const needleY = cy + r * Math.sin(toRad(angle));

  // Segments: underweight 10-18.5, normal 18.5-23, overweight 23-25, obese1 25-30, obese2 30-40
  const segments = [
    { from: 10, to: 18.5, color: "#3B82F6" },
    { from: 18.5, to: 23, color: "#22c55e" },
    { from: 23, to: 25, color: "#F59E0B" },
    { from: 25, to: 30, color: "#EF4444" },
    { from: 30, to: 40, color: "#991B1B" },
  ];

  function arcPath(fromVal: number, toVal: number) {
    const a1 = startAngle + ((fromVal - min) / (max - min)) * totalAngle;
    const a2 = startAngle + ((toVal - min) / (max - min)) * totalAngle;
    const x1 = cx + r * Math.cos(toRad(a1));
    const y1 = cy + r * Math.sin(toRad(a1));
    const x2 = cx + r * Math.cos(toRad(a2));
    const y2 = cy + r * Math.sin(toRad(a2));
    const largeArc = a2 - a1 > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  const categoryLabels: Record<string, string> = {
    underweight: t("underweight"),
    normal: t("normal"),
    overweight: t("overweight"),
    obese1: t("obese1"),
    obese2: t("obese2"),
  };

  return (
    <div className="bmi-gauge flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-full max-w-[220px]">
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Colored segments */}
        {segments.map((seg) => (
          <path
            key={seg.from}
            d={arcPath(seg.from, seg.to)}
            fill="none"
            stroke={seg.color}
            strokeWidth="14"
            strokeLinecap="butt"
          />
        ))}
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="var(--foreground)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="5" fill="var(--foreground)" />
        {/* BMI value */}
        <text x={cx} y={cy + 22} textAnchor="middle" fontSize="20" fontWeight="800" fontFamily="Nunito, sans-serif" fill="var(--foreground)">
          {bmi.value}
        </text>
      </svg>
      <div className="mt-1 px-3 py-1 rounded-full text-xs font-bold" style={{ background: bmi.color + "20", color: bmi.color }}>
        {categoryLabels[bmi.category]}
      </div>
    </div>
  );
}
