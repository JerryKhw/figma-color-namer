import React, { useEffect, useCallback, useState } from "react";
import { PreviewUI } from "../interface";
import { PageType, PluginMessageType, UiMessageType } from "../enum";
import { Loading, PreviewItem } from "./component";
import "./App.css";

const App = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [pageType, setPageType] = useState<PageType>(PageType.LOADING);
  const [preview, setPreview] = useState<PreviewUI[]>([]);

  const onGenerate = useCallback(() => {
    setLoading(true);

    parent.postMessage(
      {
        pluginMessage: {
          type: UiMessageType.GENERATE,
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
            {preview.map((pre) => (
              <PreviewItem preview={pre} />
            ))}
          </section>
          <footer>
            <div className="spacer" />

            <button onClick={onGenerate}>Generate</button>
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
