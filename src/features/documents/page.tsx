
import React, { useState } from 'react';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { mockDocuments, Document } from '../../mocks/congress';

const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState(mockDocuments);
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    fileType: 'PDF',
    fileSize: '',
    category: '',
    isPublic: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'admin';

  const categories = ['Nghị quyết', 'Báo cáo', 'Danh sách', 'Quy chế', 'Khác'];
  const fileTypes = ['PDF', 'Word', 'Excel', 'PowerPoint', 'Khác'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      if (editingDocument) {
        // Update existing
        const updatedDocuments = documents.map(doc =>
          doc.id === editingDocument.id
            ? {
                ...doc,
                ...formData,
                updatedAt: new Date().toISOString()
              }
            : doc
        );
        setDocuments(updatedDocuments);
      } else {
        // Add new
        const newDocument: Document = {
          id: Date.now().toString(),
          ...formData,
          uploadedBy: user?.name || 'Admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setDocuments([newDocument, ...documents]);
      }

      resetForm();
      setSubmitting(false);
    }, 1000);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      fileUrl: '',
      fileType: 'PDF',
      fileSize: '',
      category: '',
      isPublic: true
    });
    setEditingDocument(null);
    setShowForm(false);
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      description: document.description,
      fileUrl: document.fileUrl,
      fileType: document.fileType,
      fileSize: document.fileSize,
      category: document.category,
      isPublic: document.isPublic
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      setDocuments(documents.filter(doc => doc.id !== id));
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

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return 'ri-file-pdf-line text-red-600';
      case 'word':
        return 'ri-file-word-line text-blue-600';
      case 'excel':
        return 'ri-file-excel-line text-green-600';
      case 'powerpoint':
        return 'ri-file-ppt-line text-orange-600';
      default:
        return 'ri-file-line text-gray-600';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVisibility = isAdmin || doc.isPublic;
    
    return matchesCategory && matchesSearch && matchesVisibility;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navigation />}
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tài liệu Đại hội</h1>
            <p className="text-gray-600">Quản lý và truy cập các tài liệu chính thức của Đại hội</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowForm(true)} className="flex items-center">
              <i className="ri-add-line mr-2"></i>
              Thêm tài liệu
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Form Modal */}
        {showForm && isAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingDocument ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'}
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
                    placeholder="Nhập tiêu đề tài liệu"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Nhập mô tả chi tiết..."
                    maxLength={500}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL tài liệu *
                  </label>
                  <input
                    type="url"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập URL tài liệu"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại tài liệu *
                    </label>
                    <select
                      value={formData.fileType}
                      onChange={(e) => setFormData({...formData, fileType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {fileTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kích thước file
                    </label>
                    <input
                      type="text"
                      value={formData.fileSize}
                      onChange={(e) => setFormData({...formData, fileSize: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: 2.5 MB"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Công khai cho tất cả đại biểu
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Nếu không chọn, chỉ admin mới có thể xem tài liệu này
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
                      editingDocument ? 'Cập nhật' : 'Thêm mới'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Documents List */}
        <div className="grid gap-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <i className={`${getFileIcon(document.fileType)} text-xl`}></i>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">{document.title}</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {document.category}
                        </span>
                        {!document.isPublic && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Riêng tư
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{document.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          <i className="ri-file-line mr-1"></i>
                          {document.fileType}
                        </span>
                        {document.fileSize && (
                          <span>
                            <i className="ri-hard-drive-line mr-1"></i>
                            {document.fileSize}
                          </span>
                        )}
                        <span>
                          <i className="ri-user-line mr-1"></i>
                          {document.uploadedBy}
                        </span>
                        <span>
                          <i className="ri-time-line mr-1"></i>
                          {formatDate(document.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="secondary"
                        onClick={() => window.open(document.fileUrl, '_blank')}
                        className="flex items-center"
                      >
                        <i className="ri-download-line mr-1"></i>
                        Tải về
                      </Button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleEdit(document)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(document.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-file-list-line text-2xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm || filterCategory !== 'all' ? 'Không tìm thấy tài liệu' : 'Chưa có tài liệu nào'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterCategory !== 'all' 
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                : 'Các tài liệu của Đại hội sẽ được đăng tại đây'
              }
            </p>
            {isAdmin && !searchTerm && filterCategory === 'all' && (
              <Button onClick={() => setShowForm(true)}>
                <i className="ri-add-line mr-2"></i>
                Thêm tài liệu đầu tiên
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
