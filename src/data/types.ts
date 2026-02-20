export type FlowType = 'inbound' | 'internal' | 'outbound' | 'meta' | 'bidirectional';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ParamType = 'string' | 'number' | 'boolean' | 'json' | 'file' | 'date';

export interface ToolParam {
  name: string;
  type: ParamType;
  required: boolean;
  description?: string;
  default?: string | number | boolean;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  flowType: FlowType;
  riskLevel: RiskLevel;
  inputs: ToolParam[];
  outputs: ToolParam[];
  icon: string;
  requiresApproval: boolean;
  canChainTo: string[];
}

export interface ToolNodeData {
  [key: string]: unknown;
  tool: Tool;
  isSelected: boolean;
  executionState: 'idle' | 'running' | 'success' | 'error';
}

// Flow type colors
export const FLOW_COLORS: Record<FlowType, { border: string; bg: string; icon: string }> = {
  inbound: { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: '↓' },
  internal: { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', icon: '⟳' },
  outbound: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: '↑' },
  meta: { border: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', icon: '⚙' },
  bidirectional: { border: 'linear-gradient(90deg, #3b82f6, #f59e0b)', bg: 'rgba(139, 92, 246, 0.1)', icon: '↔' },
};

// Risk level colors
export const RISK_COLORS: Record<RiskLevel, { bg: string; text: string }> = {
  low: { bg: '#374151', text: '#9ca3af' },
  medium: { bg: 'rgba(245, 158, 11, 0.2)', text: '#fbbf24' },
  high: { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171' },
  critical: { bg: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' },
};
