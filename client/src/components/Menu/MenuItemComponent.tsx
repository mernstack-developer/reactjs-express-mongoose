// /client/src/components/Menu/MenuItem.tsx

import React, { useState, useRef, useEffect } from 'react';
import { MenuItem, MenuDragItem } from '../../types/types';

interface MenuItemProps {
  item: MenuItem;
  level?: number;
  onDragStart: (e: React.DragEvent, dragItem: MenuDragItem) => void;
  onDragOver: (e: React.DragEvent, targetItemId: string, isOverItem: boolean) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetItemId: string, isOverItem: boolean) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
  onAddChild: (parentId: string) => void;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({
  item,
  level = 0,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onEdit,
  onDelete,
  onAddChild,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editUrl, setEditUrl] = useState(item.url || '');
  const ref = useRef<HTMLLIElement>(null);
  const hasChildren = !!(item.children && item.children.length > 0);

  const handleDragStart = (e: React.DragEvent) => {
    const dragItem: MenuDragItem = {
      type: 'menu-item',
      item,
      sourceParentId: item.parent,
      sourceIndex: level,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragItem));
    e.dataTransfer.effectAllowed = 'move';
    
    // Visual feedback for dragged element
    const target = e.target as HTMLElement;
    const dragElement = target.closest('li') as HTMLElement;
    if (dragElement) {
      dragElement.classList.add('opacity-50', 'border-2', 'border-blue-500', 'shadow-lg');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Visual feedback for drop zone
    const target = e.target as HTMLElement;
    const dropElement = target.closest('li') as HTMLElement;
    if (dropElement && !dropElement.classList.contains('opacity-50')) {
      dropElement.classList.add('ring-2', 'ring-green-500', 'bg-green-50', 'dark:ring-green-400', 'dark:bg-green-900/20');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const dropElement = target.closest('li') as HTMLElement;
    if (dropElement) {
      dropElement.classList.remove('ring-2', 'ring-green-500', 'bg-green-50', 'dark:ring-green-400', 'dark:bg-green-900/20');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const target = e.target as HTMLElement;
    const dropElement = target.closest('li') as HTMLElement;
    if (dropElement) {
      dropElement.classList.remove('ring-2', 'ring-green-500', 'bg-green-50', 'dark:ring-green-400', 'dark:bg-green-900/20');
    }
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
      const isOverItem = target.closest('.menu-item-content') !== null;
      onDrop(e, item._id, isOverItem);
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditName(item.name);
    setEditUrl(item.url || '');
  };

  const handleSave = () => {
    onEdit({
      ...item,
      name: editName,
      url: editUrl,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(item.name);
    setEditUrl(item.url || '');
  };

  return (
    <li
      ref={ref}
      className={`menu-item mb-1 ${level > 0 ? `ml-${level * 4}` : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Menu Item Content */}
      <div className="menu-item-content">
        <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-shadow ${
          level > 0 ? `ml-${level * 4} pl-4` : ''
        }`}>
          <div className="flex items-center justify-between">
            {/* Left side: Icon, Name, Expand/Collapse */}
            <div className="flex items-center gap-3 flex-1">
              {/* Drag Handle */}
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-gray-400 cursor-grab hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 2a1 1 0 011-1h4a1 1 0 011 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1V2zM4 5a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 9a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1V9zM4 13a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1zM7 17a1 1 0 011-1h4a1 1 0 011 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1v-1z" />
                </svg>
              </div>

              {/* Icon */}
              <div className="flex-shrink-0">
                {item.icon ? (
                  <span className="text-lg">{item.icon}</span>
                ) : (
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded"></div>
                )}
              </div>

              {/* Name and URL */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                      autoFocus
                    />
                    <input
                      type="url"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder="URL (optional)"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                    />
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {item.name}
                    </h4>
                    {item.url && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.url}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Expand/Collapse for items with children */}
              {hasChildren && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`flex-shrink-0 ml-2 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="p-1 text-green-600 hover:text-green-700"
                    title="Save"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="Cancel"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 11-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 10 1.414L10 14.142l7.707-7.707a3 3 0 00-4.242-4.242L10 9.414 5.707 5.121A3 3 0 004.293 4.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onAddChild(item._id)}
                    className="p-1 text-blue-600 hover:text-blue-700"
                    title="Add Child Item"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 010 2h-5v5a1 1 0 01-2 0v-5H4a1 1 0 010-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={handleEdit}
                    className="p-1 text-yellow-600 hover:text-yellow-700"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.556 4.444a3 3 0 00-4.243 0l-7.5 7.5a1 1 0 00-.293.707v3.182a1 1 0 001.172 1h3.182a1 1 0 00.707-.293l7.5-7.5a3 3 0 000-4.243l-3.75-3.75z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(item._id)}
                    className="p-1 text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 000-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 012 2h1a1 1 0 011 0v2a1 1 0 01-1 0H1a1 1 0 01-1 0v-2a2 2 0 012-2V5zm3 7a1 1 0 012 0v3a1 1 0 01-2 0zM14 8a1 1 0 012 0v6a1 1 0 01-2 0V8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="children-container mt-1">
          {item.children.map((childItem) => (
            <MenuItemComponent
              key={childItem._id}
              item={childItem}
              level={level + 1}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </li>
  );
};

export default MenuItemComponent;