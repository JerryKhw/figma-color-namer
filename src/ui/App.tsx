import React, { useEffect, useCallback, useState } from "react";
import { PreviewUI } from "../interface";
import { PageType, PluginMessageType, UiMessageType } from "../enum";
import { Loading, PreviewItem } from "./component";
import "./App.css";

const App = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [pageType, setPageType] = useState<PageType>(PageType.LOADING);
  const [preview, setPreview] = useState<PreviewUI[]>([]);

  const onChange = useCallback(
    async (index: number, value: PreviewUI) => {
      const newPreviews = [...preview];

      newPreviews[index] = value;

      setPreview(newPreviews);
    },
    [preview]
  );

  const onApply = useCallback(() => {
    setLoading(true);

    parent.postMessage(
      {
        pluginMessage: {
          type: UiMessageType.APPLY,
          data: {
            preview: preview,
          },
        },
      },
      "*"
    );
  }, [preview]);

  useEffect(() => {
    window.onmessage = (event) => {
      if (event.data.pluginMessage) {
        const { type, data } = event.data.pluginMessage;

        switch (type) {
          case PluginMessageType.PREVIEW: {
            setPageType(PageType.GENERATE);
            setPreview(data);
            break;
          }
        }
      }
    };
  }, []);

  return (
    <>
      {pageType == PageType.LOADING ? (
        <center>
          <Loading />
        </center>
      ) : (
        <>
          <section>
            {preview.map((pre, index) => (
              <PreviewItem preview={pre} index={index} onChange={onChange} />
            ))}
          </section>
          <footer>
            <div className="spacer" />

            <button onClick={onApply}>Apply</button>
          </footer>

          {loading && (
            <div className="modal">
              <center>
                <Loading color="#ffffff" />
              </center>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default App;
