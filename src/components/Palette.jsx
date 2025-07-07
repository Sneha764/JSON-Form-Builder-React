import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { COMPONENTS } from '../utils/constants';

const DraggableItem = ({ type, label }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: type,
    data: { type: 'palette-item', componentType: type },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="p-2 m-2 w-full text-sm bg-blue-100 hover:bg-blue-200 border rounded cursor-grab text-center"
    >
      {label}
    </div>
  );
};

const Palette = () => {
  return (
    <div className="p-4 h-screen overflow-y-auto overflow-x-hidden w-full max-w-full">
      <h2 className="text-lg font-semibold mb-4">Component Palette</h2>
      {COMPONENTS.map((comp) => (
        <DraggableItem key={comp.type} {...comp} />
      ))}
    </div>
  );
};

export default Palette;
