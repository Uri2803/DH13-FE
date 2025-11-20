import React, { useState } from 'react';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { mockCongressUpdates, CongressUpdate } from '../../mocks/congress';

// Lấy type status từ CongressUpdate để luôn đồng bộ
type Status = CongressUpdate['status'];

type UpdateFormData = {
  title: string;
  description: string;
  location: string;
  scheduledTime: string;
  status: Status;
  imageUrls: string[];
};

const CongressUpdatesPage: React.FC = () => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<CongressUpdate[]>(mockCongressUpdates);

  const [showForm, setShowForm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<CongressUpdate | null>(null);

  const [formData, setFormData] = useState<UpdateFormData>({
    title: '',
    description: '',
    location: '',
    scheduledTime: '',
    status: 'upcoming',  // <- Type Status nên OK
    imageUrls: [''],
  });

  const [submitting, setSubmitting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<{ [key: string]: number }>({});

  const isAdmin = user?.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      const filteredImageUrls = formData.imageUrls.filter((url) => url.trim() !== '');

      if (editingUpdate) {
        // Update existing
        const updatedUpdates = updates.map((update) =>
          update.id === editingUpdate.id
            ? {
                ...update,
                ...formData,
                imageUrls: filteredImageUrls,
                priority: update.priority,
              }
            : update,
        );
        setUpdates(updatedUpdates);
      } else {
        // Add new
        const newUpdate: CongressUpdate = {
          id: Date.now().toString(),
          title: formData.title,
          description: formData.description,
          location: formData.location,
          scheduledTime: formData.scheduledTime,
          status: formData.status,
          imageUrls: filteredImageUrls,
          priority: updates.length + 1,
          createdAt: new Date().toISOString(),
        };

        setUpdates([...updates, newUpdate].sort((a, b) => a.priority - b.priority));
      }

      resetForm();
      setSubmitting(false);
    }, 1000);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      scheduledTime: '',
      status: 'upcoming',
      imageUrls: [''],
    });
    setEditingUpdate(null);
    setShowForm(false);
  };

  const handleEdit = (update: CongressUpdate) => {
    setEditingUpdate(update);
    setFormData({
      title: update.title,
      description: update.description,
      location: update.location,
      // input datetime-local cần format yyyy-MM-ddTHH:mm
      scheduledTime: update.scheduledTime.slice(0, 16),
      status: update.status,
      imageUrls: update.imageUrls.length > 0 ? update.imageUrls : [''],
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa diễn biến này?')) {
      setUpdates(updates.filter((update) => update.id !== id));
    }
  };

  const addImageUrl = () => {
    setFormData({
      ...formData,
      imageUrls: [...formData.imageUrls, ''],
    });
  };

  const removeImageUrl = (index: number) => {
    const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      imageUrls: newImageUrls.length > 0 ? newImageUrls : [''],
    });
  };

  const updateImageUrl = (index: number, value: string) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    setFormData({
      ...formData,
      imageUrls: newImageUrls,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'ongoing':
        return 'Đang diễn ra';
      case 'upcoming':
      default:
        return 'Sắp diễn ra';
    }
  };

  const selectImage = (updateId: string, imageIndex: number) => {
    setSelectedImageIndex((prev) => ({
      ...prev,
      [updateId]: imageIndex,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navigation />}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Diễn biến Đại hội</h1>
            <p className="text-gray-600">Theo dõi tiến trình và các hoạt động của Đại hội</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowForm(true)} className="flex items-center">
              <i className="ri-add-line mr-2" />
              Thêm diễn biến
            </Button>
          )}
        </div>

        {/* Form Modal */}
        {showForm && isAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingUpdate ? 'Chỉnh sửa diễn biến' : 'Thêm diễn biến mới'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tiêu đề */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tiêu đề diễn biến"
                    required
                  />
                </div>

                {/* Mô tả */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Nhập mô tả chi tiết..."
                    maxLength={500}
                    required
                  />
                </div>

                {/* Địa điểm */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa điểm *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập địa điểm tổ chức"
                    required
                  />
                </div>

                {/* Thời gian */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledTime}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Hình ảnh */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Hình ảnh
                    </label>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addImageUrl}
                      className="text-sm"
                    >
                      <i className="ri-add-line mr-1" />
                      Thêm ảnh
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => updateImageUrl(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Nhập URL hình ảnh ${index + 1}`}
                        />
                        {formData.imageUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageUrl(index)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <i className="ri-delete-bin-line" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái *
                  </label>
                  <div className="flex space-x-4">
                    {([
                      { value: 'upcoming', label: 'Sắp diễn ra' },
                      { value: 'ongoing', label: 'Đang diễn ra' },
                      { value: 'completed', label: 'Hoàn thành' },
                    ] as { value: Status; label: string }[]).map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          value={option.value}
                          checked={formData.status === option.value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as Status,
                            })
                          }
                          className="mr-2"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-2" />
                        Đang lưu...
                      </>
                    ) : editingUpdate ? (
                      'Cập nhật'
                    ) : (
                      'Thêm mới'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {updates.map((update, index) => (
              <div key={update.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      update.status === 'completed'
                        ? 'bg-green-100'
                        : update.status === 'ongoing'
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <i
                      className={`${
                        update.status === 'completed'
                          ? 'ri-check-line text-green-600'
                          : update.status === 'ongoing'
                          ? 'ri-play-line text-blue-600'
                          : 'ri-time-line text-gray-600'
                      } text-xl`}
                    />
                  </div>
                  {index < updates.length - 1 && (
                    <div className="w-0.5 h-16 bg-gray-200 ml-6 mt-2" />
                  )}
                </div>

                <div className="flex-1">
                  <Card className="hover:shadow-lg transition-shadow">
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Images */}
                      {update.imageUrls && update.imageUrls.length > 0 && (
                        <div className="md:col-span-1">
                          <div className="space-y-3">
                            {/* Main Image */}
                            <img
                              src={
                                update.imageUrls[
                                  selectedImageIndex[update.id] || 0
                                ]
                              }
                              alt={update.title}
                              className="w-full h-48 object-cover rounded-lg cursor-pointer"
                            />

                            {/* Thumbnails */}
                            {update.imageUrls.length > 1 && (
                              <div className="flex space-x-2 overflow-x-auto">
                                {update.imageUrls.map((imageUrl, imgIndex) => (
                                  <img
                                    key={imgIndex}
                                    src={imageUrl}
                                    alt={`${update.title} ${imgIndex + 1}`}
                                    className={`w-16 h-16 object-cover rounded cursor-pointer flex-shrink-0 ${
                                      (selectedImageIndex[update.id] || 0) ===
                                      imgIndex
                                        ? 'ring-2 ring-blue-500'
                                        : 'opacity-70 hover:opacity-100'
                                    }`}
                                    onClick={() =>
                                      selectImage(update.id, imgIndex)
                                    }
                                  />
                                ))}
                              </div>
                            )}

                            {update.imageUrls.length > 1 && (
                              <div className="text-xs text-gray-500 text-center">
                                {(selectedImageIndex[update.id] || 0) + 1} /{' '}
                                {update.imageUrls.length}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div
                        className={
                          update.imageUrls && update.imageUrls.length > 0
                            ? 'md:col-span-2'
                            : 'md:col-span-3'
                        }
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">
                                {update.title}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                  update.status,
                                )}`}
                              >
                                {getStatusText(update.status)}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">
                              {update.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                <i className="ri-map-pin-line mr-1" />
                                {update.location}
                              </span>
                              <span>
                                <i className="ri-time-line mr-1" />
                                {formatDate(update.scheduledTime)}
                              </span>
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => handleEdit(update)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                              >
                                <i className="ri-edit-line" />
                              </button>
                              <button
                                onClick={() => handleDelete(update.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <i className="ri-delete-bin-line" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ))}
          </div>

          {updates.length === 0 && (
            <Card className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-calendar-event-line text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Chưa có diễn biến nào
              </h3>
              <p className="text-gray-500 mb-4">
                Các diễn biến của Đại hội sẽ được cập nhật tại đây
              </p>
              {isAdmin && (
                <Button onClick={() => setShowForm(true)}>
                  <i className="ri-add-line mr-2" />
                  Thêm diễn biến đầu tiên
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CongressUpdatesPage;
