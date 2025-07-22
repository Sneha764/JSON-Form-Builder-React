import React from 'react';
import { useFormStore } from '../store/useFormStore';

const PropertyEditor = () => {
  const { components, selectedId, updateComponent } = useFormStore();

  const selected = components.find((c) => c.id === selectedId);
  if (!selected) return <div className="p-4 text-gray-400">Select a component</div>;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateComponent(selected.id, {
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // For radio/dropdown options
  const handleOptionsChange = (idx, val) => {
    const newOptions = [...(selected.config.options || [])];
    newOptions[idx] = val;
    updateComponent(selected.id, { options: newOptions });
  };
  const handleAddOption = () => {
    updateComponent(selected.id, { options: [...(selected.config.options || []), ''] });
  };
  const handleRemoveOption = (idx) => {
    const newOptions = [...(selected.config.options || [])];
    newOptions.splice(idx, 1);
    updateComponent(selected.id, { options: newOptions });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Edit Properties</h2>

      <div>
        <label className="block text-sm font-medium">Label</label>
        <input
          className="border p-1 w-full"
          name="label"
          value={selected.config.label || ''}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          className="border p-1 w-full"
          name="name"
          value={selected.config.name || ''}
          onChange={handleChange}
        />
      </div>

      {/* Placeholder for text, textarea, number */}
      {(selected.type === 'text' || selected.type === 'textarea' || selected.type === 'number') && (
        <div>
          <label className="block text-sm font-medium">Placeholder</label>
          <input
            className="border p-1 w-full"
            name="placeholder"
            value={selected.config.placeholder || ''}
            onChange={handleChange}
          />
        </div>
      )}

      {/* Default Value */}
      {['text', 'textarea', 'number', 'radio', 'dropdown', 'date'].includes(selected.type) && (
        <div>
          <label className="block text-sm font-medium">Default Value</label>
          <input
            className="border p-1 w-full"
            name="defaultValue"
            value={selected.config.defaultValue || ''}
            onChange={handleChange}
          />
        </div>
      )}
      {selected.type === 'checkbox' && (
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="defaultValue"
              checked={!!selected.config.defaultValue}
              onChange={handleChange}
            />
            Default Checked
          </label>
        </div>
      )}

      {/* Options for radio/dropdown */}
      {(selected.type === 'radio' || selected.type === 'dropdown') && (
        <div>
          <label className="block text-sm font-medium">Options</label>
          <div className="space-y-2">
            {(selected.config.options || []).map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  className="border p-1 flex-1"
                  value={opt}
                  onChange={e => handleOptionsChange(idx, e.target.value)}
                />
                <button
                  className="text-red-500 px-2"
                  onClick={() => handleRemoveOption(idx)}
                  type="button"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              className="bg-blue-100 px-2 py-1 rounded text-xs mt-1"
              onClick={handleAddOption}
              type="button"
            >
              + Add Option
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="required"
            checked={selected.config.required || false}
            onChange={handleChange}
          />
          Required
        </label>
      </div>
    </div>
  );
};

export default PropertyEditor;
