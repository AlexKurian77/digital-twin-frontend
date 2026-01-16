"use client";

import { Handle, Position } from "@xyflow/react";

export type NodeData = {
  label: string;
  value: number;
  enabled: boolean;
  type: "sector" | "intermediate" | "output";
  onChange?: (value: number) => void;
};

export default function CausalNode({ data }: { data: NodeData }) {
  const isSector = data.type === "sector";
  const isOutput = data.type === "output";
  const isEnabled = data.enabled !== false; // Default to true if undefined

  return (
    <div
      className={`relative transition-all duration-300 group
        ${!isEnabled ? "opacity-40 grayscale blur-[1px]" : "opacity-100"}
      `}
    >
      {/* Glow Effect Layer */}
      <div
        className={`absolute -inset-0.5 rounded-2xl blur opacity-30 transition-opacity duration-300
        ${isEnabled ? (isOutput ? "bg-secondary" : "bg-pink-500") : "bg-transparent"}
        group-hover:opacity-60
        `}
      />

      {/* Main Card Content */}
      <div
        className={`relative z-10 glass-panel overflow-hidden
          ${isSector ? "p-4 min-w-[160px]" : "px-4 py-2 min-w-[120px]"}
          ${isOutput ? "border-secondary/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]" : ""}
          ${!isEnabled ? "!border-white/5 !bg-black/40" : ""}
        `}
      >
        {/* Header / Label */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className={`font-bold tracking-tight text-white
                ${isSector ? "text-sm" : "text-xs"}
                ${isOutput ? "text-lg text-secondary" : ""}
            `}>
            {data.label}
          </span>
          {isSector && (
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]
                    ${isEnabled ? "bg-green-400 text-green-400" : "bg-red-500 text-red-500"}
                `} />
          )}
        </div>

        {/* Value Slider (Sectors only) */}
        {isSector && (
          <div className="w-full">
            <div className="flex justify-between text-[10px] text-white/50 mb-1.5 font-mono uppercase tracking-wider">
              <span>Activity</span>
              <span className="text-white">{Math.round(data.value)}%</span>
            </div>

            <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              {/* Progress Bar */}
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
                style={{ width: `${data.value}%` }}
              />

              {/* Interactable Input overlaid */}
              <input
                type="range"
                min="0"
                max="100"
                value={data.value}
                disabled={!isEnabled}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                onChange={(e) => {
                  data.onChange?.(Number(e.target.value));
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>

      {/* Handles - Custom Styled */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-black !border-2 !border-secondary shadow-[0_0_10px_#00f0ff]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-black !border-2 !border-pink-500 shadow-[0_0_10px_#d90282]"
      />
    </div>
  );
}
