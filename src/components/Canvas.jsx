import React from 'react';
import { useFormStore } from '../store/useFormStore';
import GridLayout, { WidthProvider, Responsive } from 'react-grid-layout';
import { useDroppable, useDndMonitor } from '@dnd-kit/core';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const GRID_COLS = 12;
const GRID_ROW_HEIGHT = 60;
const GRID_WIDTH = 900; // px, adjust as needed

const FieldPreview = ({ type, config, value, onChange, fullHeight }) => {
  switch (type) {
    case 'text':
      return (
        <div className="flex flex-col h-full w-full min-h-0">
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <input
            type="text"
            className={`border rounded flex-1 w-full h-full min-h-0 ${fullHeight ? '' : ''}`}
            placeholder={config.placeholder}
            value={value || ''}
            onChange={onChange}
            style={{ minHeight: 0 }}
          />
        </div>
      );
    case 'textarea':
      return (
        <div className="flex flex-col h-full w-full min-h-0">
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <textarea
            className={`border rounded resize-none flex-1 w-full h-full min-h-0 ${fullHeight ? '' : ''}`}
            placeholder={config.placeholder}
            value={value || ''}
            onChange={onChange}
            style={{ minHeight: 0 }}
          />
        </div>
      );
    case 'number':
      return (
        <div className="flex flex-col h-full w-full min-h-0">
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <input
            type="number"
            className={`border rounded flex-1 w-full h-full min-h-0 ${fullHeight ? '' : ''}`}
            placeholder={config.placeholder}
            value={value || ''}
            onChange={onChange}
            style={{ minHeight: 0 }}
          />
        </div>
      );
    case 'checkbox':
      return (
        <div className="flex flex-col h-full w-full items-center justify-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={onChange}
            />
            <span className="font-medium">{config.label}{config.required && ' *'}</span>
          </label>
        </div>
      );
    case 'radio':
      return (
        <div className="flex flex-col h-full w-full justify-center">
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <div className="flex flex-col gap-1 flex-1 justify-center">
            {(config.options || []).map((opt, idx) => (
              <label key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={config.name}
                  value={opt}
                  checked={value === opt}
                  onChange={onChange}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      );
    case 'dropdown':
      return (
        <div className="flex flex-col h-full w-full min-h-0">
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <select
            className={`border rounded flex-1 w-full h-full min-h-0 ${fullHeight ? '' : ''}`}
            value={value || ''}
            onChange={onChange}
            style={{ minHeight: 0 }}
          >
            <option value="">Select...</option>
            {(config.options || []).map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    case 'date':
      return (
        <div className="flex flex-col h-full w-full min-h-0">
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <input
            type="date"
            className={`border rounded flex-1 w-full h-full min-h-0 ${fullHeight ? '' : ''}`}
            value={value || ''}
            onChange={onChange}
            style={{ minHeight: 0 }}
          />
        </div>
      );
    default:
      return <div className="mb-2">{config.label} ({type})</div>;
  }
};

const Canvas = ({ preview = false }) => {
  const { components, selectComponent, selectedId, removeComponent, updateComponentLayout, addComponent } = useFormStore();
  const [formData, setFormData] = React.useState({});
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (!preview) setFormData({});
  }, [preview, components.length]);

  const handleValueChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // dnd-kit drop support for Palette -> Canvas
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop' });
  useDndMonitor({
    onDragEnd(event) {
      const { over, active } = event;
      if (over && over.id === 'canvas-drop' && active.data?.current?.componentType) {
        // Calculate grid x/y from mouse position
        const clientOffset = event.delta ? event.delta : { x: 0, y: 0 };
        let x = 0, y = 0;
        if (canvasRef.current && event.activatorEvent && event.activatorEvent.clientX) {
          const rect = canvasRef.current.getBoundingClientRect();
          const px = event.activatorEvent.clientX - rect.left;
          const py = event.activatorEvent.clientY - rect.top;
          x = Math.floor((px / GRID_WIDTH) * GRID_COLS);
          y = Math.floor(py / GRID_ROW_HEIGHT);
        }
        // Add the new component at calculated grid position
        addComponent(active.data.current.componentType, { x, y });
      }
    }
  });

  // Prepare layout for react-grid-layout
  const layout = components.map((comp, idx) => ({
    i: comp.id,
    x: comp.layout?.x ?? (idx % 6),
    y: comp.layout?.y ?? Math.floor(idx / 6),
    w: comp.layout?.w ?? 4,
    h: comp.layout?.h ?? 2,
  }));

  const onLayoutChange = (newLayout) => {
    newLayout.forEach(l => {
      updateComponentLayout(l.i, { x: l.x, y: l.y, w: l.w, h: l.h });
    });
  };

  return (
    <div
      ref={node => {
        setNodeRef(node);
        canvasRef.current = node;
      }}
      className={`w-full min-h-screen p-4 bg-white ${isOver ? 'bg-green-100' : ''}`}
      style={{ maxWidth: GRID_WIDTH, margin: '0 auto' }}
    >
      <h2 className="text-lg font-semibold mb-4">Form Canvas</h2>
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: GRID_COLS, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={GRID_ROW_HEIGHT}
        isDraggable={!preview}
        isResizable={!preview}
        onLayoutChange={onLayoutChange}
        measureBeforeMount={false}
        useCSSTransforms={true}
        compactType={null}
        preventCollision={false}
      >
        {components.map((comp, idx) => (
          <div
            key={comp.id}
            data-grid={layout[idx]}
            className={`border rounded bg-gray-50 h-full w-full flex flex-col items-stretch justify-stretch ${selectedId === comp.id ? 'border-blue-500' : 'border-gray-300'}`}
            onClick={() => !preview && selectComponent(comp.id)}
          >
            {preview ? (
              <FieldPreview
                type={comp.type}
                config={comp.config}
                value={formData[comp.config.name]}
                onChange={e => {
                  if (comp.type === 'checkbox') {
                    handleValueChange(comp.config.name, e.target.checked);
                  } else if (comp.type === 'radio') {
                    handleValueChange(comp.config.name, e.target.value);
                  } else {
                    handleValueChange(comp.config.name, e.target.value);
                  }
                }}
                fullHeight={true}
              />
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{comp.config.label || '(No label)'}</span>
                  <button
                    className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
                    onClick={e => { e.stopPropagation(); removeComponent(comp.id); }}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
                <span className="text-xs text-gray-500">{comp.type}</span>
              </>
            )}
          </div>
        ))}
      </ResponsiveGridLayout>
      {components.length === 0 && (
        <div className="text-gray-400 text-center mt-8">Drag fields here to build your form</div>
      )}
      {preview && (
        <div className="mt-6 w-full">
          <h3 className="font-semibold mb-2">Form Data:</h3>
          <pre className="bg-gray-900 text-green-200 rounded p-2 text-xs overflow-x-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Canvas;
