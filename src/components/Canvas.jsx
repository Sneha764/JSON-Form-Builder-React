import React from 'react';
import { useFormStore } from '../store/useFormStore';
import GridLayout, { WidthProvider, Responsive } from 'react-grid-layout';
import { useDroppable, useDndMonitor } from '@dnd-kit/core';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// === Configurable input height and box height for text, number, dropdown, date ===
export const FIXED_INPUT_HEIGHT = '2em'; // Change this value to update input height
export const FIXED_BOX_HEIGHT = '80px'; // Change this value to update grey box height
export const MIN_BOX_HEIGHT = '80px'; // Change this value to set min height for all input types

const GRID_COLS = 12;
const GRID_ROW_HEIGHT = 80;
const GRID_WIDTH = 900; // px, adjust as needed

const FieldPreview = ({ type, config, value, onChange, fullHeight, preview }) => {
  // For preview mode, set textarea to 3 lines, others to 1 line
  let minInputStyle = {};
  const [parentHeight, setParentHeight] = React.useState(null);
  const parentRef = React.useRef(null);
  React.useEffect(() => {
    if (preview && type === 'textarea' && parentRef.current) {
      setParentHeight(parentRef.current.offsetHeight);
    }
  }, [preview, type]);
  if (preview) {
    if (type === 'textarea') {
      // If parentHeight is known and less than 2 * GRID_ROW_HEIGHT, use FIXED_INPUT_HEIGHT
      const useFixed = parentHeight !== null && parentHeight < 2 * GRID_ROW_HEIGHT;
      minInputStyle = useFixed
        ? { minWidth: '120px', minHeight: FIXED_INPUT_HEIGHT, maxHeight: FIXED_INPUT_HEIGHT, height: FIXED_INPUT_HEIGHT, resize: 'none' }
        : { minWidth: '120px', minHeight: '4.5em', height: '100%', resize: 'none' };
    } else if (type === 'radio') {
      minInputStyle = { width: '1em', height: '1em' };
    } else if (type === 'checkbox') {
      minInputStyle = { width: '1em', height: '1em' };
    } else if (["text", "number", "dropdown", "date"].includes(type)) {
      minInputStyle = { minWidth: '120px', minHeight: FIXED_INPUT_HEIGHT, maxHeight: FIXED_INPUT_HEIGHT, height: FIXED_INPUT_HEIGHT };
    } else {
      minInputStyle = { minWidth: '120px', minHeight: '2.5em', height: '2.5em' };
    }
  }
  switch (type) {
    case 'text':
      return (
        <div className={preview ? "flex flex-col justify-center h-full w-full" : "flex flex-col h-full w-full min-h-0"}>
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <input
            type="text"
            className={`border rounded w-full ${preview ? '' : 'flex-1 h-full min-h-0'}`}
            placeholder={config.placeholder}
            value={value || ''}
            onChange={onChange}
            style={{ minHeight: 0, ...minInputStyle }}
          />
        </div>
      );
    case 'textarea':
      return (
        <div className="flex flex-col h-full w-full min-h-0" ref={preview ? parentRef : undefined}>
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <textarea
            className={`border rounded flex-1 w-full h-full min-h-0 ${fullHeight ? '' : ''}`}
            placeholder={config.placeholder}
            value={value || ''}
            onChange={onChange}
            style={{ minHeight: 0, ...minInputStyle }}
          />
        </div>
      );
    case 'number':
      return (
        <div className={preview ? "flex flex-col justify-center h-full w-full" : "flex flex-col h-full w-full min-h-0"}>
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <input
            type="number"
            className={`border rounded w-full ${preview ? '' : 'flex-1 h-full min-h-0'}`}
            placeholder={config.placeholder}
            value={value || ''}
            onChange={onChange}
            style={{ minHeight: 0, ...minInputStyle }}
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
              style={preview ? { width: '1em', height: '1em' } : {}}
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
                  style={preview ? { width: '1em', height: '1em' } : {}}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      );
    case 'dropdown':
      return (
        <div className={preview ? "flex flex-col justify-center h-full w-full" : "flex flex-col h-full w-full min-h-0"}>
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <select
            className={`border rounded w-full ${preview ? '' : 'flex-1 h-full min-h-0'}`}
            value={value || ''}
            onChange={onChange}
            style={{ minHeight: 0, ...minInputStyle }}
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
        <div className={preview ? "flex flex-col justify-center h-full w-full" : "flex flex-col h-full w-full min-h-0"}>
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <input
            type="date"
            className={`border rounded w-full ${preview ? '' : 'flex-1 h-full min-h-0'}`}
            value={value || ''}
            onChange={onChange}
            style={{ minHeight: 0, ...minInputStyle }}
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
  const layout = components.map((comp, idx) => {
    // For text, number, dropdown, date: fixed vertical height (h=1, minH=1, maxH=1)
    const fixedHeightTypes = ['text', 'number', 'dropdown', 'date'];
    const isFixed = fixedHeightTypes.includes(comp.type);
    return {
      i: comp.id,
      x: comp.layout?.x ?? (idx % 6),
      y: comp.layout?.y ?? Math.floor(idx / 6),
      w: comp.layout?.w ?? 4,
      h: isFixed ? 1 : (comp.layout?.h ?? 2),
      minH: isFixed ? 1 : 1,
      maxH: isFixed ? 1 : undefined,
    };
  });

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
        {components.map((comp, idx) => {
          // Only radio, checkbox get padding in preview mode
          const paddedTypes = ['radio', 'checkbox'];
          const isPadded = preview && paddedTypes.includes(comp.type);
          const fixedBoxTypes = ["text", "number", "dropdown", "date"];
          const isFixedBox = preview && fixedBoxTypes.includes(comp.type);
          const isPreview = preview;
          return (
            <div
              key={comp.id}
              data-grid={layout[idx]}
              className={`border rounded bg-gray-50 w-full flex flex-col items-stretch justify-stretch${selectedId === comp.id ? ' border-blue-500' : ' border-gray-300'}`}
              style={{
                ...(isFixedBox ? { height: FIXED_BOX_HEIGHT, minHeight: FIXED_BOX_HEIGHT, maxHeight: FIXED_BOX_HEIGHT } : {}),
                ...(isPreview ? { minHeight: MIN_BOX_HEIGHT } : {}),
                boxSizing: 'border-box',
              }}
              onClick={() => !preview && selectComponent(comp.id)}
            >
              {preview ? (
                isPadded ? (
                  <div className="h-full w-full p-4 flex flex-col justify-between">
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
                      preview={preview}
                    />
                  </div>
                ) : (
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
                    preview={preview}
                  />
                )
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
          );
        })}
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
