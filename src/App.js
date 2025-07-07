import React, { useMemo, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import Palette from './components/Palette';
import Canvas from './components/Canvas';
import PropertyEditor from './components/PropertyEditor';
import { useFormStore } from './store/useFormStore';

// Generate JSON Schema (schema.json)
function generateJsonSchema(components) {
  const properties = {};
  const required = [];
  components.forEach((c) => {
    const { type, config } = c;
    let prop = {};
    switch (type) {
      case 'text':
      case 'textarea':
        prop.type = 'string';
        break;
      case 'number':
        prop.type = 'number';
        break;
      case 'checkbox':
        prop.type = 'boolean';
        break;
      case 'radio':
      case 'dropdown':
        prop.type = 'string';
        if (Array.isArray(config.options)) {
          prop.enum = config.options;
        }
        break;
      case 'date':
        prop.type = 'string';
        prop.format = 'date';
        break;
      default:
        prop.type = 'string';
    }
    if (config.label) prop.title = config.label;
    if (config.placeholder) prop.description = config.placeholder;
    properties[config.name] = prop;
    if (config.required) required.push(config.name);
  });
  const schema = {
    type: 'object',
    properties,
  };
  if (required.length > 0) schema.required = required;
  return schema;
}

// Generate UI Schema (uischema.json)
function generateUiSchema(components) {
  return {
    type: 'VerticalLayout',
    elements: components.map((c) => ({
      type: 'Control',
      scope: `#/properties/${c.config.name}`,
    })),
  };
}

function App() {
  const addComponent = useFormStore((state) => state.addComponent);
  const moveComponent = useFormStore((state) => state.moveComponent);
  const components = useFormStore((state) => state.components);
  const [preview, setPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('demo'); // 'demo', 'schema', 'uischema', 'data'
  const [formData, setFormData] = useState({}); // For Data tab (optional, can be improved)

  // Handles both adding new components and reordering
  const handleDragEnd = (event) => {
    const { over, active } = event;
    // Add from palette
    if (over && over.id === 'canvas-drop') {
      const { componentType } = active.data.current || {};
      if (componentType) {
        addComponent(componentType);
        return;
      }
    }
    // Reorder
    if (active && over && active.id !== over.id) {
      const oldIndex = components.findIndex(c => c.id === active.id);
      const newIndex = components.findIndex(c => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        moveComponent(oldIndex, newIndex);
      }
    }
  };

  const handleDragStart = () => {};

  const jsonSchema = useMemo(() => generateJsonSchema(components), [components]);
  const uiSchema = useMemo(() => generateUiSchema(components), [components]);

  const handleCopy = (data) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  const handleExport = () => {
    // Download schema.json
    const schemaBlob = new Blob([JSON.stringify(jsonSchema, null, 2)], { type: 'application/json' });
    const schemaUrl = URL.createObjectURL(schemaBlob);
    const a1 = document.createElement('a');
    a1.href = schemaUrl;
    a1.download = 'schema.json';
    a1.click();
    URL.revokeObjectURL(schemaUrl);
    // Download uischema.json
    const uiBlob = new Blob([JSON.stringify(uiSchema, null, 2)], { type: 'application/json' });
    const uiUrl = URL.createObjectURL(uiBlob);
    const a2 = document.createElement('a');
    a2.href = uiUrl;
    a2.download = 'uischema.json';
    a2.click();
    URL.revokeObjectURL(uiUrl);
  };

  // Tab button style helper
  const tabBtn = (tab) =>
    `px-4 py-2 font-semibold border-b-2 transition-colors duration-150 ${
      activeTab === tab
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
    }`;

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div className="flex flex-col w-full min-h-screen overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between bg-blue-900 text-white px-6 py-3">
          <div className="text-lg font-bold tracking-wide">JSON Form Builder</div>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded ${preview ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
              onClick={() => setPreview((p) => !p)}
            >
              {preview ? 'Exit Preview' : 'Preview'}
            </button>
            <button
              className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600"
              onClick={handleExport}
            >
              Export
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex border-b bg-white px-6">
          <button className={tabBtn('demo')} onClick={() => setActiveTab('demo')}>Demo</button>
          <button className={tabBtn('schema')} onClick={() => setActiveTab('schema')}>Schema</button>
          <button className={tabBtn('uischema')} onClick={() => setActiveTab('uischema')}>UI Schema</button>
        </div>
        <div className="flex w-full flex-1 overflow-hidden">
          {!preview && (
            <aside className="w-[20%] min-w-[200px] max-w-[250px] bg-gray-100 border-r">
              <Palette />
            </aside>
          )}
          <main className="w-[60%] flex-grow bg-white overflow-y-auto flex flex-col">
            {/* Tab Content */}
            {activeTab === 'demo' && (
              <Canvas preview={preview} onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
            )}
            {activeTab === 'schema' && (
              <div className="mt-6 p-4 bg-gray-100 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Live JSON Schema</h3>
                  <button
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    onClick={() => handleCopy(jsonSchema)}
                  >
                    Copy
                  </button>
                </div>
                <pre className="text-xs bg-gray-900 text-green-200 rounded p-2 overflow-x-auto">
                  {JSON.stringify(jsonSchema, null, 2)}
                </pre>
                <button
                  className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  onClick={handleExport}
                >
                  Export Schema & UI Schema
                </button>
              </div>
            )}
            {activeTab === 'uischema' && (
              <div className="mt-6 p-4 bg-gray-100 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Live UI Schema</h3>
                  <button
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    onClick={() => handleCopy(uiSchema)}
                  >
                    Copy
                  </button>
                </div>
                <pre className="text-xs bg-gray-900 text-blue-200 rounded p-2 overflow-x-auto">
                  {JSON.stringify(uiSchema, null, 2)}
                </pre>
                <button
                  className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  onClick={handleExport}
                >
                  Export Schema & UI Schema
                </button>
              </div>
            )}
          </main>
          {!preview && (
            <aside className="w-[20%] min-w-[200px] max-w-[300px] bg-gray-50 border-l">
              <PropertyEditor />
            </aside>
          )}
        </div>
      </div>
    </DndContext>
  );
}

export default App;
