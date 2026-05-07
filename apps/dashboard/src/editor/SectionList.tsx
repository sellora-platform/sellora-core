import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditorStore } from "./store/useEditorStore";
import { SECTION_REGISTRY } from "../sections/registry";
import { GripVertical, Trash2, Copy } from "lucide-react";
import { SectionLibraryModal } from "./SectionLibraryModal";

interface SortableItemProps {
  id: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  name,
  isSelected,
  onClick,
  onDelete,
  onDuplicate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 p-3 mb-2 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? "bg-white border-blue-500 shadow-sm"
          : "bg-white border-gray-200 hover:border-gray-300"
      }`}
      onClick={onClick}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600"
      >
        <GripVertical size={16} />
      </div>

      <div className="flex-1 font-medium text-sm text-gray-800">
        {name}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600"
          title="Duplicate"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-red-50 rounded text-gray-500 hover:text-red-600"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export const SectionList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const {
    theme,
    selectedSectionId,
    setSelectedSection,
    reorderSections,
    deleteSection,
    duplicateSection,
  } = useEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const order = theme.templates.home.order;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = order.indexOf(active.id as string);
      const newIndex = order.indexOf(over.id as string);
      const newOrder = arrayMove(order, oldIndex, newIndex);
      reorderSections(newOrder);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
        Sections
      </h3>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          {order.map((id) => {
            const section = theme.templates.home.sections[id];
            const schema = SECTION_REGISTRY[section.type]?.schema;
            return (
              <SortableItem
                key={id}
                id={id}
                name={schema?.name || section.type}
                isSelected={selectedSectionId === id}
                onClick={() => setSelectedSection(id)}
                onDelete={() => deleteSection(id)}
                onDuplicate={() => duplicateSection(id)}
              />
            );
          })}
        </SortableContext>
      </DndContext>

      <button
        className="w-full mt-4 py-2 px-4 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
        onClick={() => setIsModalOpen(true)}
      >
        <span>+ Add Section</span>
      </button>

      <SectionLibraryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};
