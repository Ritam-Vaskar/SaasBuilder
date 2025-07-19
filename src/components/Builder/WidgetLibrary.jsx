import React from 'react';
import { useDrag } from 'react-dnd';
import { 
  Type, 
  MousePointer, 
  FileText, 
  Table, 
  BarChart, 
  Calendar, 
  Columns, 
  Upload, 
  Clock, 
  Hash,
  Image,
  Video,
  Map,
  Star
} from 'lucide-react';

const widgetTypes = [
  { 
    type: 'text', 
    name: 'Text Block', 
    icon: Type, 
    category: 'Content',
    description: 'Rich text with formatting options'
  },
  { 
    type: 'button', 
    name: 'Button', 
    icon: MousePointer, 
    category: 'Interactive',
    description: 'Clickable button with custom actions'
  },
  { 
    type: 'form', 
    name: 'Form', 
    icon: FileText, 
    category: 'Input',
    description: 'Dynamic form with validation'
  },
  { 
    type: 'table', 
    name: 'Data Table', 
    icon: Table, 
    category: 'Data',
    description: 'Sortable and filterable table'
  },
  { 
    type: 'chart', 
    name: 'Chart', 
    icon: BarChart, 
    category: 'Visualization',
    description: 'Various chart types'
  },
  { 
    type: 'calendar', 
    name: 'Calendar', 
    icon: Calendar, 
    category: 'Scheduling',
    description: 'Event calendar with management'
  },
  { 
    type: 'kanban', 
    name: 'Kanban Board', 
    icon: Columns, 
    category: 'Organization',
    description: 'Task board with drag-and-drop'
  },
  { 
    type: 'fileUpload', 
    name: 'File Upload', 
    icon: Upload, 
    category: 'Input',
    description: 'File upload with preview'
  },
  { 
    type: 'timer', 
    name: 'Timer', 
    icon: Clock, 
    category: 'Utility',
    description: 'Countdown and stopwatch'
  },
  { 
    type: 'counter', 
    name: 'Counter', 
    icon: Hash, 
    category: 'Utility',
    description: 'Increment/decrement counter'
  },
  { 
    type: 'image', 
    name: 'Image', 
    icon: Image, 
    category: 'Media',
    description: 'Image with caption and styling'
  },
  { 
    type: 'video', 
    name: 'Video', 
    icon: Video, 
    category: 'Media',
    description: 'Video player with controls'
  },
  { 
    type: 'map', 
    name: 'Map', 
    icon: Map, 
    category: 'Location',
    description: 'Interactive map component'
  },
  { 
    type: 'rating', 
    name: 'Rating', 
    icon: Star, 
    category: 'Interactive',
    description: 'Star rating component'
  }
];

const categories = [...new Set(widgetTypes.map(w => w.category))];

const DraggableWidget = ({ widget }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'widget',
    item: { type: widget.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const IconComponent = widget.icon;

  return (
    <div
      ref={drag}
      className={`bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 p-4 cursor-grab hover:border-blue-500 hover:shadow-md transition-all ${
        isDragging ? 'opacity-50 border-blue-500' : ''
      }`}
    >
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white text-sm">
            {widget.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {widget.category}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
        {widget.description}
      </p>
    </div>
  );
};

const WidgetLibrary = () => {
  const [activeCategory, setActiveCategory] = React.useState(null);

  const filteredWidgets = activeCategory
    ? widgetTypes.filter(widget => widget.category === activeCategory)
    : widgetTypes;

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Widget Library
        </h2>
        
        {/* Category Filter */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Widget Grid */}
        <div className="space-y-3">
          {filteredWidgets.map((widget) => (
            <DraggableWidget key={widget.type} widget={widget} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WidgetLibrary;