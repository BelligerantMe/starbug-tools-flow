import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
} from '@xyflow/react';
import { tools, getToolById } from '../data/tools';
import type { Tool, ToolNodeData } from '../data/types';
import { getLayoutedElements, getFlowBasedLayout } from '../utils/layout';

type ToolNode = Node<ToolNodeData>;

interface FlowState {
  nodes: ToolNode[];
  edges: Edge[];
  selectedTool: Tool | null;
  isPanelOpen: boolean;
  isLayouting: boolean;

  // Actions
  onNodesChange: (changes: NodeChange<ToolNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => boolean;
  selectTool: (toolId: string | null) => void;
  togglePanel: (open?: boolean) => void;
  resetLayout: () => void;
  applyAutoLayout: () => Promise<void>;
  applyFlowLayout: () => void;
  setExecutionState: (nodeId: string, state: 'idle' | 'running' | 'success' | 'error') => void;
}

// Create initial nodes from tools (with placeholder positions)
const createInitialNodes = (): ToolNode[] => {
  return tools.map((tool, index) => ({
    id: tool.id,
    type: 'toolNode',
    position: { x: 0, y: index * 200 }, // Will be layouted
    data: {
      tool,
      isSelected: false,
      executionState: 'idle' as const,
    },
  }));
};

// Create edges showing potential connections (canChainTo relationships)
const createInitialEdges = (): Edge[] => {
  const edges: Edge[] = [];

  tools.forEach(tool => {
    tool.canChainTo.forEach(targetId => {
      edges.push({
        id: `${tool.id}-${targetId}`,
        source: tool.id,
        target: targetId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#374151', strokeWidth: 1, opacity: 0.3 },
        className: 'potential-edge',
      });
    });
  });

  return edges;
};

// Get initial layouted state
const getInitialLayoutedState = () => {
  const nodes = createInitialNodes();
  const edges = createInitialEdges();
  const { nodes: layoutedNodes } = getFlowBasedLayout(nodes, edges);
  return { nodes: layoutedNodes, edges };
};

const initialState = getInitialLayoutedState();

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      nodes: initialState.nodes,
      edges: initialState.edges,
      selectedTool: null,
      isPanelOpen: false,
      isLayouting: false,

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes) as ToolNode[],
        });
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      onConnect: (connection) => {
        // Validate connection: check if source can chain to target
        const sourceTool = getToolById(connection.source!);
        if (!sourceTool || !sourceTool.canChainTo.includes(connection.target!)) {
          console.warn('Invalid connection: tool cannot chain to target');
          return false;
        }

        // Add the edge with active styling
        set({
          edges: addEdge(
            {
              ...connection,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#3b82f6', strokeWidth: 2 },
              className: 'active-edge',
            },
            get().edges
          ),
        });

        return true;
      },

      selectTool: (toolId) => {
        const tool = toolId ? getToolById(toolId) ?? null : null;

        // Update node selection state
        set({
          selectedTool: tool,
          isPanelOpen: tool !== null,
          nodes: get().nodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              isSelected: node.id === toolId,
            },
          })),
        });
      },

      togglePanel: (open) => {
        set({ isPanelOpen: open ?? !get().isPanelOpen });
      },

      // Reset to flow-based layout (synchronous, fast)
      resetLayout: () => {
        const nodes = createInitialNodes();
        const edges = createInitialEdges();
        const { nodes: layoutedNodes } = getFlowBasedLayout(nodes, edges);
        set({ nodes: layoutedNodes, edges });
      },

      // Apply ELK auto-layout (async, optimized)
      applyAutoLayout: async () => {
        set({ isLayouting: true });
        try {
          const { nodes, edges } = get();
          const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
            nodes,
            edges
          );
          set({ nodes: layoutedNodes, edges: layoutedEdges, isLayouting: false });
        } catch (error) {
          console.error('Layout error:', error);
          set({ isLayouting: false });
        }
      },

      // Apply flow-based layout (sync)
      applyFlowLayout: () => {
        const { nodes, edges } = get();
        const { nodes: layoutedNodes } = getFlowBasedLayout(nodes, edges);
        set({ nodes: layoutedNodes });
      },

      setExecutionState: (nodeId, state) => {
        set({
          nodes: get().nodes.map(node =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, executionState: state } }
              : node
          ),
        });
      },
    }),
    {
      name: 'starbug-flow-storage',
      partialize: (state) => ({
        nodes: state.nodes.map(n => ({ id: n.id, position: n.position })),
      }),
    }
  )
);
