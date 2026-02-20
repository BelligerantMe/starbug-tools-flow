import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { ToolNodeData } from '../data/types';
import { FLOW_COLORS, RISK_COLORS } from '../data/types';

type ToolNodeType = Node<ToolNodeData>;

function ToolNode({ data, selected }: NodeProps<ToolNodeType>) {
  const { tool, executionState } = data;
  const flowStyle = FLOW_COLORS[tool.flowType];
  const riskStyle = RISK_COLORS[tool.riskLevel];

  // Determine which handles to show based on flow type
  const showInputHandle = ['internal', 'outbound', 'meta', 'bidirectional'].includes(tool.flowType);
  const showOutputHandle = ['inbound', 'internal', 'meta', 'bidirectional'].includes(tool.flowType);

  // Special case: outbound tools that can chain (like code_change)
  const canChainFurther = tool.canChainTo.length > 0;
  const showOutputForOutbound = tool.flowType === 'outbound' && canChainFurther;

  return (
    <div
      className={`tool-node ${tool.flowType} ${selected ? 'selected' : ''} ${executionState}`}
      style={{
        borderColor: tool.flowType === 'bidirectional' ? undefined : flowStyle.border,
        background: flowStyle.bg,
      }}
    >
      {/* Input Handle (left side) */}
      {showInputHandle && (
        <Handle
          type="target"
          position={Position.Left}
          className="handle handle-input"
          style={{ background: flowStyle.border }}
        />
      )}

      {/* Node Content */}
      <div className="tool-node-content">
        <div className="tool-node-header">
          <span className="tool-icon">{tool.icon}</span>
          <span className="tool-name">{tool.name}</span>
          {tool.requiresApproval && <span className="lock-icon">🔒</span>}
        </div>

        <div className="tool-description">{tool.description}</div>

        <div className="tool-footer">
          <span
            className="risk-badge"
            style={{ background: riskStyle.bg, color: riskStyle.text }}
          >
            {tool.riskLevel.toUpperCase()}
          </span>
          <span className="flow-indicator">{flowStyle.icon}</span>
        </div>

        {/* I/O Summary */}
        <div className="io-summary">
          {tool.inputs.length > 0 && (
            <span className="io-inputs">
              {tool.inputs.filter((i) => i.required).map((i) => i.name).join(', ')}
              {tool.inputs.some((i) => !i.required) && '...'}
            </span>
          )}
          <span className="io-arrow">→</span>
          <span className="io-outputs">
            {tool.outputs.map((o) => o.name).join(', ')}
          </span>
        </div>

        {/* Execution State Indicator */}
        {executionState === 'running' && (
          <div className="execution-indicator running">Running...</div>
        )}
        {executionState === 'success' && (
          <div className="execution-indicator success">Done</div>
        )}
        {executionState === 'error' && (
          <div className="execution-indicator error">Error</div>
        )}
      </div>

      {/* Output Handle (right side) */}
      {(showOutputHandle || showOutputForOutbound) && (
        <Handle
          type="source"
          position={Position.Right}
          className="handle handle-output"
          style={{ background: flowStyle.border }}
        />
      )}
    </div>
  );
}

export default memo(ToolNode);
