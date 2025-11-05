
import React, { useState } from 'react';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { mockCongressInfo, CongressInfo } from '../../mocks/congress';

const CongressInfoPage: React.FC = () => {
  const { user } = useAuth();
  const [infoList, setInfoList] = useState(mockCongressInfo);
  const [showForm, setShowForm] = useState(false);
  const [editingInfo, setEditingInfo] = useState<CongressInfo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    isHighlight: false
  });
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      if (editingInfo) {
        // Update existing
        const updatedInfo = infoList.map(info =>
          info.id === editingInfo.id
            ? {
                ...info,
                ...formData,
                updatedAt: new Date().toISOString()
              }
            : info
        );
        setInfoList(updatedInfo);
      } else {
        // Add new
        const newInfo: CongressInfo = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setInfoList([newInfo, ...infoList]);
      }

      resetForm();
      setSubmitting(false);
    }, 1000);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      imageUrl: '',
      isHighlight: false
    });
    setEditingInfo(null);
    setShowForm(false);
  };

  const handleEdit = (info: CongressInfo) => {
    setEditingInfo(info);
    setFormData({
      title: info.title,
      content: info.content,
      imageUrl: info.imageUrl || '',
      isHighlight: info.isHighlight
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thông tin này?')) {
      setInfoList(infoList.filter(info => info.id !== id));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navigation />}
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Thông tin Đại hội</h1>
            <p className="text-gray-600">Cập nhật thông tin và tình hình mới nhất của Đại hội</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowForm(true)} className="flex items-center">
              <i className="ri-add-line mr-2"></i>
              Thêm thông tin
            </Button>
          )}
        </div>

        {/* Form Modal */}
        {showForm && isAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingInfo ? 'Chỉnh sửa thông tin' : 'Thêm thông tin mới'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tiêu đề thông tin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={5}
                    placeholder="Nhập nội dung chi tiết..."
                    maxLength={500}
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.content.length}/500 ký tự
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập URL hình ảnh (tùy chọn)"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isHighlight}
                      onChange={(e) => setFormData({...formData, isHighlight: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Đánh dấu là thông tin nổi bật
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Thông tin nổi bật sẽ được hiển thị ưu tiên trên trang chủ
                  </p>
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
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Đang lưu...
                      </>
                    ) : (
                      editingInfo ? 'Cập nhật' : 'Thêm mới'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Info List */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {infoList.map((info) => (
              <Card key={info.id} className={`hover:shadow-lg transition-shadow ${
                info.isHighlight ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
              }`}>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Image */}
                  {info.imageUrl && (
                    <div className="md:col-span-1">
                      <img 
                        src={info.imageUrl}
                        alt={info.title}
                        className="w-full h-48 md:h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className={info.imageUrl ? "md:col-span-2" : "md:col-span-3"}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">{info.title}</h3>
                          {info.isHighlight && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Nổi bật
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4 leading-relaxed">{info.content}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            <i className="ri-time-line mr-1"></i>
                            Tạo: {formatDate(info.createdAt)}
                          </span>
                          {info.updatedAt !== info.createdAt && (
                            <span>
                              <i className="ri-edit-line mr-1"></i>
                              Cập nhật: {formatDate(info.updatedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(info)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(info.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {infoList.length === 0 && (
            <Card className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-information-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có thông tin nào</h3>
              <p className="text-gray-500 mb-4">Thông tin cập nhật về Đại hội sẽ được đăng tại đây</p>
              {isAdmin && (
                <Button onClick={() => setShowForm(true)}>
                  <i className="ri-add-line mr-2"></i>
                  Thêm thông tin đầu tiên
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CongressInfoPage;
