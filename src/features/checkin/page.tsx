import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { mockDelegates } from '../../mocks/delegates';

const CheckinPage: React.FC = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dùng ref để điều khiển vòng lặp quét
  const scanningRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);

  const [scanning, setScanning] = useState(false);
  const [delegates, setDelegates] = useState(mockDelegates);
  const [checkedInDelegate, setCheckedInDelegate] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Kiểm tra quyền admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      window.history.back();
    }
  }, [user]);

  // =============================
  // 🎥 START CAMERA + SCAN LOOP
  // =============================
  const startCamera = () => {
  setScanning(true);
};

useEffect(() => {
  if (!scanning) return;

  let stream: MediaStream | null = null;
  let stopped = false;

  (async () => {
    try {
      // (Khuyên) kiểm tra secure context để tránh lỗi im lặng trên HTTP không phải localhost
      console.log('[checkin] secure=', window.isSecureContext, 'origin=', location.origin);

      // xin camera (ưu tiên camera sau, fallback)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
      } catch (e) {
        console.warn('[checkin] fallback default camera', e);
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      // Bây giờ <video> đã được mount vì scanning === true
      let video = videoRef.current;
      if (!video) {
        // chờ 1 frame để đảm bảo ref có mặt
        await new Promise(requestAnimationFrame);
        video = videoRef.current;
      }
      if (!video) throw new Error('Video element chưa sẵn sàng');

      video.srcObject = stream!;
      video.setAttribute('playsinline', 'true'); // iOS/Safari
      video.muted = true;

      // chờ metadata rồi play
      await new Promise<void>((res) => {
        const onLoaded = () => { video!.removeEventListener('loadedmetadata', onLoaded); res(); };
        video!.addEventListener('loadedmetadata', onLoaded);
      });
      await video.play();

      console.log('✅ Camera started');
      scanningRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      console.error('❌ Lỗi khi mở camera:', err);
      alert('Không thể mở camera. Chuyển sang chế độ demo.');
      setScanning(false);
      handleDemoCheckin();
    }
  })();

  // cleanup khi tắt scanning hoặc unmount
  return () => {
    scanningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };
}, [scanning]);



  const stopCamera = () => {
    scanningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach(track => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;

    setScanning(false);
    console.log('🛑 Camera stopped');
  };

  // =============================
  // 🔍 SCAN LOOP
  // =============================
  const tick = () => {
    if (!scanningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // Chờ khi camera đã có dữ liệu
    if (video.readyState < 2) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imgData.data, canvas.width, canvas.height);

    if (code?.data) {
      console.log('✅ QR code detected:', code.data);
      handleQRCheckin(code.data.trim());
      stopCamera();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  // Dọn tài nguyên khi thoát trang
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // =============================
  // 🎯 CHECKIN LOGIC
  // =============================
  const handleQRCheckin = (qrData: string) => {
    const delegate = delegates.find(d => d.delegateCode === qrData);
    if (delegate && !delegate.checkedIn) {
      const updated = { ...delegate, checkedIn: true, checkinTime: new Date().toISOString() };
      setCheckedInDelegate(updated);
      setDelegates(prev => prev.map(d => (d.id === delegate.id ? updated : d)));
      setShowSuccess(true);
      speak(`Điểm danh thành công. ${updated.fullName}, ${updated.unit}`);
    } else {
      alert('❌ Mã QR không hợp lệ hoặc đã điểm danh.');
    }
  };

  const handleDemoCheckin = () => {
    const unChecked = delegates.find(d => !d.checkedIn);
    if (unChecked) {
      const updated = { ...unChecked, checkedIn: true, checkinTime: new Date().toISOString() };
      setCheckedInDelegate(updated);
      setDelegates(prev => prev.map(d => (d.id === unChecked.id ? updated : d)));
      setShowSuccess(true);
      speak(`Điểm danh thành công. ${updated.fullName}, ${updated.unit}`);
    }
  };

  const handleManualCheckin = (id: string) => {
    const delegate = delegates.find(d => d.id === id);
    if (delegate && !delegate.checkedIn) {
      const updated = { ...delegate, checkedIn: true, checkinTime: new Date().toISOString() };
      setCheckedInDelegate(updated);
      setDelegates(prev => prev.map(d => (d.id === id ? updated : d)));
      setShowSuccess(true);
      speak(`Điểm danh thành công. ${updated.fullName}, ${updated.unit}`);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'vi-VN';
      speechSynthesis.speak(utter);
    }
  };

  const closeModal = () => {
    setShowSuccess(false);
    setCheckedInDelegate(null);
  };

  // =============================
  // 📊 UI
  // =============================
  const total = delegates.length;
  const checked = delegates.filter(d => d.checkedIn).length;
  const rate = Math.round((checked / total) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Điểm danh đại biểu</h1>
        <p className="text-gray-600 mb-8">Quét mã QR trên thẻ đại biểu để điểm danh</p>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{total}</div>
            <div className="text-sm text-gray-600">Tổng đại biểu</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{checked}</div>
            <div className="text-sm text-gray-600">Đã điểm danh</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{total - checked}</div>
            <div className="text-sm text-gray-600">Chưa điểm danh</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{rate}%</div>
            <div className="text-sm text-gray-600">Tỷ lệ tham gia</div>
          </Card>
        </div>

        {/* QR + Manual Checkin */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <i className="ri-qr-scan-line text-blue-500 mr-2"></i>Quét mã QR
            </h2>

            <div className="text-center">
              {!scanning ? (
                <div className="space-y-4">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                    <i className="ri-qr-code-line text-6xl text-gray-400"></i>
                  </div>
                  <Button onClick={startCamera} className="w-full">
                    <i className="ri-camera-line mr-2"></i>Bắt đầu quét QR
                  </Button>
                  <Button onClick={handleDemoCheckin} variant="secondary" className="w-full">
                    <i className="ri-play-line mr-2"></i>Demo điểm danh
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 bg-black rounded-lg object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"></div>
                  </div>
                  <Button onClick={stopCamera} variant="danger" className="w-full">
                    <i className="ri-stop-line mr-2"></i>Dừng quét
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Manual Checkin */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <i className="ri-user-check-line text-green-500 mr-2"></i>Điểm danh thủ công
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {delegates.map(d => (
                <div
                  key={d.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    d.checkedIn ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{d.fullName}</div>
                    <div className="text-sm text-gray-600">{d.delegateCode} - {d.unit}</div>
                  </div>
                  {d.checkedIn ? (
                    <div className="flex items-center text-green-600">
                      <i className="ri-check-line mr-1"></i>
                      <span className="text-sm">Đã điểm danh</span>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => handleManualCheckin(d.id)}>
                      Điểm danh
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Success Modal */}
        {showSuccess && checkedInDelegate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-check-line text-2xl text-green-600"></i>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Điểm danh thành công!</h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                <div className="space-y-2">
                  <div><strong>Mã đại biểu:</strong> {checkedInDelegate.delegateCode}</div>
                  <div><strong>Họ tên:</strong> {checkedInDelegate.fullName}</div>
                  <div><strong>Chức vụ:</strong> {checkedInDelegate.position}</div>
                  <div><strong>Đơn vị:</strong> {checkedInDelegate.unit}</div>
                  <div><strong>Thời gian:</strong> {new Date().toLocaleString('vi-VN')}</div>
                </div>
              </div>
              <Button onClick={closeModal} className="w-full">Tiếp tục</Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckinPage;