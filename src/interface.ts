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
  name: string;
  opacity: number;
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

export interface Color {
  hex: string;
  opacity: number;
}
