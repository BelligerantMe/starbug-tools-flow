import type { Tool } from './types';

export const tools: Tool[] = [
  // INBOUND TOOLS
  {
    id: 'web_search',
    name: 'web_search',
    description: 'Search the web using DuckDuckGo for current information',
    flowType: 'inbound',
    riskLevel: 'low',
    icon: '🔍',
    requiresApproval: false,
    inputs: [
      { name: 'query', type: 'string', required: true, description: 'Search query' },
      { name: 'max_results', type: 'number', required: false, default: 10 },
    ],
    outputs: [
      { name: 'results', type: 'json', required: true, description: 'Array of search results' },
    ],
    canChainTo: ['notes', 'gmail', 'bigpicture'],
  },
  {
    id: 'get_news',
    name: 'get_news',
    description: 'Fetch latest news articles from configured RSS feeds',
    flowType: 'inbound',
    riskLevel: 'low',
    icon: '📰',
    requiresApproval: false,
    inputs: [
      { name: 'topic', type: 'string', required: false, description: 'Filter by topic' },
    ],
    outputs: [
      { name: 'articles', type: 'json', required: true, description: 'Array of news articles' },
    ],
    canChainTo: ['notes', 'gmail', 'bigpicture'],
  },
  {
    id: 'external_info',
    name: 'external_info',
    description: 'Search web, Wikipedia, news feeds, weather, GitHub, Reddit, YouTube',
    flowType: 'inbound',
    riskLevel: 'low',
    icon: '🌐',
    requiresApproval: false,
    inputs: [
      { name: 'query', type: 'string', required: true },
      { name: 'source', type: 'string', required: false, description: 'wikipedia, weather, github, etc.' },
    ],
    outputs: [
      { name: 'data', type: 'json', required: true },
    ],
    canChainTo: ['notes', 'gmail', 'bigpicture'],
  },
  {
    id: 'github_search',
    name: 'github_search',
    description: 'Search GitHub repositories for code patterns, libraries, or implementations',
    flowType: 'inbound',
    riskLevel: 'low',
    icon: '📦',
    requiresApproval: false,
    inputs: [
      { name: 'query', type: 'string', required: true },
      { name: 'language', type: 'string', required: false },
    ],
    outputs: [
      { name: 'repos', type: 'json', required: true, description: 'Array of repositories' },
    ],
    canChainTo: ['notes', 'gmail', 'code_change'],
  },
  {
    id: 'weather',
    name: 'weather',
    description: 'Get current weather conditions and forecast for any location',
    flowType: 'inbound',
    riskLevel: 'low',
    icon: '🌤',
    requiresApproval: false,
    inputs: [
      { name: 'location', type: 'string', required: false, description: 'City or coordinates' },
    ],
    outputs: [
      { name: 'conditions', type: 'json', required: true },
    ],
    canChainTo: ['notes', 'gmail', 'calendar'],
  },
  {
    id: 'model_search',
    name: 'model_search',
    description: 'Search 3D model repositories (Thingiverse, Printables, MyMiniFactory)',
    flowType: 'inbound',
    riskLevel: 'low',
    icon: '🎨',
    requiresApproval: false,
    inputs: [
      { name: 'query', type: 'string', required: true },
    ],
    outputs: [
      { name: 'models', type: 'json', required: true },
    ],
    canChainTo: ['notes', 'gmail'],
  },
  {
    id: 'file_reader',
    name: 'file_reader',
    description: 'Read a file within the project directory (path-validated, 50KB max)',
    flowType: 'inbound',
    riskLevel: 'low',
    icon: '📄',
    requiresApproval: false,
    inputs: [
      { name: 'path', type: 'string', required: true },
    ],
    outputs: [
      { name: 'content', type: 'string', required: true },
    ],
    canChainTo: ['notes', 'gmail', 'code_change'],
  },

  // BIDIRECTIONAL TOOLS
  {
    id: 'gmail',
    name: 'gmail',
    description: 'Read, search, and send Gmail messages',
    flowType: 'bidirectional',
    riskLevel: 'high',
    icon: '📧',
    requiresApproval: false,
    inputs: [
      { name: 'action', type: 'string', required: true, description: 'read, search, or send' },
      { name: 'query', type: 'string', required: false, description: 'For search action' },
      { name: 'to', type: 'string', required: false, description: 'For send action' },
      { name: 'subject', type: 'string', required: false },
      { name: 'body', type: 'string', required: false },
    ],
    outputs: [
      { name: 'messages', type: 'json', required: false, description: 'For read/search' },
      { name: 'sent', type: 'boolean', required: false, description: 'For send action' },
    ],
    canChainTo: ['notes', 'reminder', 'task_manager'],
  },
  {
    id: 'calendar',
    name: 'calendar',
    description: 'View, create, and manage Google Calendar events. Get availability for scheduling.',
    flowType: 'bidirectional',
    riskLevel: 'medium',
    icon: '📅',
    requiresApproval: false,
    inputs: [
      { name: 'action', type: 'string', required: true, description: 'list_events, get_availability, create_event, delete_event' },
      { name: 'days_ahead', type: 'number', required: false, description: 'Days to look ahead (default: 7)' },
      { name: 'slot_duration_minutes', type: 'number', required: false, description: 'Slot size for availability (default: 60)' },
      { name: 'date', type: 'string', required: false, description: 'Event date YYYY-MM-DD' },
      { name: 'time', type: 'string', required: false, description: 'Event time HH:MM' },
      { name: 'title', type: 'string', required: false },
      { name: 'duration_minutes', type: 'number', required: false },
    ],
    outputs: [
      { name: 'events', type: 'json', required: false, description: 'List of calendar events' },
      { name: 'availability', type: 'json', required: false, description: 'Available time slots' },
      { name: 'created', type: 'json', required: false, description: 'Created event details' },
    ],
    canChainTo: ['notes', 'gmail'],
  },

  // INTERNAL TOOLS
  {
    id: 'notes',
    name: 'notes',
    description: 'Quick notes with full-text search — your second brain for facts, ideas, and references',
    flowType: 'internal',
    riskLevel: 'low',
    icon: '📝',
    requiresApproval: false,
    inputs: [
      { name: 'action', type: 'string', required: true, description: 'search, create, or list' },
      { name: 'query', type: 'string', required: false },
      { name: 'content', type: 'string', required: false },
    ],
    outputs: [
      { name: 'notes', type: 'json', required: true },
    ],
    canChainTo: ['gmail', 'bigpicture'],
  },
  {
    id: 'personal_info',
    name: 'personal_info',
    description: 'Store and recall personal information, contacts, and preferences (personal CRM)',
    flowType: 'internal',
    riskLevel: 'low',
    icon: '👤',
    requiresApproval: false,
    inputs: [
      { name: 'action', type: 'string', required: true },
      { name: 'query', type: 'string', required: false },
    ],
    outputs: [
      { name: 'data', type: 'json', required: true },
    ],
    canChainTo: ['gmail', 'calendar'],
  },
  {
    id: 'reminder',
    name: 'reminder',
    description: 'Set, list, and cancel reminders with relative time expressions',
    flowType: 'internal',
    riskLevel: 'low',
    icon: '⏰',
    requiresApproval: false,
    inputs: [
      { name: 'action', type: 'string', required: true },
      { name: 'message', type: 'string', required: false },
      { name: 'when', type: 'string', required: false, description: 'e.g., "in 2 hours"' },
    ],
    outputs: [
      { name: 'reminders', type: 'json', required: true },
    ],
    canChainTo: ['gmail', 'calendar'],
  },
  {
    id: 'task_manager',
    name: 'task_manager',
    description: 'Personal task/todo management with CRUD operations',
    flowType: 'internal',
    riskLevel: 'medium',
    icon: '✓',
    requiresApproval: false,
    inputs: [
      { name: 'action', type: 'string', required: true },
      { name: 'task', type: 'string', required: false },
      { name: 'status', type: 'string', required: false },
    ],
    outputs: [
      { name: 'tasks', type: 'json', required: true },
    ],
    canChainTo: ['gmail', 'calendar', 'bigpicture'],
  },
  {
    id: 'calculator',
    name: 'calculator',
    description: 'Safe math evaluation and unit conversions (temperature, distance, weight, volume)',
    flowType: 'internal',
    riskLevel: 'low',
    icon: '🧮',
    requiresApproval: false,
    inputs: [
      { name: 'expression', type: 'string', required: true },
    ],
    outputs: [
      { name: 'result', type: 'string', required: true },
    ],
    canChainTo: ['notes', 'gmail'],
  },
  {
    id: 'audit_logger',
    name: 'audit_logger',
    description: 'Append-only audit trail for AI actions. Log actions with context and query audit',
    flowType: 'internal',
    riskLevel: 'low',
    icon: '📋',
    requiresApproval: false,
    inputs: [
      { name: 'action', type: 'string', required: true },
      { name: 'query', type: 'string', required: false },
    ],
    outputs: [
      { name: 'logs', type: 'json', required: true },
    ],
    canChainTo: ['bigpicture'],
  },

  // OUTBOUND TOOLS (terminal - can't chain further, except code_change)
  {
    id: 'code_change',
    name: 'code_change',
    description: 'Propose a code modification to be applied after user approval',
    flowType: 'outbound',
    riskLevel: 'medium',
    icon: '💻',
    requiresApproval: true,
    inputs: [
      { name: 'file', type: 'string', required: true },
      { name: 'changes', type: 'string', required: true },
      { name: 'description', type: 'string', required: true },
    ],
    outputs: [
      { name: 'applied', type: 'boolean', required: true },
    ],
    canChainTo: ['code_quality_check'],
  },

  // META TOOLS
  {
    id: 'system_health',
    name: 'system_health',
    description: 'Get system health information including CPU, memory, disk, and service status',
    flowType: 'meta',
    riskLevel: 'low',
    icon: '💻',
    requiresApproval: false,
    inputs: [],
    outputs: [
      { name: 'metrics', type: 'json', required: true },
    ],
    canChainTo: ['notes', 'gmail', 'bigpicture'],
  },
  {
    id: 'system_introspection',
    name: 'system_introspection',
    description: 'Query current system state including services, models, and metrics',
    flowType: 'meta',
    riskLevel: 'low',
    icon: '🔬',
    requiresApproval: false,
    inputs: [
      { name: 'query', type: 'string', required: false },
    ],
    outputs: [
      { name: 'state', type: 'json', required: true },
    ],
    canChainTo: ['notes', 'bigpicture'],
  },
  {
    id: 'bigpicture',
    name: 'bigpicture',
    description: 'Get project status, pending tasks, and daily insights from Big Picture',
    flowType: 'meta',
    riskLevel: 'low',
    icon: '📊',
    requiresApproval: false,
    inputs: [],
    outputs: [
      { name: 'summary', type: 'json', required: true },
    ],
    canChainTo: ['notes', 'gmail'],
  },
  {
    id: 'starbug_guide',
    name: 'starbug_guide',
    description: "Interactive guide to Starbug's capabilities, tools, and features",
    flowType: 'meta',
    riskLevel: 'low',
    icon: '📖',
    requiresApproval: false,
    inputs: [
      { name: 'topic', type: 'string', required: false },
    ],
    outputs: [
      { name: 'guide', type: 'string', required: true },
    ],
    canChainTo: [],
  },
  {
    id: 'git_evidence',
    name: 'git_evidence',
    description: 'Read-only git queries for evidence gathering. Get status, diffs, logs, and file history',
    flowType: 'meta',
    riskLevel: 'low',
    icon: '📂',
    requiresApproval: false,
    inputs: [
      { name: 'command', type: 'string', required: true, description: 'status, diff, log, etc.' },
    ],
    outputs: [
      { name: 'output', type: 'string', required: true },
    ],
    canChainTo: ['notes', 'code_change'],
  },
  {
    id: 'code_quality_check',
    name: 'code_quality_check',
    description: 'Run code quality tools (pytest, ruff, mypy) and return quality scores',
    flowType: 'meta',
    riskLevel: 'low',
    icon: '✅',
    requiresApproval: false,
    inputs: [
      { name: 'path', type: 'string', required: false },
    ],
    outputs: [
      { name: 'report', type: 'json', required: true },
    ],
    canChainTo: ['notes', 'gmail', 'code_change'],
  },

  // DANGEROUS META TOOLS
  {
    id: 'shell',
    name: 'shell',
    description: 'Execute a sandboxed shell command (allowlisted commands only)',
    flowType: 'meta',
    riskLevel: 'critical',
    icon: '⚡',
    requiresApproval: true,
    inputs: [
      { name: 'command', type: 'string', required: true },
    ],
    outputs: [
      { name: 'stdout', type: 'string', required: true },
      { name: 'exit_code', type: 'number', required: true },
    ],
    canChainTo: ['notes', 'bigpicture'],
  },
  {
    id: 'service_restart',
    name: 'service_restart',
    description: 'Restart a systemd service (requires user approval)',
    flowType: 'meta',
    riskLevel: 'high',
    icon: '🔄',
    requiresApproval: true,
    inputs: [
      { name: 'service', type: 'string', required: true },
    ],
    outputs: [
      { name: 'status', type: 'string', required: true },
    ],
    canChainTo: ['system_health'],
  },
];

// Helper to get tool by ID
export const getToolById = (id: string): Tool | undefined =>
  tools.find(t => t.id === id);

// Helper to get tools by flow type
export const getToolsByFlowType = (flowType: string): Tool[] =>
  tools.filter(t => t.flowType === flowType);
