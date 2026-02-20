import { useState, useEffect } from 'react';
import { workflowTemplates, type WorkflowTemplate } from '../data/workflows';
import { toolsApi, type ExecutionResult } from '../api/toolsApi';

interface WorkflowPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type PanelView = 'list' | 'detail' | 'execute' | 'running' | 'approval';

export default function WorkflowPanel({ isOpen, onClose }: WorkflowPanelProps) {
  const [view, setView] = useState<PanelView>('list');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [execution, setExecution] = useState<ExecutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when panel closes
  useEffect(() => {
    if (!isOpen) {
      setView('list');
      setSelectedWorkflow(null);
      setInputs({});
      setExecution(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectWorkflow = (workflow: WorkflowTemplate) => {
    setSelectedWorkflow(workflow);
    setView('detail');
    // Initialize inputs
    const initialInputs: Record<string, string> = {};
    workflow.requiredInputs.forEach(input => {
      initialInputs[input.name] = '';
    });
    setInputs(initialInputs);
  };

  const handleStartExecution = async () => {
    if (!selectedWorkflow) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await toolsApi.executeWorkflow(selectedWorkflow.id, inputs);

      if (!result.success) {
        setError(result.error || 'Failed to start workflow');
        setIsLoading(false);
        return;
      }

      const executionData = result.data as ExecutionResult;
      setExecution(executionData);

      if (executionData.status === 'awaiting_approval') {
        setView('approval');
      } else if (executionData.status === 'completed') {
        setView('running'); // Show results
      } else if (executionData.status === 'failed') {
        setError(executionData.error || 'Workflow failed');
      } else {
        setView('running');
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!execution) return;

    setIsLoading(true);
    try {
      const result = await toolsApi.approveExecution(execution.execution_id);

      if (!result.success) {
        setError(result.error || 'Approval failed');
        return;
      }

      const executionData = result.data as ExecutionResult;
      setExecution(executionData);

      if (executionData.status === 'awaiting_approval') {
        // Another step needs approval
        setView('approval');
      } else {
        setView('running');
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!execution) return;

    setIsLoading(true);
    try {
      await toolsApi.rejectExecution(execution.execution_id, 'User rejected');
      setView('list');
      setSelectedWorkflow(null);
      setExecution(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="workflow-panel">
      <div className="panel-header">
        <div className="panel-title-area">
          <span className="panel-icon workflow-icon">⚡</span>
          <div>
            <h2 className="panel-title">
              {view === 'list' && 'Workflows'}
              {view === 'detail' && selectedWorkflow?.name}
              {view === 'execute' && 'Configure Workflow'}
              {view === 'running' && 'Execution Results'}
              {view === 'approval' && 'Approval Required'}
            </h2>
            <p className="panel-subtitle">
              {view === 'list' && 'Pre-built tool chains for common tasks'}
              {view === 'detail' && selectedWorkflow?.description}
              {view === 'execute' && 'Enter required inputs'}
              {view === 'running' && `Status: ${execution?.status}`}
              {view === 'approval' && 'Review and approve this action'}
            </p>
          </div>
        </div>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>

      {error && (
        <div className="workflow-error">
          <span>⚠️</span> {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="panel-content">
        {/* List View */}
        {view === 'list' && (
          <div className="workflow-list">
            {workflowTemplates.map(workflow => (
              <div
                key={workflow.id}
                className="workflow-card"
                onClick={() => handleSelectWorkflow(workflow)}
              >
                <span className="workflow-card-icon">{workflow.icon}</span>
                <div className="workflow-card-content">
                  <h3>{workflow.name}</h3>
                  <p>{workflow.description}</p>
                  <div className="workflow-card-meta">
                    <span className="workflow-steps">{workflow.steps.length} steps</span>
                    <span className={`workflow-category ${workflow.category}`}>
                      {workflow.category}
                    </span>
                  </div>
                </div>
                <span className="workflow-card-arrow">→</span>
              </div>
            ))}
          </div>
        )}

        {/* Detail View */}
        {view === 'detail' && selectedWorkflow && (
          <div className="workflow-detail">
            <div className="workflow-steps-list">
              <h3>Workflow Steps</h3>
              {selectedWorkflow.steps.map((step, index) => (
                <div key={step.id} className="workflow-step">
                  <span className="step-number">{index + 1}</span>
                  <div className="step-content">
                    <div className="step-header">
                      <span className="step-tool">{step.tool}</span>
                      <span className="step-action">.{step.action}</span>
                      {step.requiresApproval && (
                        <span className="step-approval-badge">Requires Approval</span>
                      )}
                    </div>
                    <p className="step-description">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedWorkflow.requiredInputs.length > 0 && (
              <div className="workflow-inputs">
                <h3>Required Inputs</h3>
                {selectedWorkflow.requiredInputs.map(input => (
                  <div key={input.name} className="input-field">
                    <label className="input-label">
                      {input.name}
                      {input.required && <span className="required">*</span>}
                    </label>
                    <p className="input-help">{input.description}</p>
                    <input
                      type="text"
                      className="text-input"
                      value={inputs[input.name] || ''}
                      onChange={(e) => setInputs({ ...inputs, [input.name]: e.target.value })}
                      placeholder={`Enter ${input.name}`}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="workflow-actions">
              <button className="btn btn-secondary" onClick={() => setView('list')}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleStartExecution}
                disabled={isLoading || selectedWorkflow.requiredInputs.some(
                  i => i.required && !inputs[i.name]
                )}
              >
                {isLoading ? 'Starting...' : 'Run Workflow'}
              </button>
            </div>
          </div>
        )}

        {/* Approval View */}
        {view === 'approval' && execution?.pending_step && (
          <div className="workflow-approval">
            <div className="approval-warning">
              <span className="approval-icon">⚠️</span>
              <h3>Action Requires Approval</h3>
            </div>

            <div className="approval-details">
              <div className="approval-field">
                <span className="approval-label">Tool:</span>
                <span className="approval-value">{execution.pending_step.tool}</span>
              </div>
              <div className="approval-field">
                <span className="approval-label">Action:</span>
                <span className="approval-value">{execution.pending_step.action}</span>
              </div>
              <div className="approval-field">
                <span className="approval-label">Step:</span>
                <span className="approval-value">{execution.pending_step.step_id}</span>
              </div>
            </div>

            <div className="approval-inputs">
              <h4>Action Parameters</h4>
              <pre className="approval-params">
                {JSON.stringify(execution.pending_step.inputs, null, 2)}
              </pre>
            </div>

            <div className="workflow-actions">
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={isLoading}
              >
                Reject
              </button>
              <button
                className="btn btn-primary"
                onClick={handleApprove}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Approve & Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Running/Results View */}
        {view === 'running' && execution && (
          <div className="workflow-results">
            <div className={`execution-status ${execution.status}`}>
              <span className="status-icon">
                {execution.status === 'completed' && '✓'}
                {execution.status === 'failed' && '✕'}
                {execution.status === 'running' && '⟳'}
                {execution.status === 'cancelled' && '⊘'}
              </span>
              <span className="status-text">{execution.status}</span>
            </div>

            {execution.results && (
              <div className="execution-results">
                <h3>Results</h3>
                <pre className="results-json">
                  {JSON.stringify(execution.results, null, 2)}
                </pre>
              </div>
            )}

            {execution.error && (
              <div className="execution-error">
                <h3>Error</h3>
                <p>{execution.error}</p>
              </div>
            )}

            <div className="workflow-actions">
              <button className="btn btn-secondary" onClick={() => setView('list')}>
                ← Back to Workflows
              </button>
              {execution.status === 'completed' && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setView('detail');
                    setExecution(null);
                  }}
                >
                  Run Again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
