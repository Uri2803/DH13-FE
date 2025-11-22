import React, { useCallback, useEffect, useState } from 'react';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { getSocket } from '../../utils/socket';

import {
  CongressDocument,
  fetchDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
} from '../../services/documents';

import bgMain from '../../assets/image/nendaihoi.png'

const categories = [
  'Báo cáo', 'Danh sách', 'Quy chế', 'Thông báo',
  'Văn kiện', 'Quyết định', 'Nghị quyết', 'Khác',
];
const fileTypes = ['PDF', 'Word', 'Excel', 'PowerPoint', 'Khác'];

const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [documents, setDocuments] = useState<CongressDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<CongressDocument | null>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', fileUrl: '', fileType: 'PDF',
    fileSize: '', category: '', isPublic: true, file: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);

  // Filter
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Preview & Toggle
  const [previewDoc, setPreviewDoc] = useState<CongressDocument | null>(null);
  const [togglingId, setTogglingId] = useState<number | string | null>(null);

  // ===== Load documents =====
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const list = await fetchDocuments();
      setDocuments(list);
    } catch (err) {
      console.error('Load documents error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  // ===== Socket =====
  useEffect(() => {
    const socket = getSocket();
    const handler = () => void loadDocuments();
    socket.on('documents:changed', handler);
    return () => {
      socket.off('documents:changed', handler);
    };
  }, [loadDocuments]);

  // ===== Helpers =====
  const resetForm = () => {
    setFormData({
      title: '', description: '', fileUrl: '', fileType: 'PDF',
      fileSize: '', category: '', isPublic: true, file: null,
    });
    setEditingDocument(null);
    setShowForm(false);
  };

  const handleEdit = (document: CongressDocument) => {
    setEditingDocument(document);
    setFormData({
      title: document.title, description: document.description,
      fileUrl: document.fileUrl, fileType: document.fileType,
      fileSize: document.fileSize || '', category: document.category,
      isPublic: document.isPublic, file: null,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert('Xóa tài liệu thất bại.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || (!formData.file && !formData.fileUrl.trim())) {
      alert('Vui lòng nhập tiêu đề và file.');
      return;
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('fileType', formData.fileType);
      if (formData.fileSize) fd.append('fileSize', formData.fileSize);
      fd.append('category', formData.category);
      fd.append('isPublic', String(formData.isPublic));

      if (formData.file) fd.append('file', formData.file);
      else if (formData.fileUrl) fd.append('fileUrl', formData.fileUrl);

      if (editingDocument) await updateDocument(editingDocument.id, fd);
      else await createDocument(fd);

      resetForm();
      void loadDocuments();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublic = async (doc: CongressDocument) => {
    try {
      setTogglingId(doc.id);
      const fd = new FormData();
      fd.append('isPublic', String(!doc.isPublic));
      await updateDocument(doc.id, fd);
      setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, isPublic: !doc.isPublic } : d)));
    } catch (err) {
      console.error(err);
      alert('Cập nhật hiển thị thất bại.');
    } finally {
      setTogglingId(null);
    }
  };

  // ===== Utils =====
  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return 'ri-file-pdf-2-fill text-red-500';
    if (type.includes('word') || type.includes('doc')) return 'ri-file-word-2-fill text-blue-600';
    if (type.includes('excel') || type.includes('xls')) return 'ri-file-excel-2-fill text-emerald-600';
    if (type.includes('ppt') || type.includes('powerpoint')) return 'ri-file-ppt-2-fill text-orange-500';
    return 'ri-file-text-fill text-gray-500';
  };

  const canPreview = (doc: CongressDocument) => {
    const type = doc.fileType.toLowerCase();
    const url = doc.fileUrl.toLowerCase();
    return (
      type.includes('pdf') || type.includes('word') || type.includes('doc') ||
      type.includes('excel') || type.includes('xls') || type.includes('ppt') ||
      url.endsWith('.pdf') || url.endsWith('.docx') || url.endsWith('.xlsx')
    );
  };

  const getPreviewUrl = (doc: CongressDocument) => {
    const url = doc.fileUrl;
    const type = doc.fileType.toLowerCase();
    if (type.includes('pdf') || url.toLowerCase().endsWith('.pdf')) return url;
    if (
      type.includes('excel') || type.includes('xls') || url.toLowerCase().endsWith('.xlsx') ||
      url.toLowerCase().endsWith('.xls') || type.includes('word') || type.includes('doc') ||
      type.includes('ppt') || type.includes('powerpoint')
    ) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVisibility = isAdmin || doc.isPublic;
    return matchesCategory && matchesSearch && matchesVisibility;
  });

  return (
    // CONTAINER CHÍNH VỚI ẢNH NỀN
    <div 
      className="min-h-screen pb-20 bg-cover bg-center bg-fixed relative font-sans"
      style={{ 
        backgroundImage: `url(${bgMain})`, // Sử dụng biến ảnh đã import
      }}
    >
      {/* Lớp phủ màu đen mờ để làm nổi bật nội dung trên nền ảnh */}
      <div className="absolute inset-0 bg-black/30 z-0 fixed"></div>

      {/* Nội dung chính (z-index cao hơn lớp phủ) */}
      <div className="relative z-10">
        {user && <Navigation />}

        <div className="container mx-auto px-4 pt-24 max-w-6xl">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-white text-blue-700 text-xl font-bold uppercase tracking-wider mb-3 shadow-sm">
                <i className="ri-folder-open-line" />
                Tài liệu Đại hội
              </div>
              
        
              <p className="text-white/90 text-sm md:text-base mt-1 font-medium drop-shadow-sm">
                Tra cứu, xem trực tiếp và tải về các tài liệu chính thức.
              </p>

            </div>

            {isAdmin && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-900/30 border-none w-full sm:w-auto justify-center transition-transform hover:-translate-y-0.5"
              >
                <i className="ri-add-circle-line mr-2 text-lg" />
                Thêm tài liệu
              </Button>
            )}
          </div>

          {/* SEARCH & FILTER - GLASSMORPHISM */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-4 mb-8 sticky top-20 z-30">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tài liệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                />
              </div>
              <div className="md:w-64">
                <div className="relative">
                  <i className="ri-filter-3-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full pl-10 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm font-medium text-gray-700 cursor-pointer hover:bg-white transition-colors"
                  >
                    <option value="all">Tất cả danh mục</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  
                </div>
              </div>
            </div>
          </div>

          {/* DOCUMENT LIST */}
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/80 p-4 rounded-2xl h-28 animate-pulse backdrop-blur-sm" />
              ))}
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="grid gap-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white/95 backdrop-blur-sm border border-white/60 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    
                    {/* Icon Area */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                        <i className={`${getFileIcon(doc.fileType)} text-3xl`} />
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-800 leading-snug group-hover:text-blue-700 transition-colors">
                          {doc.title}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wider border border-gray-200">
                          {doc.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                        {doc.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-400 font-medium">
                        <span className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-100">
                          <i className="ri-file-info-line mr-1 text-blue-400" />
                          {doc.fileType} {doc.fileSize ? `• ${doc.fileSize}` : ''}
                        </span>
                        <span className="flex items-center">
                          <i className="ri-calendar-line mr-1" />
                          {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        {!doc.isPublic && (
                          <span className="flex items-center text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                            <i className="ri-lock-fill mr-1" /> Riêng tư
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Area */}
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 mt-2 md:mt-0">
                      {/* Nút Xem/Mở với Gradient */}
                      {canPreview(doc) ? (
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="w-full sm:w-auto md:w-32 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-600 active:scale-95 transition-all shadow-md shadow-blue-200"
                        >
                          <i className="ri-eye-fill" /> Xem ngay
                        </button>
                      ) : (
                        <button
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                          className="w-full sm:w-auto md:w-32 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-600 active:scale-95 transition-all shadow-md shadow-blue-200"
                        >
                          <i className="ri-external-link-line" /> Mở file
                        </button>
                      )}

                      {/* Admin Actions */}
                      {isAdmin && (
                        <div className="flex items-center justify-center md:justify-end gap-2 mt-1">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Tải xuống"
                          >
                            <i className="ri-download-line text-lg" />
                          </a>

                          <button
                            onClick={() => handleTogglePublic(doc)}
                            disabled={togglingId === doc.id}
                            className={`p-2 rounded-lg transition-colors ${
                              doc.isPublic
                                ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={doc.isPublic ? 'Ẩn' : 'Công khai'}
                          >
                            {togglingId === doc.id ? (
                              <i className="ri-loader-4-line animate-spin" />
                            ) : doc.isPublic ? (
                              <i className="ri-eye-off-line" />
                            ) : (
                              <i className="ri-eye-line" />
                            )}
                          </button>

                          <button
                            onClick={() => handleEdit(doc)}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <i className="ri-edit-line" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Xóa"
                          >
                            <i className="ri-delete-bin-line" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/80 backdrop-blur-md rounded-2xl border border-dashed border-gray-300">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <i className="ri-inbox-archive-line text-4xl text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-600">Chưa có tài liệu nào</h3>
              <p className="text-gray-500">Vui lòng thử lại với từ khóa khác</p>
            </div>
          )}
        </div>
      </div>

      {/* === PREVIEW MODAL (Giữ nguyên logic, chỉ chỉnh nhẹ UI) === */}
      {previewDoc && (
        <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-0 md:p-6 transition-all">
          <div className="bg-white w-full h-full md:h-[90vh] md:max-w-5xl rounded-none md:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-20">
              <div className="min-w-0 pr-4">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {previewDoc.title}
                </h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                  <i className="ri-file-text-line" /> {previewDoc.fileType}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {isAdmin && (
                  <a
                    href={previewDoc.fileUrl}
                    download
                    className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <i className="ri-download-cloud-2-line" /> Tải về
                  </a>
                )}
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white transition-all transform hover:rotate-90"
                >
                  <i className="ri-close-line text-2xl" />
                </button>
              </div>
            </div>

            {/* Body Modal */}
            <div className="flex-1 bg-gray-100 relative">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                 <i className="ri-loader-4-line animate-spin text-3xl"></i>
              </div>
              <iframe
                src={getPreviewUrl(previewDoc)}
                className="w-full h-full absolute inset-0 border-0 z-10 bg-white"
                title="Document Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL - ADMIN (Cập nhật UI cho Form đẹp hơn) */}
      {showForm && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto !rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <i className={`ri-${editingDocument ? 'edit' : 'add'}-circle-fill text-blue-600 text-2xl`} />
                {editingDocument ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'}
              </h2>
              <button onClick={resetForm} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors">
                <i className="ri-close-line text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tiêu đề văn bản</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="Nhập tên tài liệu..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Mô tả / Trích yếu</label>
                <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none" rows={3} placeholder="Mô tả ngắn gọn nội dung..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Danh mục</label>
                  <div className="relative">
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Chọn...</option>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Loại file</label>
                  <div className="relative">
                    <select value={formData.fileType} onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500">
                      {fileTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 border-dashed">
                <label className="block text-sm font-bold text-gray-700 mb-2">File đính kèm</label>
                <input type="file" onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Kích thước file (ghi chú)</label>
                <input type="text" value={formData.fileSize} onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: 2.5 MB" />
              </div>

              <div className="flex items-center gap-3 py-2 cursor-pointer" onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.isPublic ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${formData.isPublic ? 'translate-x-6' : ''}`} />
                </div>
                <span className="text-sm font-bold text-gray-700">Công khai tài liệu này</span>
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="button" variant="secondary" className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 border-0 hover:bg-gray-200" onClick={resetForm}>
                  Hủy bỏ
                </Button>
                <Button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0 shadow-lg shadow-blue-500/30" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : 'Lưu tài liệu'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;