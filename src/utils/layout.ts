import ELK from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge } from '@xyflow/react';
import type { ToolNodeData } from '../data/types';

const elk = new ELK();

// ELK layout options
const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.spacing.nodeNode': '80',
  'elk.layered.spacing.nodeNodeBetweenLayers': '150',
  'elk.layered.spacing.edgeNodeBetweenLayers': '50',
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.partitioning.activate': 'true',
};

// Map flow types to ELK partition indices (layers)
const flowTypeToPartition: Record<string, number> = {
  inbound: 0,
  bidirectional: 1,
  internal: 1,
  outbound: 2,
  meta: 3,
};

export async function getLayoutedElements(
  nodes: Node<ToolNodeData>[],
  edges: Edge[]
): Promise<{ nodes: Node<ToolNodeData>[]; edges: Edge[] }> {
  const nodeWidth = 240;
  const nodeHeight = 160;

  // Build ELK graph
  const graph = {
    id: 'root',
    layoutOptions: elkOptions,
    children: nodes.map((node) => {
      const partition = flowTypeToPartition[node.data.tool.flowType] ?? 1;
      return {
        id: node.id,
        width: nodeWidth,
        height: nodeHeight,
        layoutOptions: {
          'elk.partitioning.partition': String(partition),
        },
      };
    }),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  try {
    const layoutedGraph = await elk.layout(graph);

    // Apply positions from ELK back to React Flow nodes
    const layoutedNodes = nodes.map((node) => {
      const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);
      if (layoutedNode) {
        return {
          ...node,
          position: {
            x: layoutedNode.x ?? 0,
            y: layoutedNode.y ?? 0,
          },
        };
      }
      return node;
    });

    return { nodes: layoutedNodes, edges };
  } catch (error) {
    console.error('ELK layout error:', error);
    return { nodes, edges };
  }
}

// Alternative: Hierarchical layout by flow type (simpler, deterministic)
export function getFlowBasedLayout(
  nodes: Node<ToolNodeData>[],
  edges: Edge[]
): { nodes: Node<ToolNodeData>[]; edges: Edge[] } {
  const nodeWidth = 240;
  const nodeHeight = 160;
  const horizontalSpacing = 100;
  const verticalSpacing = 40;
  const columnWidth = nodeWidth + horizontalSpacing;

  // Group nodes by flow type
  const groups: Record<string, Node<ToolNodeData>[]> = {
    inbound: [],
    internal: [],
    bidirectional: [],
    outbound: [],
    meta: [],
  };

  nodes.forEach((node) => {
    const flowType = node.data.tool.flowType;
    if (groups[flowType]) {
      groups[flowType].push(node);
    }
  });

  // Column positions
  const columns: Record<string, number> = {
    inbound: 0,
    internal: columnWidth,
    bidirectional: columnWidth,
    outbound: columnWidth * 2,
    meta: columnWidth, // Meta spans the bottom
  };

  // Calculate y positions within each column
  const yPositions: Record<string, number> = {
    inbound: 50,
    internal: 50,
    bidirectional: 50, // Will be placed after internal
    outbound: 50,
    meta: 0, // Will be calculated
  };

  // Calculate internal + bidirectional combined height
  const internalHeight = groups.internal.length * (nodeHeight + verticalSpacing);
  yPositions.bidirectional = 50 + internalHeight;

  // Meta row starts below the tallest column
  const maxMainHeight = Math.max(
    groups.inbound.length * (nodeHeight + verticalSpacing),
    (groups.internal.length + groups.bidirectional.length) * (nodeHeight + verticalSpacing),
    groups.outbound.length * (nodeHeight + verticalSpacing)
  );
  yPositions.meta = 50 + maxMainHeight + 100;

  // Position nodes
  const layoutedNodes = nodes.map((node) => {
    const flowType = node.data.tool.flowType;
    const group = groups[flowType];
    const indexInGroup = group.indexOf(node);

    let x = columns[flowType];
    let y = yPositions[flowType] + indexInGroup * (nodeHeight + verticalSpacing);

    // Special layout for meta: arrange in a row
    if (flowType === 'meta') {
      const metaColumns = 4;
      const col = indexInGroup % metaColumns;
      const row = Math.floor(indexInGroup / metaColumns);
      x = col * columnWidth;
      y = yPositions.meta + row * (nodeHeight + verticalSpacing);
    }

    return {
      ...node,
      position: { x, y },
    };
  });

  return { nodes: layoutedNodes, edges };
}
