import React, { useState } from "react";
import { Handle, Position, NodeToolbar } from "reactflow";
import { ReactComponent as WebScrapperIcon } from "./icons/webscrapper.svg";
import { FaPlay, FaSpinner } from "react-icons/fa";

function WebScrapperNode({
  data,
  id,
  selected,
}: {
  data: {
    setScrapedData?: (text: string) => void;
    onDelete: (id: string) => void;
    onRun: (id: string) => void;
  };
  id: string;
  selected: boolean;
}) {
  const [url, setUrl] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    console.log("Event: handleInputChange for URL:", event.target.value);
  };

  const handleScrape = async () => {
    if (data.setScrapedData) {
      setIsRunning(true);
      console.log("Event: handleScrape initiated for URL:", url);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/scrape`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, render_js: false }),
        }
      );
      const result = await response.json();
      data.setScrapedData(result.content);
      console.log(`Scraped data for node ${id}:`, result.content);
      setIsRunning(false);
    }
  };

  return (
    <div className="node-card">
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        className="node-toolbar"
      >
        <button onClick={() => data.onDelete(id)}>Delete</button>
        <button
          onClick={handleScrape}
          className={isRunning ? "node-button running" : "node-button"}
        >
          {isRunning ? <FaSpinner className="spin" /> : <FaPlay />}
        </button>
      </NodeToolbar>
      <div className="node-header">
        <WebScrapperIcon className="node-icon" />
        <h3 className="node-title">WebScrapper</h3>
      </div>
      <input
        type="text"
        value={url}
        onChange={handleInputChange}
        placeholder="Enter URL"
        className="node-input"
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default WebScrapperNode;
