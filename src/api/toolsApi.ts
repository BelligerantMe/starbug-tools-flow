/**
 * Tools API Client
 * Communicates with the Starbug Tools API server
 */

// In development, Vite proxies /api to Starbug. In production, set VITE_API_URL.
const API_BASE = import.meta.env.VITE_API_URL || '';

interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  risk_level: string;
  requires_approval: boolean;
  requires_network: boolean;
  tags: string[];
  input_schema: Record<string, unknown>;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: number;
}

interface WorkflowDetail {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: {
    id: string;
    tool: string;
    action: string;
    requires_approval: boolean;
    inputs: string[];
    outputs: string[];
  }[];
  templates: string[];
}

interface ExecutionResult {
  execution_id: string;
  status: 'pending' | 'running' | 'awaiting_approval' | 'completed' | 'failed' | 'cancelled';
  workflow_id?: string;
  awaiting_approval?: boolean;
  pending_step?: {
    step_id: string;
    tool: string;
    action: string;
    inputs: Record<string, unknown>;
  };
  results?: Record<string, unknown>;
  error?: string;
}

class ToolsApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Request failed' };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // ==========================================================================
  // Tool Endpoints
  // ==========================================================================

  async listTools(): Promise<ApiResponse<{ tools: Tool[]; count: number }>> {
    return this.request('/api/tools');
  }

  async getTool(toolId: string): Promise<ApiResponse<{ tool: Tool }>> {
    return this.request(`/api/tools/${toolId}`);
  }

  async executeTool(
    toolId: string,
    args: Record<string, unknown>
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`/api/tools/${toolId}/execute`, {
      method: 'POST',
      body: JSON.stringify(args),
    });
  }

  // ==========================================================================
  // Workflow Endpoints
  // ==========================================================================

  async listWorkflows(): Promise<ApiResponse<{ workflows: Workflow[]; count: number }>> {
    return this.request('/api/workflows');
  }

  async getWorkflow(workflowId: string): Promise<ApiResponse<{ workflow: WorkflowDetail }>> {
    return this.request(`/api/workflows/${workflowId}`);
  }

  async executeWorkflow(
    workflowId: string,
    inputs: Record<string, unknown>
  ): Promise<ApiResponse<ExecutionResult>> {
    return this.request(`/api/workflows/${workflowId}/execute`, {
      method: 'POST',
      body: JSON.stringify(inputs),
    });
  }

  async getExecution(executionId: string): Promise<ApiResponse<{ execution: ExecutionResult }>> {
    return this.request(`/api/executions/${executionId}`);
  }

  async approveExecution(executionId: string): Promise<ApiResponse<ExecutionResult>> {
    return this.request(`/api/executions/${executionId}/approve`, {
      method: 'POST',
    });
  }

  async rejectExecution(
    executionId: string,
    reason?: string
  ): Promise<ApiResponse<ExecutionResult>> {
    return this.request(`/api/executions/${executionId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ==========================================================================
  // Health Check
  // ==========================================================================

  async healthCheck(): Promise<ApiResponse<{ status: string; tools: number; workflows: number }>> {
    return this.request('/api/health');
  }
}

// Singleton instance
export const toolsApi = new ToolsApi();

// Export types
export type { Tool, Workflow, WorkflowDetail, ExecutionResult, ApiResponse };
