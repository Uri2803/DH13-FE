// src/pages/checkin/CheckinPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { getSocket } from '../../utils/socket';
import { checkinByQr, checkinManual } from '../../services/checkin';
import { fetchDelegatesAll } from '../../services/delegates';

type UIDelegate = {
  id: number | string;
  delegateCode: string;
  fullName: string;
  unit?: string;
  position?: string;
  gender?: 'Nam' | 'Nữ' | string;
  partyMember?: boolean;
  birthDate?: string;
  phone?: string;
  email?: string;
  checkedIn: boolean;
  checkinTime?: string | null;
};

const normalizeDelegate = (d: any): UIDelegate => {
  const di = d.delegateInfo ?? d;
  const user = d.user ?? d;
  return {
    id: di.id ?? d.id ?? user.id,
    delegateCode: di.code ?? d.code ?? d.delegateCode,
    fullName: user.name ?? d.name ?? d.fullName ?? '',
    unit: user.department?.name ?? d.department?.name ?? d.unit,
    position: di.position ?? d.position,
    gender: di.gender ?? d.gender,
    partyMember: di.isPartyMember ?? d.partyMember,
    birthDate: di.dateOfBirth ?? d.birthDate,
    phone: di.phone ?? d.phone,
    email: di.email ?? d.email ?? user.email,
    checkedIn: Boolean(di.checkedIn ?? d.checkedIn),
    checkinTime: di.checkinTime ?? d.checkinTime ?? null,
  };
};

const CheckinPage: React.FC = () => {
  const { user } = useAuth();

  // Video/canvas
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Flags & raf
  const scanningRef = useRef<boolean>(false);
  const processingRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);

  // Timers (tách riêng)
  const toastTimerRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);

  // UI state
  const [scanning, setScanning] = useState(false);
  const [delegates, setDelegates] = useState<UIDelegate[]>([]);
  const [checkedInDelegate, setCheckedInDelegate] = useState<UIDelegate | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadError, setLoadError] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Guard role
  useEffect(() => {
    if (user && !['admin', 'department'].includes(user.role)) {
      window.history.back();
    }
  }, [user]);

  // Load delegates
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingList(true);
        setLoadError('');
        const list = await fetchDelegatesAll();
        const mapped = list.map(normalizeDelegate);
        if (mounted) setDelegates(mapped);
      } catch (e: any) {
        if (mounted) setLoadError(e?.message || 'Không tải được danh sách đại biểu.');
      } finally {
        if (mounted) setLoadingList(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Realtime sync
  useEffect(() => {
    const s = getSocket();
    const onUpdate = (evt: { delegateId: number | string; checkedIn: boolean; checkinTime?: string }) => {
      setDelegates(prev =>
        prev.map(x =>
          String(x.id) === String(evt.delegateId)
            ? { ...x, checkedIn: evt.checkedIn, checkinTime: evt.checkinTime }
            : x
        )
      );
    };
    s.on('checkin.updated', onUpdate);
    return () => { s.off('checkin.updated', onUpdate); };
  }, []);

  // Start/stop camera
  const startCamera = () => {
    if (scanning) return;
    setScanning(true);
  };

  useEffect(() => {
    if (!scanning) return;

    let stream: MediaStream | null = null;
    (async () => {
      try {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        let video = videoRef.current;
        if (!video) {
          await new Promise(requestAnimationFrame);
          video = videoRef.current!;
        }
        video.srcObject = stream!;
        video.setAttribute('playsinline', 'true');
        video.muted = true;

        await new Promise<void>((res) => {
          const onLoaded = () => { video!.removeEventListener('loadedmetadata', onLoaded); res(); };
          video!.addEventListener('loadedmetadata', onLoaded);
        });
        await video.play();

        scanningRef.current = true;
        processingRef.current = false;
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        console.error('Không thể mở camera:', err);
        showToast('Không thể mở camera. Dùng nút Demo để thử nhanh.', 'error', 3000);
        setScanning(false);
      }
    })();

    // cleanup
    return () => {
      scanningRef.current = false;
      processingRef.current = false;
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [scanning]);

  const stopCamera = () => {
    scanningRef.current = false;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  };

  // Scan loop
  const tick = () => {
    if (!scanningRef.current) return;
    const next = () => { rafRef.current = requestAnimationFrame(tick); };

    if (processingRef.current) { next(); return; }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) { next(); return; }

    const ctx = canvas.getContext('2d');
    if (!ctx) { next(); return; }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(img.data, canvas.width, canvas.height);

    if (code?.data) {
      if (!processingRef.current) {
        processingRef.current = true;     // khóa decode cho request hiện tại
        handleQRCheckin(code.data.trim());
      }
      next();
      return;
    }

    next();
  };

  // Global cleanup
  useEffect(() => () => {
    stopCamera();
    if (toastTimerRef.current)  { clearTimeout(toastTimerRef.current);  toastTimerRef.current  = null; }
    if (resumeTimerRef.current) { clearTimeout(resumeTimerRef.current); resumeTimerRef.current = null; }
  }, []);

  // Toast helper (chỉ lo toast)
  const showToast = (message: string, type: 'success' | 'error' = 'error', ms = 3000) => {
    setToast({ type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), ms);
  };

  // const speak = (text: string) => {
  //   if ('speechSynthesis' in window) {
  //     const ut = new SpeechSynthesisUtterance(text);
  //     ut.lang = 'vi-VN';
  //     speechSynthesis.speak(ut);
  //   }
  //   if (navigator.vibrate) navigator.vibrate(60);
  // };

  const finishLocalUpdate = (d: any, autoResume = true) => {
    const ui = normalizeDelegate(d);
    setCheckedInDelegate(ui);
    setDelegates(prev =>
      prev.map(x => (String(x.id) === String(ui.id)
        ? { ...x, checkedIn: true, checkinTime: ui.checkinTime || new Date().toISOString() }
        : x))
    );
    setShowSuccess(true);
    // speak(`Chào mừng đại biểu, ${ui.fullName}${ui.unit ? `, ${ui.unit}` : ''}`);

    if (autoResume) {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = window.setTimeout(() => {
        closeModal(true);
      }, 2500);
    }
  };

  const handleQRCheckin = async (qrData: string) => {
    let success = false;
    try {
      const data = await checkinByQr(qrData);
      if (data?.ok && data.delegate) {
        success = true;
        finishLocalUpdate(data.delegate, true);
      } else {
        showToast(data?.message || 'QR không hợp lệ.', 'error', 3000);
      }
    } catch (e: any) {
      console.error(e);
      showToast(e?.response?.data?.message || 'Không thể điểm danh bằng QR', 'error', 3000);
    } finally {
      if (!success) {
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = window.setTimeout(() => {
          processingRef.current = false;
          if (scanningRef.current && !rafRef.current) {
            rafRef.current = requestAnimationFrame(tick);
          }
        }, 3000);
      }
    }
  };

  const handleManualCheckin = async (id: string | number) => {
    try {
      const res = await checkinManual(Number(id)); 
      const data = res.data
      console.log(res)
      if (data?.ok && data.delegate) {
        finishLocalUpdate(data.delegate, false);
      }
    } catch (e: any) {
      console.error(e);
      showToast(e?.response?.data?.message || 'Không thể điểm danh thủ công', 'error', 3000);
    }
  };

  const handleDemoCheckin = () => {
    const unChecked = delegates.find(d => !d.checkedIn);
    if (unChecked) {
      finishLocalUpdate({
        id: unChecked.id,
        code: unChecked.delegateCode,
        fullName: unChecked.fullName,
        unit: unChecked.unit,
        position: unChecked.position,
        checkedIn: true,
        checkinTime: new Date().toISOString(),
      }, false);
    } else {
      showToast('Tất cả đã điểm danh.', 'success', 2000);
    }
  };

  const closeModal = (resumeScan = false) => {
    setShowSuccess(false);
    setCheckedInDelegate(null);
    if (resumeScan) {
      processingRef.current = false;
      if (scanningRef.current && !rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
  };

  // ======= UI =======
  const total = delegates.length;
  const checked = delegates.filter(d => d.checkedIn).length;
  const rate = Math.round((checked / Math.max(total, 1)) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Điểm danh đại biểu</h1>
        <p className="text-gray-600 mb-8">Quét mã QR trên thẻ đại biểu để điểm danh</p>

        {loadingList ? (
          <Card className="mb-6 text-center">
            <i className="ri-loader-4-line animate-spin mr-2" /> Đang tải danh sách...
          </Card>
        ) : loadError ? (
          <Card className="mb-6 text-red-700 bg-red-50 border border-red-200">
            {loadError}
          </Card>
        ) : null}

        {/* Stats */}
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
            <div className="text-2xl font-bold text-orange-600 mb-1">{Math.max(total - checked, 0)}</div>
            <div className="text-sm text-gray-600">Chưa điểm danh</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{rate}%</div>
            <div className="text-sm text-gray-600">Tỷ lệ tham gia</div>
          </Card>
        </div>

        {/* QR + Manual */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <i className="ri-qr-scan-line text-blue-500 mr-2" /> Quét mã QR
            </h2>

            <div className="text-center">
              {!scanning ? (
                <div className="space-y-4">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                    <i className="ri-qr-code-line text-6xl text-gray-400" />
                  </div>
                  <Button onClick={startCamera} className="w-full">
                    <i className="ri-camera-line mr-2" /> Bắt đầu quét QR
                  </Button>
                  <Button onClick={handleDemoCheckin} variant="secondary" className="w-full">
                    <i className="ri-play-line mr-2" /> Demo điểm danh
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 bg-black rounded-lg object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"></div>
                  </div>
                  <Button onClick={stopCamera} variant="danger" className="w-full">
                    <i className="ri-stop-line mr-2" /> Dừng quét
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <i className="ri-user-check-line text-green-500 mr-2" /> Điểm danh thủ công
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
                    <div className="text-sm text-gray-600">
                      {d.delegateCode} {d.unit ? `- ${d.unit}` : ''}
                    </div>
                  </div>
                  {d.checkedIn ? (
                    <div className="flex items-center text-green-600">
                      <i className="ri-check-line mr-1" />
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

        {/* Success modal (auto close) */}
        {showSuccess && checkedInDelegate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-check-line text-2xl text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Điểm danh thành công!</h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                <div className="space-y-2">
                  <div><strong>Mã đại biểu:</strong> {checkedInDelegate.delegateCode}</div>
                  <div><strong>Họ tên:</strong> {checkedInDelegate.fullName}</div>
                  {checkedInDelegate.position && <div><strong>Chức vụ:</strong> {checkedInDelegate.position}</div>}
                  {checkedInDelegate.unit && <div><strong>Đơn vị:</strong> {checkedInDelegate.unit}</div>}
                  <div>
                    <strong>Thời gian:</strong>{' '}
                    {checkedInDelegate.checkinTime
                      ? new Date(checkedInDelegate.checkinTime).toLocaleString('vi-VN')
                      : new Date().toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
              <Button onClick={() => closeModal(true)} className="w-full">Tiếp tục</Button>
            </Card>
          </div>
        )}

        {/* Toast (auto hide) */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className={`px-4 py-3 rounded-lg shadow border text-sm
              ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}
            `}>
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckinPage;
