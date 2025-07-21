# JSON Form Builder

A dynamic, drag-and-drop form builder built with React. This tool allows users to visually design forms, instantly view the generated JSON Schema and UI Schema, and export them for use in other applications.

## Features

- Drag-and-drop Canvas: Build forms visually by dragging components from the palette.
- Live JSON Schema & UI Schema: Instantly see the generated schemas as you edit the form.
- Tabbed Interface: Switch between Demo, Schema, and UI Schema views.
- Export Functionality: Download the current schema and UI schema as JSON files.
- Customizable Components: Add, edit, and reorder form fields.
- Preview Mode: Switch to preview mode to see the form as an end user would, with all editing features hidden.

### Available Components
- Text Input
- Textarea
- Number Input
- Checkbox
- Radio Group
- Dropdown
- Date Picker

## UI Schema Layout Information
The exported UI Schema now includes a `layout` property for each field, containing `x`, `y`, `w`, and `h` (grid position and size). This allows you to rehydrate the exact visual layout of the form elsewhere if needed.

## Getting Started

### Prerequisites
- Node.js (v14 or higher recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Running the App
```bash
npm start
```
The app will be available at `http://localhost:3001` by default.

## Initial Setup Commands
These are the commands used to set up the project from scratch:

```bash
npx create-react-app my-form-app
cd my-form-app
npm start
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D tailwindcss@3.4.1 postcss autoprefixer
npx tailwindcss init -p
npm install @dnd-kit/core @dnd-kit/sortable
npm install zustand
```

## Usage
1. Add Components: Drag form elements from the Component Palette onto the canvas.
2. Edit Properties: Select a component to edit its properties in the Property Editor.
3. View Schemas: Use the tabs to view the live JSON Schema and UI Schema.
4. Preview: Use the Preview button to see the form as an end user would.
5. Export: Click the Export button to download the current schemas.

## Project Structure
- `src/components/` — Main UI components (Canvas, Palette, PropertyEditor)
- `src/store/` — State management for form components
- `src/utils/` — Utility constants and helpers
- `src/App.js` — Main application logic and layout
