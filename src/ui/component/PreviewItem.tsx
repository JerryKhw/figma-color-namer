import React, { useCallback, useState } from "react";
import { PreviewUI } from "../../interface";
import chroma from "chroma-js";
import { Checkbox, Input } from "react-figma-plugin-ds";
import "react-figma-plugin-ds/figma-plugin-ds.css";

interface PreviewProps {
  preview: PreviewUI;
  index: number;
  onChange: (index: number, preview: PreviewUI) => {};
}

export const PreviewItem = ({ preview, index, onChange }: PreviewProps) => {
  const rgb = chroma("#" + preview.hex).rgb();

  return (
    <div
      className="preview-wrap"
      style={{
        background: `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${preview.opacity})`,
      }}
    >
      <div className="column flex">
        <span>#{preview.hex.toUpperCase()}</span>
        {preview.useGenerate ? (
          <div
            style={{
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span>{preview.name}</span>
          </div>
        ) : (
          <Input
            placeholder="Color Name"
            defaultValue={preview.localName}
            onChange={(value) =>
              onChange(index, { ...preview, localName: value })
            }
          />
        )}
      </div>
      <div>
        <Checkbox
          label={""}
          type="switch"
          defaultValue={preview.useGenerate}
          onChange={(value) =>
            onChange(index, { ...preview, useGenerate: value })
          }
        />
      </div>
    </div>
  );
};
