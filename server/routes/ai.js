const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Mock AI responses for demo (replace with actual AI integration)
const mockAIResponses = {
  widgetSuggestions: {
    todo: [
      { type: 'form', name: 'Task Creator', description: 'Form to add new tasks' },
      { type: 'table', name: 'Task List', description: 'Table displaying all tasks' },
      { type: 'chart', name: 'Progress Chart', description: 'Visual progress tracking' },
      { type: 'timer', name: 'Focus Timer', description: 'Pomodoro timer for tasks' }
    ],
    crm: [
      { type: 'form', name: 'Contact Form', description: 'Add new contacts' },
      { type: 'table', name: 'Contact List', description: 'Display all contacts' },
      { type: 'chart', name: 'Sales Pipeline', description: 'Visual sales tracking' },
      { type: 'calendar', name: 'Meeting Scheduler', description: 'Schedule meetings' }
    ]
  },
  templates: {
    todo: {
      name: 'Task Management App',
      description: 'Complete task management solution',
      layout: {
        components: [
          {
            id: 'task-form',
            type: 'form',
            position: { x: 0, y: 0, width: 400, height: 200 },
            props: {
              title: 'Add New Task',
              fields: [
                { name: 'title', type: 'text', label: 'Task Title', required: true },
                { name: 'description', type: 'textarea', label: 'Description' },
                { name: 'priority', type: 'select', label: 'Priority', options: ['Low', 'Medium', 'High'] },
                { name: 'dueDate', type: 'date', label: 'Due Date' }
              ]
            }
          },
          {
            id: 'task-list',
            type: 'table',
            position: { x: 420, y: 0, width: 600, height: 400 },
            props: {
              title: 'My Tasks',
              columns: ['Title', 'Priority', 'Due Date', 'Status'],
              sortable: true,
              filterable: true
            }
          }
        ]
      }
    }
  }
};

// Get widget suggestions
router.post('/suggest-widgets', authMiddleware, async (req, res) => {
  try {
    const { appType, description } = req.body;
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const suggestions = mockAIResponses.widgetSuggestions[appType] || [
      { type: 'text', name: 'Text Block', description: 'Add informational text' },
      { type: 'button', name: 'Action Button', description: 'Interactive button' },
      { type: 'form', name: 'Data Form', description: 'Collect user input' }
    ];
    
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

// Generate template
router.post('/generate-template', authMiddleware, async (req, res) => {
  try {
    const { appType, description } = req.body;
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const template = mockAIResponses.templates[appType] || {
      name: 'Custom App',
      description: 'Custom application template',
      layout: {
        components: [
          {
            id: 'welcome-text',
            type: 'text',
            position: { x: 0, y: 0, width: 400, height: 100 },
            props: {
              content: 'Welcome to your custom app!',
              fontSize: 'large',
              textAlign: 'center'
            }
          }
        ]
      }
    };
    
    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

// Optimize layout
router.post('/optimize-layout', authMiddleware, async (req, res) => {
  try {
    const { components } = req.body;
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const optimizedLayout = {
      suggestions: [
        'Consider grouping related widgets closer together',
        'Add more spacing between form elements',
        'Use consistent widget sizes for better visual hierarchy'
      ],
      improvements: components.map(comp => ({
        ...comp,
        position: {
          ...comp.position,
          x: Math.max(0, comp.position.x),
          y: Math.max(0, comp.position.y)
        }
      }))
    };
    
    res.json({ optimizedLayout });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

module.exports = router;