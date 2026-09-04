import React from "react";

interface NutrientProgressProps {
  label: string;
  value: number;
  rdi: number;
  unit: string;
  color?: string;
}

export default function NutrientProgress({ label, value, rdi, unit, color = "var(--primary)" }: NutrientProgressProps) {
  const pct = rdi > 0 ? Math.min((value / rdi) * 100, 100) : 0;
  const over = rdi > 0 && value > rdi;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium" style={{ color: "var(--foreground)" }}>{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-semibold" style={{ color: "var(--foreground)" }}>
            {value >= 10 ? Math.round(value * 10) / 10 : Math.round(value * 100) / 100} {unit}
          </span>
          {rdi > 0 && (
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              / {rdi} {unit}
            </span>
          )}
        </div>
      </div>
      <div className="nutrient-bar">
        <div
          className="nutrient-bar-fill"
          style={{ width: `${pct}%`, background: over ? "#EF4444" : color }}
        />
      </div>
      {rdi > 0 && (
        <div className="text-right">
          <span className="text-xs font-mono" style={{ color: over ? "#EF4444" : "var(--muted-foreground)" }}>
            {Math.round(pct)}% AKG
          </span>
        </div>
      )}
    </div>
  );
}
