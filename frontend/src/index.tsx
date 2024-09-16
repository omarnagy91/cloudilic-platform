import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import "./index.css";
import App from "./App";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ReactFlowProvider } from "reactflow"; // Import ReactFlowProvider

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ReactFlowProvider> {/* Wrap the entire app with ReactFlowProvider */}
        <DndProvider backend={HTML5Backend}>
          <App />
        </DndProvider>
      </ReactFlowProvider>
    </React.StrictMode>
  );
}