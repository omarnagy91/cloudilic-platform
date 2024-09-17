import React, { useCallback, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Controls,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import nodeTypes from "./components/NodeTypes";
import Sidebar from "./components/Sidebar";

function App() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = (params: Connection) =>
    setEdges((eds) => addEdge(params, eds));

  const onDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== id && edge.target !== id)
      );
    },
    [setNodes, setEdges]
  );

  const onRunNode = useCallback(
    async (id: string) => {
      console.log(`Running workflow for node ${id}`);
      const node = nodes.find((node) => node.id === id);
      if (node && node.data.onRun) {
        await node.data.onRun(id);
      }
    },
    [nodes]
  );

  const onAddNode = useCallback(
    (type: string) => {
      if (reactFlowWrapper.current) {
        const reactFlowBounds =
          reactFlowWrapper.current.getBoundingClientRect();
        const position = project({
          x: reactFlowBounds.width / 2,
          y: reactFlowBounds.height / 2,
        });
        const newNode = {
          id: `${+new Date()}`,
          type,
          position,
          data: {
            label: `${type} node`,
            onDelete: onDeleteNode,
            onRun: onRunNode,
            setScrapedData:
              type === "webScrapper"
                ? (text: string) => {
                    console.log(
                      `Setting scraped data for node ${newNode.id}:`,
                      text
                    );
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === newNode.id
                          ? {
                              ...node,
                              data: { ...node.data, scrapedData: text },
                            }
                          : node
                      )
                    );
                  }
                : undefined,
          },
        };
        setNodes((nds) => nds.concat(newNode));
      }
    },
    [project, setNodes, onDeleteNode, onRunNode]
  );

  const runFlow = useCallback(async () => {
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const edgeMap = new Map(edges.map((edge) => [edge.source, edge.target]));

    const runNode = async (nodeId: string) => {
      const node = nodeMap.get(nodeId);
      if (node && node.data.onRun) {
        console.log(`Running node ${nodeId} with data:`, node.data);
        await node.data.onRun(nodeId);
        const targetNodeId = edgeMap.get(nodeId);
        if (targetNodeId) {
          const targetNode = nodeMap.get(targetNodeId);
          if (targetNode && targetNode.data.scrapedData === undefined) {
            targetNode.data.scrapedData = node.data.scrapedData;
            console.log(
              `Passing scraped data from node ${nodeId} to node ${targetNodeId}:`,
              node.data.scrapedData
            );
          }
          await runNode(targetNodeId);
        }
      }
    };

    const startNodes = nodes.filter(
      (node) => !edges.some((edge) => edge.target === node.id)
    );
    for (const node of startNodes) {
      await runNode(node.id);
    }
  }, [nodes, edges]);

  return (
    <ReactFlowProvider>
      <div style={{ display: "flex", height: "100vh" }}>
        <Sidebar onAddNode={onAddNode} />
        <div style={{ flex: 1, padding: "20px" }} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode="Delete"
          />
          <Controls />
          <button
            onClick={runFlow}
            style={{ position: "absolute", top: 10, right: 10 }}
          >
            Run Flow
          </button>
        </div>
      </div>
    </ReactFlowProvider>
  );
}

export default App;
