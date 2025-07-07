import { create } from 'zustand';
import { nanoid } from 'nanoid';

const getDefaultConfig = (type, existing) => {
  // Find a unique name for this type
  let base = type;
  let idx = 1;
  let name = `${base}${idx}`;
  const names = new Set(existing.map(c => c.config.name));
  while (names.has(name)) {
    idx++;
    name = `${base}${idx}`;
  }
  switch (type) {
    case 'text':
      return { label: 'Text field', name, placeholder: '', required: false, defaultValue: '' };
    case 'textarea':
      return { label: 'Textarea', name, placeholder: '', required: false, defaultValue: '' };
    case 'number':
      return { label: 'Number field', name, placeholder: '', required: false, defaultValue: '' };
    case 'checkbox':
      return { label: 'Checkbox', name, required: false, defaultValue: false };
    case 'radio':
      return { label: 'Radio Group', name, required: false, options: ['Option 1', 'Option 2'], defaultValue: '' };
    case 'dropdown':
      return { label: 'Dropdown', name, required: false, options: ['Option 1', 'Option 2'], defaultValue: '' };
    case 'date':
      return { label: 'Date Picker', name, required: false, defaultValue: '' };
    default:
      return { label: `${type} field`, name, required: false };
  }
};

export const useFormStore = create((set) => ({
  components: [],
  selectedId: null,

  addComponent: (type) =>
    set((state) => ({
      components: [
        ...state.components,
        {
          id: nanoid(),
          type,
          config: getDefaultConfig(type, state.components),
        },
      ],
    })),

  selectComponent: (id) => set(() => ({ selectedId: id })),

  updateComponent: (id, config) =>
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id ? { ...c, config: { ...c.config, ...config } } : c
      ),
    })),

  removeComponent: (id) =>
    set((state) => ({
      components: state.components.filter((c) => c.id !== id),
    })),

  moveComponent: (fromIndex, toIndex) =>
    set((state) => {
      const updated = [...state.components];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return { components: updated };
    }),
}));
