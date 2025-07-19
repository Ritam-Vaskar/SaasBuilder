# Suprathon SaaS Builder

## Overview
Suprathon is a multi-tenant SaaS builder platform that enables users to create, customize, and deploy web applications with ease. It features a drag-and-drop app builder, AI-powered assistant for widget suggestions and layout optimization, and robust data management capabilities.

## Features

### 1. App Builder
- Drag-and-drop interface to add and arrange widgets/components.
- Supports various widget types including text, buttons, forms, tables, charts, calendars, kanban boards, file uploads, timers, counters, images, videos, maps, and ratings.
- Customizable properties panel for each widget to adjust content, styling, position, and behavior.
- Real-time preview mode to see the app as it will appear to end users.

### 2. AI Assistant
- AI-powered widget suggestions based on app type and description.
- Template generation to quickly scaffold app layouts.
- Layout optimization to improve usability and design based on AI analysis.

### 3. Data Management
- Dynamic form components to collect user input.
- Data tables to display and manage collected data.
- Backend API for storing and retrieving app data per user and app.

### 4. Preview Mode
- Public app preview accessible via unique slug.
- Supports interactive components with live data fetching and submission.
- Responsive layout with theming support including dark mode.

### 5. Backend API
- RESTful API endpoints for app management, data storage, and AI services.
- Authentication and authorization for multi-tenant support.
- Integration with Google Generative AI for advanced AI features.

### 6. Environment Configuration
- Uses environment variables for API base URLs and keys.
- Supports local development and production deployment configurations.

## Getting Started

### Prerequisites
- Node.js (>=16.0.0)
- npm 

### Installation
1. Clone the repository.
2. Navigate to the project directory.
3. Install server dependencies:
   ```bash
   cd server
   npm install
   ```
4. Install client dependencies:
   ```bash
   cd ../src
   npm install
   ```
5. Configure environment variables in `.env` files.

### Running the Project
- Start the backend server:
  ```bash
  npm run dev
  ```
- Start the frontend development server:
  ```bash
  npm run dev
  ```

## Usage
- Use the app builder interface to create and customize your app.
- Use the AI Assistant panel to get widget suggestions, generate templates, and optimize layouts.
- Preview your app in real-time and share the public preview link.

## Contributing
Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.
