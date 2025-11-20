import React, { useEffect, useState } from 'react';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchImages,
  uploadImages,
  updateImage,
  deleteImage,
  Image,
} from '../../services/images';

const HeroImagesPage: React.FC = () => {
  const { user } = useAuth();

  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState<Image | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // ===== Guards =====
  if (!user) return null;
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center">
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              Không có quyền truy cập
            </h1>
            <p className="text-gray-600">
              Trang này chỉ dành cho tài khoản quản trị viên (admin).
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // ===== Logic =====
  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchImages('hero');
      setImages(data);
    } catch (e) {
      console.error(e);
      setError('Không thể tải danh sách ảnh hero.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const resetModalState = () => {
    setEditingImage(null);
    setSelectedFiles(null);
    setPreviewUrls([]);
  };

  const openCreateModal = () => {
    resetModalState();
    setShowModal(true);
  };

  const openEditModal = (img: Image) => {
    setEditingImage(img);
    setSelectedFiles(null);
    setPreviewUrls([img.imageUrl]);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setSelectedFiles(files);
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // EDIT
      if (editingImage) {
        if (!selectedFiles || selectedFiles.length === 0) {
          alert('Vui lòng chọn ảnh mới để cập nhật');
          return;
        }
        const file = selectedFiles[0];
        const updated = await updateImage(editingImage.id, file, 'hero');
        setImages((prev) =>
          prev.map((img) => (img.id === updated.id ? updated : img)),
        );
      } else {
        // CREATE
        if (!selectedFiles || selectedFiles.length === 0) {
          alert('Vui lòng chọn ít nhất một ảnh hero');
          return;
        }
        const filesArr = Array.from(selectedFiles);
        const createdList = await uploadImages(filesArr, 'hero');
        setImages((prev) => [...prev, ...createdList]);
      }

      setShowModal(false);
      resetModalState();
    } catch (e) {
      console.error(e);
      setError('Lưu ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (img: Image) => {
    if (!window.confirm(`Bạn có chắc muốn xóa ảnh #${img.id}?`)) return;
    try {
      await deleteImage(img.id);
      setImages((prev) => prev.filter((i) => i.id !== img.id));
    } catch (e) {
      console.error(e);
      alert('Xóa ảnh thất bại.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header Page */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Quản lý Banner
            </h1>
            <p className="text-gray-500 mt-1">
              Tùy chỉnh hình ảnh hiển thị tại trang chủ.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={loadImages} disabled={loading}>
              <i className={`ri-refresh-line mr-2 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            <Button onClick={openCreateModal} className="shadow-lg shadow-cyan-500/20">
              <i className="ri-add-circle-line mr-2" />
              Thêm mới
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-center shadow-sm">
            <i className="ri-error-warning-fill text-xl mr-3" />
            <span>{error}</span>
          </div>
        )}

        {/* List Images */}
        <Card className="border-none shadow-xl shadow-gray-100/50">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <i className="ri-image-line text-3xl text-gray-300" />
              </div>
              <p className="text-gray-500 mb-4">Chưa có hình ảnh nào.</p>
              <Button onClick={openCreateModal} size="sm">Thêm ảnh đầu tiên</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300"
                >
                  {/* ================= KHUNG ẢNH ĐÃ SỬA ================= */}
                  {/* 1. overflow-hidden: Cắt bỏ phần thừa nếu ảnh quá khổ */}
                  {/* 2. h-48 sm:h-60: Chiều cao cố định để các ô bằng nhau */}
                  {/* 3. flex items-center justify-center: Căn ảnh vào giữa */}
                  <div className="relative w-full h-48 sm:h-60 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-50">
                    <img
                      src={img.imageUrl}
                      alt={`Banner ${img.id}`}
                      // w-full h-full object-contain: Ảnh sẽ co giãn vừa khung, không bị méo, không bị cắt
                      className="w-full h-full object-contain p-2 drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Nút zoom xem ảnh gốc */}
                    <a 
                      href={img.imageUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur text-gray-700 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-cyan-50 hover:text-cyan-600 shadow-sm cursor-pointer z-10"
                      title="Xem ảnh gốc"
                    >
                      <i className="ri-fullscreen-line" />
                    </a>
                  </div>
                  {/* ==================================================== */}

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                        #{img.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider border border-green-100">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mb-4" title={img.imageUrl}>
                      {img.imageUrl}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => openEditModal(img)}
                        className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-cyan-600 transition-colors"
                      >
                        <i className="ri-edit-line mr-2" /> Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(img)}
                        className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <i className="ri-delete-bin-line mr-2" /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ================= MODAL POPUP ================= */}
        {showModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
            <div 
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => !saving && setShowModal(false)}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingImage ? 'Cập nhật hình ảnh' : 'Thêm hình ảnh mới'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {editingImage ? 'Thay đổi ảnh banner hiện tại' : 'Tải lên banner cho trang chủ'}
                  </p>
                </div>
                <button
                  onClick={() => !saving && setShowModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <i className="ri-close-line text-xl" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                
                {/* Vùng Chọn File */}
                <div className="mb-6">
                   <label className={`
                      relative flex flex-col items-center justify-center w-full h-48 
                      border-2 border-dashed rounded-xl cursor-pointer transition-all
                      ${saving ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'bg-gray-50/50 border-gray-300 hover:bg-cyan-50/30 hover:border-cyan-400 group'}
                   `}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                          <div className={`
                             mb-3 p-3 rounded-full transition-transform duration-300
                             ${saving ? 'bg-gray-200' : 'bg-white shadow-md group-hover:scale-110 text-cyan-500'}
                          `}>
                             <i className="ri-cloud-upload-line text-2xl" />
                          </div>
                          <p className="mb-2 text-sm text-gray-700 font-medium">
                            <span className="font-bold text-cyan-600">Nhấn để tải lên</span> hoặc kéo thả vào đây
                          </p>
                          <p className="text-xs text-gray-500">
                            Hỗ trợ: PNG, JPG, WEBP (Tối đa 10MB)
                          </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        multiple={!editingImage}
                        onChange={handleFileChange}
                        disabled={saving}
                      />
                   </label>
                </div>

                {/* Preview Section */}
                {previewUrls.length > 0 && (
                  <div className="animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between mb-3">
                       <h4 className="text-sm font-semibold text-gray-700">
                         Xem trước ({previewUrls.length} ảnh)
                       </h4>
                       <button 
                         onClick={() => { setSelectedFiles(null); setPreviewUrls([]); }}
                         className="text-xs text-red-500 hover:text-red-600 font-medium"
                       >
                         Xóa
                       </button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {previewUrls.map((url, idx) => (
                        // KHUNG PREVIEW CŨNG ĐÃ SỬA ĐỂ TRÁNH TRÀN
                        <div key={idx} className="group relative h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <img
                            src={url}
                            alt="Preview"
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetModalState();
                  }}
                  disabled={saving}
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || (!selectedFiles && !editingImage)}
                  className={saving ? 'opacity-80' : 'shadow-lg shadow-cyan-500/30'}
                >
                  {saving ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2" />
                      Đang xử lý...
                    </>
                  ) : editingImage ? (
                    <>
                      <i className="ri-save-line mr-2" />
                      Lưu thay đổi
                    </>
                  ) : (
                    <>
                      <i className="ri-upload-2-line mr-2" />
                      Tải lên ngay
                    </>
                  )}
                </Button>
              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroImagesPage;