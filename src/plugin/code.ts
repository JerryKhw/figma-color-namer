import { PluginMessageType, UiMessageType } from "../enum";
import {
  UiMessage,
  GenerateOption,
  Color,
  LocalStyle,
  PreviewUI,
  LocalColor,
  UseGenerate,
} from "../interface";
import chroma, { hex } from "chroma-js";
import { DataKey, getData, setData } from "./data";

const sleep = (ms: number) => {
  return new Promise((r) => setTimeout(r, ms));
};

const getColors = (node: SceneNode): Color[] => {
  const colors: Color[] = [];

  if (
    "fills" in node &&
    node.fills !== figma.mixed &&
    node.fills.length !== 0
  ) {
    const solid = node.fills.find(
      (fill) => fill.type === "SOLID" && fill.visible == true
    );
    if (solid && "color" in solid) {
      const hex = chroma.gl(solid.color.r, solid.color.g, solid.color.b).hex();

      colors.push({
        hex: hex.replaceAll("#", ""),
        opacity: solid.opacity == undefined ? 1 : solid.opacity,
      });
    }
  }

  if ("strokes" in node && node.strokes.length !== 0) {
    const solid = node.strokes.find(
      (fill) => fill.type === "SOLID" && fill.visible == true
    );
    if (solid && "color" in solid) {
      const hex = chroma.gl(solid.color.r, solid.color.g, solid.color.b).hex();

      colors.push({
        hex: hex.replaceAll("#", ""),
        opacity: solid.opacity == undefined ? 1 : solid.opacity,
      });
    }
  }

  if ("children" in node) {
    node.children.map((node) => {
      colors.push(...getColors(node));
    });
  }

  return colors;
};

const setColor = async (styles: LocalStyle[], node: SceneNode) => {
  await sleep(1);

  if (
    "fills" in node &&
    node.fills !== figma.mixed &&
    node.fills.length !== 0
  ) {
    const solid = node.fills.find(
      (fill) => fill.type === "SOLID" && fill.visible == true
    );
    if (solid && "color" in solid) {
      const hex = chroma.gl(solid.color.r, solid.color.g, solid.color.b).hex();
      const opacity = solid.opacity == undefined ? 1 : solid.opacity;

      styles.forEach((style) => {
        const styleHex = chroma
          .gl(style.color.r, style.color.g, style.color.b)
          .hex();

        if (hex == styleHex && opacity == style.opacity) {
          console.log(solid.opacity);

          node.fillStyleId = style.id;
        }
      });
    }
  }

  if ("strokes" in node && node.strokes.length !== 0) {
    const solid = node.strokes.find(
      (fill) => fill.type === "SOLID" && fill.visible == true
    );
    if (solid && "color" in solid) {
      const hex = chroma.gl(solid.color.r, solid.color.g, solid.color.b).hex();
      const opacity = solid.opacity == undefined ? 1 : solid.opacity;

      styles.forEach((style) => {
        const styleHex = chroma
          .gl(style.color.r, style.color.g, style.color.b)
          .hex();

        if (hex == styleHex && opacity == style.opacity) {
          console.log(solid.opacity);

          node.strokeStyleId = style.id;
        }
      });
    }
  }

  if ("children" in node) {
    await Promise.all(
      node.children.map(async (node) => {
        await setColor(styles, node);
      })
    );
  }
};

figma.showUI(__html__, { themeColors: true, height: 560, width: 320 });

let colors: Color[] = [];

const getLocalColors = () => {
  const list: LocalColor[] = [];

  figma.getLocalPaintStyles().forEach((style) => {
    if (style.paints.length !== 0) {
      const solid = style.paints.find(
        (paint) => paint.type === "SOLID" && paint.visible == true
      );
      if (solid && "color" in solid) {
        const hex = chroma
          .gl(solid.color.r, solid.color.g, solid.color.b)
          .hex();

        list.push({
          hex: hex.replaceAll("#", ""),
          name: style.name,
          opacity: solid.opacity == undefined ? 1 : solid.opacity,
        });
      }
    }
  });

  return list;
};

figma.root.children.forEach((page) => {
  page.children.forEach((node) => {
    colors.push(...getColors(node));
  });

  getLocalColors().forEach((localColor) => {
    colors.push({
      hex: localColor.hex,
      opacity: localColor.opacity,
    });
  });
});

colors = colors.reduce((list: Color[], color) => {
  if (
    list.findIndex(
      ({ hex, opacity }) => hex === color.hex && opacity === color.opacity
    ) === -1
  ) {
    list.push(color);
  }
  return list;
}, []);

if (colors.length == 0) {
  figma.notify("Figma Color Namer : Not Found Colors", {
    error: true,
    onDequeue: () => figma.closePlugin(),
  });
} else {
  fetch("https://fcn-api.fly.dev/v1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      colors,
    }),
  })
    .then(async (response) => {
      const json = await response.json();
      const localColors = getLocalColors();
      const tmpDatas = await getData(DataKey.USE_GENERATE);
      const datas: UseGenerate[] = tmpDatas == undefined ? [] : tmpDatas;

      if (json.message == "success") {
        figma.ui.postMessage({
          type: PluginMessageType.PREVIEW,
          data: json.data.map((preview: PreviewUI) => {
            const localColor = localColors.find(
              (localColor) =>
                localColor.hex == preview.hex &&
                localColor.opacity == preview.opacity
            );

            const data = datas.find(
              (data) =>
                data.hex == preview.hex && data.opacity == preview.opacity
            );

            return {
              hex: preview.hex,
              localName: localColor == undefined ? null : localColor.name,
              name: preview.name,
              opacity: preview.opacity,
              useGenerate: data == undefined ? true : data.useGenerate,
            };
          }),
        });
      } else {
        figma.notify("Figma Color Namer : Failed to get name", {
          error: true,
          onDequeue: () => figma.closePlugin(),
        });
      }
    })
    .catch(() => {
      figma.notify("Figma Color Namer : Failed to get name", {
        error: true,
        onDequeue: () => figma.closePlugin(),
      });
    });
}

figma.ui.onmessage = async (msg: UiMessage) => {
  const { type, data } = msg;
  switch (type) {
    case UiMessageType.ERROR: {
      figma.notify("Figma Color Namber : " + data, {
        error: true,
      });
      break;
    }
    case UiMessageType.APPLY: {
      const { preview }: GenerateOption = data;

      figma.getLocalPaintStyles().forEach((localPaint) => {
        localPaint.remove();
      });

      let localStyles: PaintStyle[] = [];

      try {
        preview.forEach((pre) => {
          const paintStyle = figma.createPaintStyle();
          paintStyle.name = pre.useGenerate
            ? pre.name
            : pre.localName == null
            ? ""
            : pre.localName;

          const rgb = chroma(`#${pre.hex}`).gl();

          paintStyle.paints = [
            {
              type: "SOLID",
              opacity: pre.opacity,
              color: {
                r: rgb[0],
                g: rgb[1],
                b: rgb[2],
              },
            },
          ];

          localStyles = [...localStyles, paintStyle];
        });

        const styles: LocalStyle[] = [];

        localStyles.forEach((style) => {
          const paint = style.paints[0];
          if (paint.type == "SOLID") {
            styles.push({
              id: style.id,
              name: style.name,
              color: paint.color,
              opacity: paint.opacity == undefined ? 1 : paint.opacity,
            });
          }
        });

        await Promise.all(
          figma.root.children.map(async (page) => {
            await Promise.all(
              page.children.map(async (node) => {
                await setColor(styles, node);
              })
            );
          })
        );

        await Promise.all([
          setData(
            DataKey.USE_GENERATE,
            preview.map((preview) => {
              return {
                hex: preview.hex,
                opacity: preview.opacity,
                useGenerate: preview.useGenerate,
              };
            })
          ),
        ]);

        figma.closePlugin("Figma Color Namer : Success apply");
      } catch (e) {
        console.log(e);
        figma.notify("Figma Color Namer : Failed apply", {
          timeout: 1000,
          error: true,
          onDequeue: () => {
            figma.closePlugin();
          },
        });
      }
      break;
    }
  }
};
