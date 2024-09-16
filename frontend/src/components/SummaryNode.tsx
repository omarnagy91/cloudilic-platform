import React, { useEffect, useState, useCallback } from "react";
import { Handle, Position, NodeToolbar } from "reactflow";
import { ReactComponent as SummaryIcon } from "./icons/summary.svg";
import { FaPlay, FaSpinner } from "react-icons/fa";

function SummaryNode({
  data,
  id,
  selected,
}: {
  data: {
    scrapedData: string;
    onDelete: (id: string) => void;
    onRun: (id: string) => void;
  };
  id: string;
  selected: boolean;
}) {
  const [summary, setSummary] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const summarize = useCallback(async () => {
    if (data.scrapedData) {
      console.log(`Summarizing data for node ${id}:`, data.scrapedData);
      setIsRunning(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/summarize`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: data.scrapedData }),
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }
        const result = await response.json();
        setSummary(result.summary);
        console.log(`Summary for node ${id}:`, result.summary);
      } catch (error) {
        console.error("Failed to summarize:", error);
        setSummary("Error summarizing text.");
      }
      setIsRunning(false);
    }
  }, [data.scrapedData, id]);

  useEffect(() => {
    if (data.scrapedData) {
      summarize();
    }
  }, [data.scrapedData, summarize]);

  return (
    <div className="node-card">
      <div className="node-header">
        <SummaryIcon className="node-icon" />
        <h3 className="node-title">Summary</h3>
      </div>
      <div className="summary-box">
        {isRunning ? <FaSpinner className="spin" /> : summary}
      </div>
      <NodeToolbar
        isVisible={selected}
        position={Position.Bottom}
        className="node-toolbar"
      >
        <button onClick={() => data.onDelete(id)}>Delete</button>
        <button
          onClick={summarize}
          className={isRunning ? "node-button running" : "node-button"}
        >
          {isRunning ? <FaSpinner className="spin" /> : <FaPlay />}
        </button>
      </NodeToolbar>
      <Handle type="target" position={Position.Top} />
    </div>
  );
}

export default SummaryNode;
