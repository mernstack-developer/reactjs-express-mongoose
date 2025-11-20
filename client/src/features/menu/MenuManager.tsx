import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from './menuSlice';
import { MenuItem } from '../../types/types';

const MenuManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { menuItems, loading, error } = useSelector((state: RootState) => state.menu);
  
  const [showForm, setShowForm] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MenuItem | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    url: '',
    icon: '',
    order: 0,
    parent: null as string | null,
    isActive: true
  });

  useEffect(() => {
    dispatch(fetchMenuItems());
  }, [dispatch]);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        url: editingItem.url || '',
        icon: editingItem.icon || '',
        order: editingItem.order,
        parent: editingItem.parent || null,
        isActive: editingItem.isActive || true
      });
    }
  }, [editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const menuData = {
      ...formData,
      order: Number(formData.order)
    };

    if (editingItem) {
      await dispatch(updateMenuItem({ id: editingItem._id, data: menuData }));
      setEditingItem(null);
    } else {
      await dispatch(createMenuItem(menuData));
    }
    
    setFormData({
      name: '',
      url: '',
      icon: '',
      order: 0,
      parent: null,
      isActive: true
    });
    setShowForm(false);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      await dispatch(deleteMenuItem(id));
    }
  };

  const getNestedItems = (parentId: string | null = null): MenuItem[] => {
    return menuItems
      .filter(item => item.parent === parentId)
      .sort((a, b) => a.order - b.order);
  };

  const renderMenuItems = (items: MenuItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item._id} className="border rounded-lg p-4 mb-2" style={{ marginLeft: `${depth * 20}px` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {item.icon && <span className="text-lg">{item.icon}</span>}
            <div>
              <h4 className="font-medium">{item.name}</h4>
              <p className="text-sm text-gray-500">{item.url}</p>
            </div>
            {!item.isActive && <span className="text-red-500 text-xs">Inactive</span>}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(item)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(item._id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded text-sm"
            >
              Delete
            </button>
          </div>
        </div>
        {renderMenuItems(getNestedItems(item._id), depth + 1)}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Menu Item
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">URL</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="/route"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Icon</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="emoji or icon class"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Parent</label>
                <select
                  value={formData.parent || ''}
                  onChange={(e) => setFormData({ ...formData, parent: e.target.value || null })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">None</option>
                  {getNestedItems(null).map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <label className="text-sm font-medium text-gray-700">Active</label>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Menu Structure</h2>
        {renderMenuItems(getNestedItems())}
      </div>
    </div>
  );
};

export default MenuManager;