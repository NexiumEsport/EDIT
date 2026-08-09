"use client";

import { useState } from "react";
import { updateUserColor } from "@/lib/actions/settings";

const PALETTE = [
  "#F97066", // rouge/rose
  "#C026D3", // violet
  "#4A5AE8", // indigo (défaut)
  "#2FAE79", // vert
  "#FF8F66", // corail
  "#0EA5E9", // bleu ciel
];

export default function ColorPicker({ currentColor }: { currentColor: string }) {
  const [selected, setSelected] = useState(currentColor);
  const [saving, setSaving] = useState(false);

  async function handleSelect(color: string) {
    setSelected(color);
    setSaving(true);
    await updateUserColor(color);
    setSaving(false);
  }

  return (
    <div>
      <div className="flex gap-2">
        {PALETTE.map((color) => (
          <button
            key={color}
            onClick={() => handleSelect(color)}
            className="w-8 h-8 rounded-full border-2 transition"
            style={{
              background: color,
              borderColor: selected === color ? "#000" : "transparent",
            }}
            aria-label={`Choisir ${color}`}
          />
        ))}
      </div>
      {saving && <p className="text-xs text-gray-400 mt-1">Enregistrement...</p>}
    </div>
  );
}