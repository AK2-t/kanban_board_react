# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm start

# Build production version
npm run build

# Run tests
npm test
```

## Architecture Overview

This is a React TypeScript kanban board application with the following architecture:

### State Management
- **BoardContext**: Central state management using React Context API
- **ThemeContext**: Manages dark/light mode state
- All state persisted to localStorage automatically

### Data Structure
- **AppData**: Top-level container with tasks, boards, and board order
- **Board**: Contains columns and column order
- **Column**: Contains task IDs in order
- **Task**: Individual task with metadata (priority, labels, assignee, etc.)
- **CustomLabel**: Reusable labels with color coding

### Key Components
- **App.tsx**: Main layout with Header, BoardSelector, Dashboard, and KanbanBoard
- **KanbanBoard**: Renders columns and handles drag-and-drop
- **TaskCard**: Individual task display with priority colors
- **TaskForm/TaskDetails**: Task creation and editing modals
- **Dashboard**: Contains TaskFilter, LabelManager, and Statistics

### Technology Stack
- React 18 with TypeScript
- Material-UI for components and theming
- React Beautiful DnD for drag-and-drop functionality
- Styled Components for custom styling
- React Color for color picker
- UUID for ID generation

### Data Flow
1. BoardContext provides all CRUD operations for boards, columns, tasks, and labels
2. All changes automatically sync to localStorage
3. Components consume context via useBoard() hook
4. Drag-and-drop operations update task positions and column assignments

### Key Patterns
- Context providers wrap the entire app in index.tsx
- All IDs are UUIDs generated with uuid library
- Task movement updates both task.columnId and column.taskIds arrays
- Labels are managed separately from boards/tasks for reusability