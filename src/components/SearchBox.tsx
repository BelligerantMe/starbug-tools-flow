import { useState, useEffect, useRef, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { tools } from '../data/tools';
import { useFlowStore } from '../store/flowStore';
import { FLOW_COLORS } from '../data/types';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setCenter, getZoom } = useReactFlow();
  const { nodes, selectTool } = useFlowStore();

  // Filter tools based on query
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return tools.filter(
      tool =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.flowType.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle keyboard shortcut (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle selection
  const handleSelect = (toolId: string) => {
    const node = nodes.find(n => n.id === toolId);
    if (node) {
      // Center on the node
      setCenter(node.position.x + 120, node.position.y + 80, {
        zoom: Math.max(getZoom(), 0.8),
        duration: 500,
      });
      // Select the tool
      selectTool(toolId);
    }
    setQuery('');
    setIsOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(results[selectedIndex].id);
    }
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Search tools..."
          className="search-input"
        />
        <kbd className="search-shortcut">⌘K</kbd>
      </div>

      {isOpen && results.length > 0 && (
        <div className="search-results">
          {results.map((tool, index) => {
            const flowStyle = FLOW_COLORS[tool.flowType];
            return (
              <div
                key={tool.id}
                className={`search-result ${index === selectedIndex ? 'selected' : ''}`}
                onMouseDown={() => handleSelect(tool.id)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span
                  className="result-icon"
                  style={{ background: flowStyle.bg, borderColor: flowStyle.border }}
                >
                  {tool.icon}
                </span>
                <div className="result-content">
                  <div className="result-name">{tool.name}</div>
                  <div className="result-desc">{tool.description}</div>
                </div>
                <span
                  className="result-flow"
                  style={{ color: flowStyle.border }}
                >
                  {tool.flowType}
                </span>
              </div>
            );
          })}
          <div className="search-hint">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>esc Close</span>
          </div>
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="search-results">
          <div className="search-empty">No tools found for "{query}"</div>
        </div>
      )}
    </div>
  );
}
