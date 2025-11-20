// src/pages/checkin/CheckinPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
// [THAY ĐỔI] Đã xóa import Navigation
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { getSocket } from '../../utils/socket';
import { checkinByQr, checkinManual } from '../../services/checkin';
import { fetchDelegatesAll } from '../../services/delegates';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const BOX_MIN = 'min-h-[16rem]';
const BOX_MAX = 'max-h-[20rem]';

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

// ===== Sort: đã điểm danh lên trước; trong nhóm đã điểm danh: mới nhất lên đầu; nhóm chưa: theo tên
const sortDelegates = (a: UIDelegate, b: UIDelegate) => {
  if (a.checkedIn && !b.checkedIn) return -1;
  if (!a.checkedIn && b.checkedIn) return 1;
  if (a.checkedIn && b.checkedIn) {
    const ta = a.checkinTime ? new Date(a.checkinTime).getTime() : 0;
    const tb = b.checkinTime ? new Date(b.checkinTime).getTime() : 0;
    return tb - ta;
  }
  return a.fullName.localeCompare(b.fullName);
};

type CamItem = { deviceId: string; label: string };
type PresetKey = 'auto' | 'fhd' | 'hd' | 'vga';
const RES_PRESETS: Record<PresetKey, { label: string; width?: number; height?: number }> = {
  auto: { label: 'Auto' },
  fhd: { label: '1920×1080', width: 1920, height: 1080 },
  hd:  { label: '1280×720',  width: 1280, height: 720 },
  vga: { label: '640×480',   width: 640,  height: 480 },
};

// ------- FIX type zoom capabilities ----------
type ZoomRange = { min: number; max: number; step?: number };
type ZoomCapabilities = MediaTrackCapabilities & { zoom?: ZoomRange };
// ---------------------------------------------

const CheckinPage: React.FC = () => {
  const { user } = useAuth();
  const [parent] = useAutoAnimate<HTMLDivElement>({ duration: 450, easing: 'ease-in-out' });
  const [isFullscreen, setIsFullscreen] = useState(false); 

  // Video/canvas & track
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);

  // Flags & raf
  const scanningRef = useRef<boolean>(false);
  const processingRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);

  // Timers
  const toastTimerRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);

  // UI
  const [scanning, setScanning] = useState(false);
  const [delegates, setDelegates] = useState<UIDelegate[]>([]);
  const [checkedInDelegate, setCheckedInDelegate] = useState<UIDelegate | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadError, setLoadError] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Camera list / presets / actual res
  const [cams, setCams] = useState<CamItem[]>([]);
  const [selectedCam, setSelectedCam] = useState<string | null>(null);
  const [preset, setPreset] = useState<PresetKey>('auto');
  const [actualRes, setActualRes] = useState<{ w?: number; h?: number }>({});

  // Zoom capabilities
  const [camCaps, setCamCaps] = useState<ZoomCapabilities | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);

  // Ô nhập mã đại biểu
  const [manualCode, setManualCode] = useState<string>('');

  // Popup cài đặt camera
  const [showCamSettings, setShowCamSettings] = useState(false);

  // Item vừa di chuyển (để highlight + sweep)
  const [lastMovedId, setLastMovedId] = useState<string | number | null>(null);

  // ==== Fullscreen Logic ====
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Không thể bật toàn màn hình: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // ==== Guards ====
  useEffect(() => {
    if (user && !['admin', 'department'].includes(user.role)) {
      window.history.back();
    }
  }, [user]);

  // ==== Load delegates ====
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingList(true);
        setLoadError('');
        const list = await fetchDelegatesAll();
        const mapped = list.map(normalizeDelegate);
        mapped.sort(sortDelegates);
        if (mounted) setDelegates(mapped);
      } catch (e: any) {
        if (mounted) setLoadError(e?.message || 'Không tải được danh sách đại biểu.');
      } finally {
        if (mounted) setLoadingList(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ==== Realtime sync ====
  useEffect(() => {
    const s = getSocket();
    const onUpdate = (evt: { delegateId: number | string; checkedIn: boolean; checkinTime?: string }) => {
      setDelegates(prev => {
        const updatedList = prev.map(x =>
          String(x.id) === String(evt.delegateId)
            ? { ...x, checkedIn: evt.checkedIn, checkinTime: evt.checkinTime ?? null }
            : x
        );
        updatedList.sort(sortDelegates);
        return updatedList;
      });
      setLastMovedId(evt.delegateId);
      window.setTimeout(() => setLastMovedId(null), 1800);
    };
    s.on('checkin.updated', onUpdate);
    return () => { s.off('checkin.updated', onUpdate); };
  }, []);

  // ==== Camera list ====
  const listVideoInputs = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const vids = devices.filter(d => d.kind === 'videoinput') as MediaDeviceInfo[];
      const items: CamItem[] = vids.map(v => ({ deviceId: v.deviceId, label: v.label || 'Camera' }));
      setCams(items);
      if (!selectedCam && items[0]) setSelectedCam(items[0].deviceId);
    } catch (e) {
      console.warn('enumerateDevices failed', e);
    }
  };
  useEffect(() => { listVideoInputs(); }, []);

  // ==== Helpers ====
  const buildConstraints = () => {
    const p = RES_PRESETS[preset];
    const targetW = p.width;
    const targetH = p.height;
    const deviceId = selectedCam ? { exact: selectedCam } : undefined;
    const advanced: any[] = [{ focusMode: 'continuous' }];

    const video: MediaTrackConstraints = {
      deviceId,
      width:  targetW ? { ideal: targetW } : undefined,
      height: targetH ? { ideal: targetH } : undefined,
      facingMode: selectedCam ? undefined : { ideal: 'environment' },
      advanced,
    };
    return { video, audio: false } as MediaStreamConstraints;
  };

  const stopStream = () => {
    scanningRef.current = false;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    trackRef.current = null;
    setActualRes({});
    setCamCaps(null);
    setZoom(null);
  };

  const startStream = async () => {
    stopStream();
    let stream: MediaStream | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia(buildConstraints());
    } catch {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }

    const video = videoRef.current!;
    video.srcObject = stream!;
    video.setAttribute('playsinline', 'true');
    video.muted = true;

    await new Promise<void>((res) => {
      const onLoaded = () => { video.removeEventListener('loadedmetadata', onLoaded); res(); };
      video.addEventListener('loadedmetadata', onLoaded);
    });
    await video.play();

    const track = stream!.getVideoTracks()[0];
    trackRef.current = track;

    const caps = (track.getCapabilities?.() as ZoomCapabilities | undefined) || null;
    setCamCaps(caps);
    const setts = track.getSettings?.();
    if (setts?.width && setts?.height) setActualRes({ w: setts.width, h: setts.height });

    if (caps?.zoom) {
      const { min, max } = caps.zoom;
      const mid = Math.min(max, Math.max(min, (min + max) / 2));
      try {
        await (track as any).applyConstraints({ advanced: [{ zoom: mid }] });
        setZoom(mid);
      } catch { /* ignore */ }
    }

    scanningRef.current = true;
    processingRef.current = false;
    rafRef.current = requestAnimationFrame(tick);
  };

  // Zoom change
  const handleZoomChange = async (val: number) => {
    setZoom(val);
    try {
      const track = trackRef.current;
      if (!track) return;
      await (track as any).applyConstraints({ advanced: [{ zoom: val }] });
    } catch { /* ignore */ }
  };

  // ==== Scan loop (robust) ====
  const tryDecode = (
    video: HTMLVideoElement,
    baseCtx: CanvasRenderingContext2D,
    w: number,
    h: number
  ) => {
    baseCtx.imageSmoothingEnabled = false;

    const scales = [1, 0.75, 0.5];
    for (const s of scales) {
      const sw = Math.max(240, Math.floor(w * s));
      const sh = Math.max(240, Math.floor(h * s));
      const off = document.createElement('canvas');
      off.width = sw; off.height = sh;
      const c2 = off.getContext('2d')!;
      c2.imageSmoothingEnabled = false;
      c2.drawImage(video, 0, 0, sw, sh);
      const img2 = c2.getImageData(0, 0, sw, sh);
      const qr2 = jsQR(img2.data, sw, sh, { inversionAttempts: 'attemptBoth' });
      if (qr2) return qr2;
    }

    const crops = [0.7, 0.5];
    for (const r of crops) {
      const cw = Math.floor(w * r), ch = Math.floor(h * r);
      const cx = Math.floor((w - cw) / 2), cy = Math.floor((h - ch) / 2);
      const img = baseCtx.getImageData(cx, cy, cw, ch);
      const qr = jsQR(img.data, cw, ch, { inversionAttempts: 'attemptBoth' });
      if (qr) return qr;
    }

    return null;
  };

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

    const code = tryDecode(video, ctx, canvas.width, canvas.height);
    if (code?.data) {
      if (!processingRef.current) {
        processingRef.current = true;
        handleQRCheckin(code.data.trim());
      }
      next();
      return;
    }

    next();
  };

  // ==== Start/stop ====
  const startCamera = async () => {
    if (scanning) return;
    setScanning(true);
  };

  const stopCamera = () => {
    scanningRef.current = false;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    stopStream();
    setScanning(false);
  };

  // react to scanning toggle
  useEffect(() => {
    if (!scanning) return;
    startStream().catch((e) => {
      console.error('Không thể mở camera:', e);
      showToast('Không thể mở camera. Hãy cấp quyền camera hoặc thử cam khác.', 'error', 3500);
      setScanning(false);
    });
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  // restart stream when cam / preset changes
  useEffect(() => {
    if (scanning) startStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCam, preset]);

  // ==== Cleanup ====
  useEffect(() => () => {
    stopCamera();
    if (toastTimerRef.current)  { clearTimeout(toastTimerRef.current);  toastTimerRef.current  = null; }
    if (resumeTimerRef.current) { clearTimeout(resumeTimerRef.current); resumeTimerRef.current = null; }
  }, []);

  // ==== Toast helper ====
  const showToast = (message: string, type: 'success' | 'error' = 'error', ms = 3000) => {
    setToast({ type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), ms);
  };

  // ==== Success handling ====
  const finishLocalUpdate = (d: any, autoResume = true) => {
    const ui = normalizeDelegate(d);
    const newCheckinTime = ui.checkinTime || new Date().toISOString();

    let fullUpdatedDelegate: UIDelegate | null = null;

    setDelegates(prev => {
      const updatedList = prev.map(x => {
        if (String(x.id) === String(ui.id)) {
          fullUpdatedDelegate = {
            ...x,
            ...ui,
            checkedIn: true,
            checkinTime: newCheckinTime,
          };
          return fullUpdatedDelegate;
        }
        return x;
      });
      updatedList.sort(sortDelegates);
      return updatedList;
    });

    if (!fullUpdatedDelegate) {
      fullUpdatedDelegate = { ...ui, checkedIn: true, checkinTime: newCheckinTime };
    }

    setCheckedInDelegate(fullUpdatedDelegate);
    setShowSuccess(true);

    // đánh dấu item vừa di chuyển (hiệu ứng bump + sweep)
    setLastMovedId(ui.id);
    window.setTimeout(() => setLastMovedId(null), 1800);

    if (autoResume) {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = window.setTimeout(() => { closeModal(true); }, 2500);
    }
  };

  // ==== API actions ====
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
      const data = res.data;
      if (data?.ok && data.delegate) {
        finishLocalUpdate(data.delegate, false);
      }
    } catch (e: any) {
      console.error(e);
      showToast(e?.response?.data?.message || 'Không thể điểm danh thủ công', 'error', 3000);
    }
  };

  // Form submit cho ô nhập mã đại biểu
  const handleManualCodeSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;

    const found = delegates.find(
      d => d.delegateCode && d.delegateCode.toLowerCase() === code.toLowerCase()
    );

    if (!found) {
      showToast('Không tìm thấy đại biểu với mã này.', 'error', 2500);
      return;
    }

    if (found.checkedIn) {
      showToast('Đại biểu này đã được điểm danh.', 'success', 2500);
      setManualCode('');
      return;
    }

    handleManualCheckin(found.id);
    setManualCode('');
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
  const zoomCaps = camCaps?.zoom;

  return (
    <div className="relative min-h-screen">
      
      <img
        src="/BG Chuyen trang-01.png"
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover -z-20"
      />
      <div className="absolute inset-0 w-full h-full bg-black/40 backdrop-brightness-75 backdrop-blur-[2px] -z-10" />

      <style>{`
        @keyframes bump {
          0% { transform: translateY(8px) scale(0.98); opacity: .85; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes sweep {
          0%   { transform: translateX(-120%); opacity: 0; }
          25%  { opacity: .45; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        .moved-card {
          animation: bump 320ms ease-out;
          position: relative;
          overflow: hidden;
        }
        .moved-card::after {
          content: '';
          position: absolute;
          inset: 0 auto 0 0;
          width: 40%;
          pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent);
          transform: translateX(-120%);
          animation: sweep 900ms ease-out forwards;
        }
      `}</style>
      
      <div className="relative z-10">
        {/* [THAY ĐỔI] Đã xóa <Navigation /> */}

        <div className="container mx-auto px-4 py-6 md:py-8">

          {/* Nút Quay về Dashboard */}
          <div className="mb-4">
            <a 
              href="/dashboard" // <-- THAY ĐỔI ĐƯỜNG DẪN NÀY NẾU CẦN
              className="inline-flex items-center text-sm font-medium text-gray-200 hover:text-white transition-colors"
            >
              <i className="ri-arrow-left-s-line mr-1" />
              Quay về Dashboard
            </a>
          </div>

          {/* Header */}
          <div className="mb-6">
            <div className="flex-1 min-w-0">
              
              <div className="flex justify-between items-center mb-2">
                <div className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium">
                  <i className="ri-qr-scan-line mr-1 text-xs" />
                  Hệ thống điểm danh Đại hội
                </div>
                
                <div className="flex-shrink-0 md:ml-4">
                  <Button
                    variant="secondary"
                    onClick={toggleFullscreen}
                    className="w-auto px-2.5"
                    aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                  >
                    {isFullscreen ? (
                      <i className="ri-fullscreen-exit-line" />
                    ) : (
                      <i className="ri-fullscreen-line" />
                    )}
                  </Button>
                </div>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                Điểm danh đại biểu
              </h1>
              
              <p className="text-gray-200 text-sm md:text-base mb-3">
                Quét mã QR trên thẻ đại biểu hoặc nhập mã đại biểu để điểm danh thủ công.
              </p>

              {loadingList ? (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs">
                  <i className="ri-loader-4-line animate-spin mr-1.5" />
                  Đang tải danh sách đại biểu...
                </div>
              ) : loadError ? (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-100 text-xs">
                  <i className="ri-error-warning-line mr-1.5" />
                  {loadError}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 text-xs mt-1.5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                    <i className="ri-group-line mr-1" />
                    Tổng: {total}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                    <i className="ri-checkbox-circle-line mr-1" />
                    Đã điểm danh: {checked}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                    <i className="ri-bar-chart-line mr-1" />
                    Tỉ lệ: {rate}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* QR + Manual */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Quét QR */}
            <Card className="h-full">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-gray-800 flex items-center">
                    <i className="ri-qr-scan-line text-blue-500 mr-2" />
                    Quét mã QR
                    <div className="flex items-center gap-2 justify-start md:justify-end ml-4">
                      <button
                        type="button"
                        onClick={() => setShowCamSettings(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 bg-white text-xs md:text-sm text-gray-700 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition"
                      >
                        <i className="ri-settings-3-line text-sm" />
                        <span className="hidden sm:inline">Cài đặt camera</span>
                      </button>
                    </div>
                  </h2>

                  <p className="text-xs text-gray-500 mt-0.5">
                    Đưa thẻ đại biểu vào khung hình để hệ thống tự động nhận diện.
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-50 text-[11px] text-gray-600">
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      scanning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                    }`}
                  />
                  {scanning ? 'Đang quét' : 'Chưa bật camera'}
                </span>
              </div>

              <div className="text-center">
                {scanning ? (
                  <div className="space-y-4">
                    <div className={`relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-cyan-200 ${BOX_MIN} ${BOX_MAX}`}>
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full bg-black object-cover" />
                      <canvas ref={canvasRef} className="hidden" />
                      {/* Overlay: khung + beam */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-6 rounded-xl border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.35)]" />
                        <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-white/60 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Đặt QR vào khung, giữ tay chắc và đủ sáng.</p>
                    <Button onClick={stopCamera} variant="danger" className="w-full">
                      <i className="ri-stop-line mr-2" /> Dừng quét
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-44 h-44 md:w-48 md:h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                      <i className="ri-qr-code-line text-5xl md:text-6xl text-gray-400" />
                    </div>
                    <Button onClick={startCamera} className="w-full">
                      <i className="ri-camera-line mr-2" /> Bắt đầu quét QR
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Điểm danh thủ công */}
            <Card className="h-full">
              <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <i className="ri-user-check-line text-green-500 mr-2" /> Điểm danh thủ công
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                Dùng khi QR bị lỗi hoặc không quét được. Nhập mã đại biểu hoặc chọn trực tiếp bên dưới.
              </p>

              {/* Ô nhập mã đại biểu */}
              <form onSubmit={handleManualCodeSubmit} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  placeholder="Nhập mã đại biểu (VD: DB001)"
                  className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button type="submit" className="whitespace-nowrap">
                  Điểm danh
                </Button>
              </form>

              {/* Danh sách có auto-animate + moved highlight */}
              <div ref={parent} className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {delegates.map(d => {
                  const isMoved = lastMovedId != null && String(d.id) === String(lastMovedId);
                  return (
                    <div
                      key={d.id}
                      className={`relative flex items-center justify-between p-3 rounded-lg border transition
                        ${d.checkedIn
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/40'}
                        ${isMoved ? 'moved-card ring-2 ring-emerald-400 shadow-lg' : ''}
                      `}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 text-sm truncate">
                          {d.fullName}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          <span className="font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded">
                            {d.delegateCode}
                          </span>
                          {d.unit ? <span className="ml-2">{d.unit}</span> : null}
                        </div>
                      </div>
                      {d.checkedIn ? (
                        <div className="flex flex-col items-end text-green-600 text-xs">
                          <span className="inline-flex items-center">
                            <i className="ri-check-line mr-1" />
                            Đã điểm danh
                          </span>
                          {d.checkinTime && (
                            <span className="text-[10px] text-gray-500 mt-0.5">
                              {new Date(d.checkinTime).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleManualCheckin(d.id)}
                          className="text-xs px-3 py-1.5"
                        >
                          Điểm danh
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* --- PHẦN POPUP/MODAL/TOAST ĐỂ BÊN NGOÀI DIV NỘI DUNG --- */}
      
      {/* Popup cài đặt camera */}
      {showCamSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-3">
          <Card className="w-full max-w-md p-4 rounded-xl shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-800 flex items-center">
                <i className="ri-settings-3-line text-blue-500 mr-1.5" />
                Cài đặt camera
              </h3>

              <button
                onClick={() => setShowCamSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-xl" />
              </button>
            </div>

            <p className="text-[11px] text-gray-500 mb-3">
              Chọn nguồn camera và độ phân giải phù hợp.
            </p>

            {/* Body */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Camera */}
                <div>
                  <label className="text-[11px] font-medium text-gray-500 mb-1 flex items-center">
                    <i className="ri-camera-line text-blue-500 mr-1 text-sm" />
                    Camera
                  </label>

                  <div className="relative">
                    <select
                      className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-xs pr-7 bg-white focus:ring-1 focus:ring-blue-500"
                      value={selectedCam || ''}
                      onChange={e => setSelectedCam(e.target.value)}
                    >
                      {cams.map(c => (
                        <option key={c.deviceId} value={c.deviceId}>
                          {c.label || 'Camera'}
                        </option>
                      ))}
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center text-[11px] text-blue-600 mt-1 hover:text-blue-700"
                    onClick={listVideoInputs}
                  >
                    <i className="ri-refresh-line text-xs mr-1" />
                    Làm mới
                  </button>
                </div>

                {/* Resolution */}
                <div>
                  <label className="text-[11px] font-medium text-gray-500 mb-1 flex items-center">
                    <i className="ri-focus-2-line text-indigo-500 mr-1 text-sm" />
                    Độ phân giải
                  </label>

                  <div className="relative">
                    <select
                      className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-xs pr-7 bg-white focus:ring-1 focus:ring-blue-500"
                      value={preset}
                      onChange={e => setPreset(e.target.value as PresetKey)}
                    >
                      {Object.entries(RES_PRESETS).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                  </div>

                  <div className="text-[10px] text-gray-400 mt-1">
                    Thực tế: {actualRes.w ? `${actualRes.w}×${actualRes.h}` : '—'}
                  </div>
                </div>
              </div>

              {/* Zoom */}
              {zoomCaps && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-gray-500 flex items-center">
                      <i className="ri-zoom-in-line text-green-500 mr-1 text-sm" />
                      Thu phóng
                    </label>
                    <span className="text-[11px] text-gray-500">
                      {zoom ? `${zoom.toFixed(2)}x` : `${zoomCaps.min}–${zoomCaps.max}x`}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={zoomCaps.min}
                    max={zoomCaps.max}
                    step={zoomCaps.step ?? 0.1}
                    value={zoom ?? zoomCaps.min}
                    onChange={e => handleZoomChange(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />

                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Gần</span>
                    <span>Xa</span>
                  </div>
                </div>
              )}

              {/* Status + Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-[10px] text-gray-700 border border-gray-200">
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1 ${scanning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}
                  />
                  {scanning ? 'Đang quét' : 'Đang tắt'}
                </span>

                <div className="flex items-center gap-2">
                  {scanning ? (
                    <Button onClick={stopCamera} variant="danger" className="text-xs px-3 py-1">
                      <i className="ri-stop-line mr-1" /> Dừng
                    </Button>
                  ) : (
                    <Button onClick={startCamera} className="text-xs px-3 py-1">
                      <i className="ri-play-circle-line mr-1" /> Bắt đầu
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    className="text-xs px-3 py-1"
                    onClick={() => setShowCamSettings(false)}
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Success modal */}
      {showSuccess && checkedInDelegate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-2xl text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Điểm danh thành công!
            </h2>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left text-sm">
              <div className="space-y-2">
                <div><strong>Mã đại biểu:</strong> {checkedInDelegate.delegateCode}</div>
                <div><strong>Họ tên:</strong> {checkedInDelegate.fullName}</div>
                {checkedInDelegate.position && (<div><strong>Chức vụ:</strong> {checkedInDelegate.position}</div>)}
                {checkedInDelegate.unit && (<div><strong>Đơn vị:</strong> {checkedInDelegate.unit}</div>)}
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

      {/* Toast */}
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
  );
};

export default CheckinPage;