import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import type { NodeTypes, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ToolNode from './nodes/ToolNode';
import ToolDetailPanel from './panels/ToolDetailPanel';
import WorkflowPanel from './panels/WorkflowPanel';
import SearchBox from './components/SearchBox';
import { useFlowStore } from './store/flowStore';
import { FLOW_COLORS } from './data/types';
import type { ToolNodeData } from './data/types';
import './styles/flow.css';

// Register custom node types
const nodeTypes: NodeTypes = {
  toolNode: ToolNode,
};

function Flow() {
  const [isWorkflowPanelOpen, setIsWorkflowPanelOpen] = useState(false);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectTool,
    resetLayout,
    applyAutoLayout,
    isLayouting,
  } = useFlowStore();

  const { fitView } = useReactFlow();

  // Fit view when nodes change significantly
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.1, duration: 200 });
    }, 50);
    return () => clearTimeout(timer);
  }, [nodes.length, fitView]);

  // Handle node click to select tool
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectTool(node.id);
    },
    [selectTool]
  );

  // Handle pane click to deselect
  const onPaneClick = useCallback(() => {
    selectTool(null);
  }, [selectTool]);

  // Connection validation
  const isValidConnection = useCallback(
    (connection: { source: string | null; target: string | null }) => {
      const sourceNode = nodes.find(n => n.id === connection.source);
      if (!sourceNode) return false;
      return sourceNode.data.tool.canChainTo.includes(connection.target!);
    },
    [nodes]
  );

  // MiniMap node color based on flow type
  const nodeColor = useCallback((node: Node<ToolNodeData>) => {
    const flowType = node.data?.tool?.flowType;
    if (flowType && flowType in FLOW_COLORS) {
      return FLOW_COLORS[flowType as keyof typeof FLOW_COLORS].border;
    }
    return '#374151';
  }, []);

  // Handle flow-based layout reset
  const handleFlowLayout = useCallback(() => {
    resetLayout();
    setTimeout(() => fitView({ padding: 0.1, duration: 300 }), 50);
  }, [resetLayout, fitView]);

  // Handle ELK auto-layout
  const handleAutoLayout = useCallback(async () => {
    await applyAutoLayout();
    setTimeout(() => fitView({ padding: 0.1, duration: 300 }), 50);
  }, [applyAutoLayout, fitView]);

  return (
    <div className="flow-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background color="#374151" gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={nodeColor}
          nodeStrokeWidth={3}
          zoomable
          pannable
          style={{ background: '#1f2937' }}
        />

        {/* Top Panel */}
        <Panel position="top-left" className="header-panel">
          <h1 className="header-title">Starbug Tools</h1>
          <p className="header-subtitle">Data Flow Topology</p>
        </Panel>

        <Panel position="top-right" className="controls-panel">
          <SearchBox />
          <button
            className="workflow-btn"
            onClick={() => setIsWorkflowPanelOpen(true)}
            title="Open workflow builder"
          >
            <span className="workflow-btn-icon">⚡</span>
            Workflows
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleFlowLayout}
            title="Arrange by flow type columns"
          >
            Flow Layout
          </button>
          <button
            className={`btn btn-primary ${isLayouting ? 'loading' : ''}`}
            onClick={handleAutoLayout}
            disabled={isLayouting}
            title="Auto-arrange using ELK algorithm"
          >
            {isLayouting ? 'Layouting...' : 'Auto Layout'}
          </button>
        </Panel>

        {/* Legend */}
        <Panel position="bottom-left" className="legend-panel">
          <div className="legend">
            <div className="legend-title">Data Flow</div>
            <div className="legend-items">
              <div className="legend-item">
                <span
                  className="legend-dot"
                  style={{ background: FLOW_COLORS.inbound.border }}
                />
                <span>Inbound (External to You)</span>
              </div>
              <div className="legend-item">
                <span
                  className="legend-dot"
                  style={{ background: FLOW_COLORS.internal.border }}
                />
                <span>Internal (Your Data)</span>
              </div>
              <div className="legend-item">
                <span
                  className="legend-dot"
                  style={{ background: FLOW_COLORS.outbound.border }}
                />
                <span>Outbound (You to External)</span>
              </div>
              <div className="legend-item">
                <span
                  className="legend-dot"
                  style={{ background: FLOW_COLORS.meta.border }}
                />
                <span>Meta (System)</span>
              </div>
              <div className="legend-item">
                <span
                  className="legend-dot"
                  style={{ background: '#8b5cf6' }}
                />
                <span>Bidirectional</span>
              </div>
            </div>
            <div className="legend-hint">
              Drag between nodes to create workflows
            </div>
          </div>
        </Panel>
      </ReactFlow>

      <ToolDetailPanel />
      <WorkflowPanel
        isOpen={isWorkflowPanelOpen}
        onClose={() => setIsWorkflowPanelOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <div className="app">
        <Flow />
      </div>
    </ReactFlowProvider>
  );
}
