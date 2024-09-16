import { memo } from "react";
import { Handle, Position, NodeToolbar } from "@xyflow/react";

const CustomNode = ({
  data,
  id,
  onDelete,
  onRun,
}: {
  data: any;
  id: any;
  onDelete: (id: any) => void;
  onRun: (id: any) => void;
}) => {
  return (
    <>
      <NodeToolbar
        isVisible={data.toolbarVisible}
        position={data.toolbarPosition}
      >
        <button onClick={() => onDelete(id)}>Delete</button>
        <button onClick={() => onRun(id)}>Run</button>
      </NodeToolbar>

      <div style={{ padding: "10px 20px" }}>{data.label}</div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default memo(CustomNode);