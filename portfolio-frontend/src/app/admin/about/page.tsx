'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lightbulb, Code, Users, Target, GripVertical, Edit, Trash2, Plus, Save, X } from 'lucide-react';

interface AboutValue {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  orderIndex: number;
  isActive: boolean;
}

const iconOptions = [
  { value: 'Lightbulb', label: '燈泡', icon: Lightbulb },
  { value: 'Code', label: '程式碼', icon: Code },
  { value: 'Users', label: '團隊', icon: Users },
  { value: 'Target', label: '目標', icon: Target },
];

function getIconComponent(iconName: string) {
  const option = iconOptions.find(opt => opt.value === iconName);
  return option ? option.icon : Code;
}

function SortableItem({ value, onEdit, onDelete }: { value: AboutValue; onEdit: (value: AboutValue) => void; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: value.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = getIconComponent(value.icon);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <div
            {...attributes}
            {...listeners}
            className="mt-1 mr-3 cursor-move text-gray-400 hover:text-gray-600"
          >
            <GripVertical size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <IconComponent size={24} className="text-gray-600" />
              <h3 className="font-bold text-lg">{value.title}</h3>
              <span className="text-sm text-gray-500">({value.subtitle})</span>
              {!value.isActive && <span className="text-xs bg-gray-200 px-2 py-1 rounded">已停用</span>}
            </div>
            <p className="text-sm text-gray-600 mb-2">{value.description}</p>
            <div className="flex flex-wrap gap-2">
              {value.details.map((detail, index) => (
                <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {detail}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(value)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(value.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AboutManagementPage() {
  const [aboutValues, setAboutValues] = useState<AboutValue[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState<AboutValue | null>(null);
  const [formData, setFormData] = useState<AboutValue>({
    id: '',
    icon: 'Code',
    title: '',
    subtitle: '',
    description: '',
    details: [],
    orderIndex: 0,
    isActive: true,
  });
  const [detailInput, setDetailInput] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchAboutValues();
  }, []);

  const fetchAboutValues = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/about-values`);
      if (response.ok) {
        const data = await response.json();
        setAboutValues(data.sort((a: AboutValue, b: AboutValue) => a.orderIndex - b.orderIndex));
      }
    } catch (error) {
      console.error('Failed to fetch about values:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = aboutValues.findIndex((item) => item.id === active.id);
      const newIndex = aboutValues.findIndex((item) => item.id === over?.id);

      const newOrder = arrayMove(aboutValues, oldIndex, newIndex);
      setAboutValues(newOrder);

      // 更新後端排序
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/about-values/reorder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderedIds: newOrder.map(item => item.id),
          }),
        });
      } catch (error) {
        console.error('Failed to update order:', error);
      }
    }
  };

  const handleEdit = (value: AboutValue) => {
    setEditingValue(value);
    setFormData(value);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個內容嗎？')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/about-values/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAboutValues();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingValue
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/about-values/${editingValue.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/about-values`;

    const method = editingValue ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchAboutValues();
        handleCancel();
      }
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingValue(null);
    setFormData({
      id: '',
      icon: 'Code',
      title: '',
      subtitle: '',
      description: '',
      details: [],
      orderIndex: 0,
      isActive: true,
    });
    setDetailInput('');
  };

  const addDetail = () => {
    if (detailInput.trim()) {
      setFormData({
        ...formData,
        details: [...formData.details, detailInput.trim()],
      });
      setDetailInput('');
    }
  };

  const removeDetail = (index: number) => {
    setFormData({
      ...formData,
      details: formData.details.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">About 內容管理</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                新增內容
              </button>
            )}
          </div>

          {isEditing && (
            <div className="border border-gray-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {editingValue ? '編輯內容' : '新增內容'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">圖示</label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      {iconOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">啟用狀態</label>
                    <select
                      value={formData.isActive ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="true">啟用</option>
                      <option value="false">停用</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">標題</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">副標題（英文）</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">詳細項目</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={detailInput}
                      onChange={(e) => setDetailInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDetail())}
                      className="flex-1 p-2 border rounded"
                      placeholder="輸入詳細項目後按 Enter"
                    />
                    <button
                      type="button"
                      onClick={addDetail}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      新增
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.details.map((detail, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {detail}
                        <button
                          type="button"
                          onClick={() => removeDetail(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    <Save size={18} />
                    儲存
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-4">現有內容（可拖動排序）</h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={aboutValues.map(v => v.id)}
                strategy={verticalListSortingStrategy}
              >
                {aboutValues.map((value) => (
                  <SortableItem
                    key={value.id}
                    value={value}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {aboutValues.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                尚無內容，請新增 About 翻卡內容
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}