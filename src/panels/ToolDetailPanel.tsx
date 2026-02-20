import { useFlowStore } from '../store/flowStore';
import { FLOW_COLORS, RISK_COLORS } from '../data/types';
import { getToolById } from '../data/tools';

export default function ToolDetailPanel() {
  const { selectedTool, isPanelOpen, togglePanel, setExecutionState } = useFlowStore();

  if (!selectedTool || !isPanelOpen) return null;

  const flowStyle = FLOW_COLORS[selectedTool.flowType];
  const riskStyle = RISK_COLORS[selectedTool.riskLevel];
  const chainTargets = selectedTool.canChainTo.map(id => getToolById(id)).filter(Boolean);

  const handleRun = async () => {
    setExecutionState(selectedTool.id, 'running');
    // Simulate execution
    setTimeout(() => {
      setExecutionState(selectedTool.id, 'success');
      setTimeout(() => {
        setExecutionState(selectedTool.id, 'idle');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="tool-panel">
      <div className="panel-header">
        <div className="panel-title-area">
          <span
            className="panel-icon"
            style={{ background: flowStyle.bg, borderColor: flowStyle.border }}
          >
            {selectedTool.icon}
          </span>
          <div>
            <h2 className="panel-title">{selectedTool.name}</h2>
            <p className="panel-subtitle">{selectedTool.description}</p>
          </div>
        </div>
        <button className="panel-close" onClick={() => togglePanel(false)}>
          ×
        </button>
      </div>

      <div className="panel-badges">
        <span
          className="badge"
          style={{ background: flowStyle.bg, color: flowStyle.border }}
        >
          {flowStyle.icon} {selectedTool.flowType}
        </span>
        <span
          className="badge"
          style={{ background: riskStyle.bg, color: riskStyle.text }}
        >
          {selectedTool.riskLevel.toUpperCase()}
        </span>
        {selectedTool.requiresApproval && (
          <span className="badge approval-badge">🔒 Requires Approval</span>
        )}
      </div>

      {/* Data Flow Visualization */}
      <div className="panel-section">
        <h3 className="section-title">Data Flow</h3>
        <div className="flow-viz">
          <div className="flow-node">
            <span className="flow-label">
              {selectedTool.flowType === 'inbound' ? '🌐 External' : '📥 Input'}
            </span>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-node current">
            <span>{selectedTool.icon}</span>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-node">
            <span className="flow-label">
              {selectedTool.flowType === 'outbound' ? '🌐 External' : '📤 Output'}
            </span>
          </div>
        </div>
      </div>

      {/* Inputs */}
      {selectedTool.inputs.length > 0 && (
        <div className="panel-section">
          <h3 className="section-title">Inputs</h3>
          <div className="input-fields">
            {selectedTool.inputs.map(input => (
              <div key={input.name} className="input-field">
                <label className="input-label">
                  {input.name}
                  {input.required && <span className="required">*</span>}
                  <span className="input-type">{input.type}</span>
                </label>
                {input.description && (
                  <p className="input-help">{input.description}</p>
                )}
                {input.type === 'string' && (
                  <input
                    type="text"
                    className="text-input"
                    placeholder={input.default?.toString() || `Enter ${input.name}`}
                  />
                )}
                {input.type === 'number' && (
                  <input
                    type="number"
                    className="text-input"
                    defaultValue={input.default as number}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outputs */}
      <div className="panel-section">
        <h3 className="section-title">Returns</h3>
        <div className="output-schema">
          {selectedTool.outputs.map(output => (
            <div key={output.name} className="output-item">
              <span className="output-name">{output.name}</span>
              <span className="output-type">{output.type}</span>
              {output.description && (
                <span className="output-desc">{output.description}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chain To */}
      {chainTargets.length > 0 && (
        <div className="panel-section">
          <h3 className="section-title">Pass results to...</h3>
          <div className="chain-targets">
            {chainTargets.map(target => target && (
              <div key={target.id} className="chain-target">
                <span className="chain-icon">{target.icon}</span>
                <span className="chain-name">{target.name}</span>
                <span className="chain-flow">→ {target.flowType}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="panel-actions">
        <button className="btn btn-secondary">Save as Template</button>
        <button
          className="btn btn-primary"
          onClick={handleRun}
        >
          Run Tool
        </button>
      </div>
    </div>
  );
}
