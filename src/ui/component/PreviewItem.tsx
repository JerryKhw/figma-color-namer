import React from "react";
import { PreviewUI } from "../../interface";
import chroma from "chroma-js";

interface PreviewProps {
  preview: PreviewUI;
}

export const PreviewItem = ({ preview }: PreviewProps) => {
  const rgb = chroma("#" + preview.hex).rgb();

  return (
    <div
      className="preview-wrap"
      style={{
        background: `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${preview.opacity})`,
      }}
    >
      <span>#{preview.hex.toUpperCase()}</span>
      <span>{preview.name}</span>
    </div>
  );
};
