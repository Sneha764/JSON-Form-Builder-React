import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useFormStore } from '../store/useFormStore';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const FieldSummary = ({ type, config }) => (
  <div className="flex flex-col">
    <span className="font-semibold">{config.label || '(No label)'}</span>
    <span className="text-xs text-gray-500">{type}</span>
  </div>
);

const FieldPreview = ({ type, config, value, onChange }) => {
  switch (type) {
    case 'text':
      return (
        <div className="mb-2">
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <input
            type="text"
            className="border p-1 w-full rounded"
            placeholder={config.placeholder}
            value={value || ''}
            onChange={onChange}
          />
        </div>
      );
    case 'textarea':
      return (
        <div className="mb-2">
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <textarea
            className="border p-1 w-full rounded"
            placeholder={config.placeholder}
            value={value || ''}
            onChange={onChange}
          />
        </div>
      );
    case 'number':
      return (
        <div className="mb-2">
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <input
            type="number"
            className="border p-1 w-full rounded"
            placeholder={config.placeholder}
            value={value || ''}
            onChange={onChange}
          />
        </div>
      );
    case 'checkbox':
      return (
        <div className="mb-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!value}
            onChange={onChange}
          />
          <label className="font-medium">{config.label}{config.required && ' *'}</label>
        </div>
      );
    case 'radio':
      return (
        <div className="mb-2">
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <div className="flex flex-col gap-1">
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
        <div className="mb-2">
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <select
            className="border p-1 w-full rounded"
            value={value || ''}
            onChange={onChange}
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
        <div className="mb-2">
          <label className="block font-medium mb-1">{config.label}{config.required && ' *'}</label>
          <input
            type="date"
            className="border p-1 w-full rounded"
            value={value || ''}
            onChange={onChange}
          />
        </div>
      );
    default:
      return <div className="mb-2">{config.label} ({type})</div>;
  }
};

const SortableField = ({ comp, index, preview, onRemove, onSelect, selected, value, onValueChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: comp.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={`border p-3 rounded mb-3 ${
        !preview && selected ? 'border-blue-500' : 'border-gray-300'
      } ${!preview ? 'cursor-pointer bg-gray-50 hover:bg-gray-100 flex items-center' : 'bg-white'}`}
      onClick={() => !preview && onSelect(comp.id)}
    >
      {!preview && (
        <span
          className="mr-2 cursor-grab text-gray-400 hover:text-gray-700 select-none"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          ≡
        </span>
      )}
      <div className="flex-1">
        {preview ? (
          <FieldPreview
            type={comp.type}
            config={comp.config}
            value={value}
            onChange={e => {
              if (comp.type === 'checkbox') {
                onValueChange(comp.config.name, e.target.checked);
              } else if (comp.type === 'radio') {
                onValueChange(comp.config.name, e.target.value);
              } else {
                onValueChange(comp.config.name, e.target.value);
              }
            }}
          />
        ) : (
          <FieldSummary type={comp.type} config={comp.config} />
        )}
      </div>
      {!preview && (
        <button
          className="ml-2 text-red-500 hover:text-red-700 px-2 py-1 rounded"
          onClick={e => { e.stopPropagation(); onRemove(comp.id); }}
          title="Remove"
        >
          ✕
        </button>
      )}
    </div>
  );
};

const Canvas = ({ preview = false, onDragStart, onDragEnd }) => {
  const { isOver, setNodeRef } = useDroppable({ id: 'canvas-drop' });
  const { components, selectComponent, selectedId, removeComponent } = useFormStore();

  // Form state for preview mode
  const [formData, setFormData] = React.useState({});
  React.useEffect(() => {
    if (!preview) setFormData({});
  }, [preview, components.length]);

  const handleValueChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (preview) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-6 text-center">Form Canvas</h2>
          <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="w-full">
              {components.map((comp, idx) => (
                <SortableField
                  key={comp.id}
                  comp={comp}
                  index={idx}
                  preview={preview}
                  onRemove={removeComponent}
                  onSelect={selectComponent}
                  selected={comp.id === selectedId}
                  value={formData[comp.config.name]}
                  onValueChange={handleValueChange}
                />
              ))}
            </div>
          </SortableContext>
          {components.length === 0 && (
            <div className="text-gray-400 text-center mt-8">Drag fields here to build your form</div>
          )}
          <div className="mt-6 w-full">
            <h3 className="font-semibold mb-2">Form Data:</h3>
            <pre className="bg-gray-900 text-green-200 rounded p-2 text-xs overflow-x-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`w-3/4 min-h-screen p-4 ${
        isOver ? 'bg-green-100' : 'bg-white'
      } transition-all`}
    >
      <h2 className="text-lg font-semibold mb-4">Form Canvas</h2>
      <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
        {components.map((comp, idx) => (
          <SortableField
            key={comp.id}
            comp={comp}
            index={idx}
            preview={false}
            onRemove={removeComponent}
            onSelect={selectComponent}
            selected={comp.id === selectedId}
          />
        ))}
      </SortableContext>
      {components.length === 0 && (
        <div className="text-gray-400 text-center mt-8">Drag fields here to build your form</div>
      )}
    </div>
  );
};

export default Canvas;
