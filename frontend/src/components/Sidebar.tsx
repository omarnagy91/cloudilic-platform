import React from "react";
import { ReactComponent as WebScrapperIcon } from "./icons/webscrapper.svg";
import { ReactComponent as SummaryIcon } from "./icons/summary.svg";
import { ReactComponent as Logo } from "./icons/logo.svg";

const Sidebar = ({ onAddNode }: { onAddNode: (type: string) => void }) => {
  return (
    <aside>
      <div className="logo">
        <Logo />
      </div>
      <div className="dndnode" onClick={() => onAddNode("webScrapper")}>
        <WebScrapperIcon className="sidebar-icon" />
        WebScrapper
      </div>
      <div className="dndnode" onClick={() => onAddNode("summary")}>
        <SummaryIcon className="sidebar-icon" />
        Summary
      </div>
    </aside>
  );
};

export default Sidebar;