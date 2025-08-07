import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { GripVertical } from 'lucide-react';
import { TableColumn } from '../config/tableConfig';

interface SortableHeaderProps {
  column: TableColumn;
  children: React.ReactNode;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ column, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging && { opacity: 0.5 }),
  };

  return (
    <th
      ref={setNodeRef}
      className={`px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 relative`}
      style={style}
      {...attributes}
    >
      <div 
        className="cursor-grab hover:cursor-grabbing w-full text-center"
        {...listeners}
        title="Drag to reorder columns"
      >
        <GripVertical className="w-4 h-4 text-gray-300 hover:text-gray-500 transition-colors absolute left-2 top-1/2 transform -translate-y-1/2" />
        <div className="w-full text-center">
          {children}
        </div>
      </div>
    </th>
  );
};

interface DraggableTableHeaderProps {
  columns: TableColumn[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  children: (column: TableColumn) => React.ReactNode;
}

export const DraggableTableHeader: React.FC<DraggableTableHeaderProps> = ({
  columns,
  onReorder,
  children,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = columns.findIndex(col => col.id === active.id);
      const newIndex = columns.findIndex(col => col.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToHorizontalAxis]}
    >
      <SortableContext 
        items={columns.map(col => col.id)}
        strategy={horizontalListSortingStrategy}
      >
        <tr>
          {columns.map((column) => (
            <SortableHeader key={column.id} column={column}>
              {children(column)}
            </SortableHeader>
          ))}
        </tr>
      </SortableContext>
    </DndContext>
  );
};
