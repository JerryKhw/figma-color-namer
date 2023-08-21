import { PluginMessageType, UiMessageType } from "./enum";

export interface PluginMessage {
  type: PluginMessageType;
  data: any;
}

export interface UiMessage {
  type: UiMessageType;
  data: any;
}

export interface Preview {
  hex: string;
  name: string;
}

export interface PreviewUI {
  hex: string;
  localName: string | null;
  name: string;
  opacity: number;
  useGenerate: boolean;
}

export interface LocalStyle {
  id: string;
  name: string;
  color: {
    r: number;
    g: number;
    b: number;
  };
  opacity: number;
}

export interface GenerateOption {
  preview: PreviewUI[];
}

export interface LocalColor {
  hex: string;
  name: string;
  opacity: number;
}

export interface Color {
  hex: string;
  opacity: number;
}

export interface UseGenerate {
  hex: string;
  opacity: number;
  useGenerate: boolean;
}
