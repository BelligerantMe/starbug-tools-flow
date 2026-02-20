/**
 * Pre-defined workflow templates
 * These match the workflows defined in the backend workflow_engine.py
 */

export interface WorkflowStep {
  id: string;
  tool: string;
  action: string;
  description: string;
  requiresApproval: boolean;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'communication' | 'research' | 'system' | 'automation';
  steps: WorkflowStep[];
  requiredInputs: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'consultation_response',
    name: 'Consultation Request Response',
    description: 'Read prospective client email, get calendar availability, compose personalized response with available times',
    icon: '📧',
    category: 'communication',
    steps: [
      {
        id: 'read_email',
        tool: 'gmail',
        action: 'read_message',
        description: 'Read the incoming email',
        requiresApproval: false,
      },
      {
        id: 'get_availability',
        tool: 'calendar',
        action: 'get_availability',
        description: 'Get available time slots for next 7 days (Mon-Thu 10am-7pm)',
        requiresApproval: false,
      },
      {
        id: 'compose_response',
        tool: 'internal',
        action: 'render_template',
        description: 'Compose personalized response with availability',
        requiresApproval: false,
      },
      {
        id: 'send_response',
        tool: 'gmail',
        action: 'send_message',
        description: 'Send the response email',
        requiresApproval: true,
      },
    ],
    requiredInputs: [
      {
        name: 'message_id',
        type: 'string',
        description: 'Gmail message ID to respond to',
        required: true,
      },
    ],
  },
  {
    id: 'client_research',
    name: 'Client Research',
    description: 'Research information based on client needs and save findings to notes',
    icon: '🔍',
    category: 'research',
    steps: [
      {
        id: 'search_web',
        tool: 'web_search',
        action: 'search',
        description: 'Search the web for relevant information',
        requiresApproval: false,
      },
      {
        id: 'save_findings',
        tool: 'notes',
        action: 'create',
        description: 'Save research findings to notes',
        requiresApproval: false,
      },
    ],
    requiredInputs: [
      {
        name: 'query',
        type: 'string',
        description: 'Research query or topic',
        required: true,
      },
    ],
  },
  {
    id: 'system_health_report',
    name: 'System Health Report',
    description: 'Check system health and email a summary report',
    icon: '💻',
    category: 'system',
    steps: [
      {
        id: 'check_health',
        tool: 'system_health',
        action: 'check',
        description: 'Get system health metrics',
        requiresApproval: false,
      },
      {
        id: 'save_report',
        tool: 'notes',
        action: 'create',
        description: 'Save health report to notes',
        requiresApproval: false,
      },
      {
        id: 'send_alert',
        tool: 'gmail',
        action: 'send_message',
        description: 'Email health report (if issues found)',
        requiresApproval: true,
      },
    ],
    requiredInputs: [],
  },
  {
    id: 'daily_briefing',
    name: 'Daily Briefing',
    description: 'Compile daily briefing with news, weather, calendar, and tasks',
    icon: '📊',
    category: 'automation',
    steps: [
      {
        id: 'get_news',
        tool: 'get_news',
        action: 'fetch',
        description: 'Fetch latest news',
        requiresApproval: false,
      },
      {
        id: 'get_weather',
        tool: 'weather',
        action: 'current',
        description: 'Get current weather',
        requiresApproval: false,
      },
      {
        id: 'get_calendar',
        tool: 'calendar',
        action: 'list_events',
        description: "Get today's calendar events",
        requiresApproval: false,
      },
      {
        id: 'get_tasks',
        tool: 'task_manager',
        action: 'list',
        description: 'Get pending tasks',
        requiresApproval: false,
      },
      {
        id: 'compile_briefing',
        tool: 'bigpicture',
        action: 'compile',
        description: 'Compile into daily briefing',
        requiresApproval: false,
      },
    ],
    requiredInputs: [],
  },
];

// Helper to get workflow by ID
export const getWorkflowById = (id: string): WorkflowTemplate | undefined =>
  workflowTemplates.find(w => w.id === id);

// Helper to get workflows by category
export const getWorkflowsByCategory = (category: string): WorkflowTemplate[] =>
  workflowTemplates.filter(w => w.category === category);
