import React, { useEffect, useRef, useState } from 'react';
import { getSocket } from '../../utils/socket';
import { fetchDelegatesAll, fetchDelegateById } from '../../services/delegates';

interface CheckinData {
  id: number | string;
  delegateCode: string;
  fullName: string;
  unit?: string;
  position?: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
  checkedIn?: boolean;
  checkinTime?: string | null;
}

const normalizeDelegate = (d: any): CheckinData => {
  const di = d.delegateInfo ?? d;
  const user = d.user ?? d;
  return {
    id: di.id ?? d.id ?? user.id,
    delegateCode: di.code ?? d.code ?? d.delegateCode,
    fullName: user.name ?? d.name ?? d.fullName ?? '',
    unit: user.department?.name ?? d.department?.name ?? d.unit,
    position: di.position ?? d.position,
    email: user.email ?? d.email,
    phone: di.phone ?? d.phone,
    avatar: user.ava ?? d.ava ?? null,
    checkedIn: Boolean(di.checkedIn ?? d.checkedIn),
    checkinTime: (di.checkinTime ?? d.checkinTime) || null,
  };
};

const DUP_WINDOW_MS = 5000;   // chống trùng theo ID trong 5s
const HIDE_AFTER_MS = 10000;  // 10s không có ai mới thì ẩn khung

const CheckinDisplay: React.FC = () => {
  const [current, setCurrent] = useState<CheckinData | null>(null);
  const [connected, setConnected] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // TTS & UI flags
  const [mute, setMute] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // danh sách gần đây (phòng cần hiển thị lại)
  const [recentCheckins, setRecentCheckins] = useState<CheckinData[]>([]);

  // ----- refs để tránh stale state trong handler -----
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const muteRef = useRef<boolean>(mute);
  const ttsReadyRef = useRef<boolean>(ttsReady);
  const lastShownRef = useRef<{ id?: string; at: number }>({ id: undefined, at: 0 });
  const recentCheckinsRef = useRef<CheckinData[]>([]);
  const hideTimerRef = useRef<number | null>(null);
  const pendingSpeechRef = useRef<string | null>(null);

  useEffect(() => { muteRef.current = mute; }, [mute]);
  useEffect(() => { ttsReadyRef.current = ttsReady; }, [ttsReady]);
  useEffect(() => { recentCheckinsRef.current = recentCheckins; }, [recentCheckins]);

  // ---------- TTS helpers ----------
  const ensureVoices = (): SpeechSynthesisVoice[] => {
    const v = window.speechSynthesis?.getVoices?.() || [];
    if (v.length === 0) {
      // gọi getVoices() lần nữa để kích nạp trên 1 số trình duyệt
      window.speechSynthesis?.getVoices?.();
    }
    return v;
  };

  const speak = (text: string) => {
    if (muteRef.current || !ttsReadyRef.current || !('speechSynthesis' in window)) return;
    try {
      // nếu chưa có voice, pick lại
      if (!voiceRef.current) {
        const voices = ensureVoices();
        const vi = voices.find(v => /vi|Viet/i.test((v.lang || '') + (v.name || '')));
        voiceRef.current = vi || voices[0] || null;
      }

      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.lang = voiceRef.current?.lang || 'vi-VN';
      u.rate = 1; u.pitch = 1; u.volume = 1;

      // iOS hacks
      try { window.speechSynthesis.cancel(); } catch {}
      try { window.speechSynthesis.pause(); window.speechSynthesis.resume(); } catch {}

      u.onerror = (e) => console.warn('TTS error:', e);
      window.speechSynthesis.speak(u);
      if (navigator.vibrate) navigator.vibrate(40);
    } catch (e) {
      console.warn('TTS speak() exception:', e);
    }
  };

  const enableAudio = () => {
    if (!('speechSynthesis' in window)) { setTtsReady(true); return; }

    const voices = ensureVoices();
    const vi = voices.find(v => /vi|Viet/i.test((v.lang || '') + (v.name || '')));
    voiceRef.current = vi || voices[0] || null;

    const u = new SpeechSynthesisUtterance('Âm thanh đã được bật');
    if (voiceRef.current) u.voice = voiceRef.current;
    u.lang = voiceRef.current?.lang || 'vi-VN';
    u.rate = 1;

    // Bật cờ ngay khi bắt đầu (phòng khi onend không fire trên iOS)
    u.onstart = () => {
      setTtsReady(true);
      // nếu có câu pending thì đọc luôn
      if (pendingSpeechRef.current) {
        const text = pendingSpeechRef.current;
        pendingSpeechRef.current = null;
        speak(text);
      }
    };

    // Fallback: sau 1200ms vẫn coi như ready
    const fallback = window.setTimeout(() => setTtsReady(true), 1200);
    u.onend = () => { try { window.clearTimeout(fallback); } catch {} };

    try { window.speechSynthesis.cancel(); } catch {}
    try { window.speechSynthesis.resume(); } catch {}
    try { window.speechSynthesis.speak(u); }
    catch { setTtsReady(true); }
  };

  // nạp voice (và update khi voiceschanged)
  useEffect(() => {
    const pickVoice = () => {
      const voices = ensureVoices();
      if (!voices.length) return;
      const vi = voices.find(v => /vi|Viet/i.test((v.lang || '') + (v.name || '')));
      voiceRef.current = vi || voices[0] || null;
    };
    pickVoice();
    window.speechSynthesis?.addEventListener?.('voiceschanged', pickVoice);
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', pickVoice);
  }, []);

  // auto-unlock khi người dùng chạm lần đầu (nếu quên bấm nút)
  useEffect(() => {
    const once = () => { if (!ttsReadyRef.current) enableAudio(); };
    window.addEventListener('pointerdown', once, { once: true });
    return () => window.removeEventListener('pointerdown', once);
  }, []);

  // keep-alive: iOS có thể "ngủ" TTS sau thời gian rảnh
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const id = window.setInterval(() => {
      try { window.speechSynthesis.resume(); } catch {}
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  // Ẩn khung sau HIDE_AFTER_MS không có ai mới
  const scheduleHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setCurrent(null);
    }, HIDE_AFTER_MS);
  };

  // ---------- Tải danh sách đã check-in gần nhất ----------
  useEffect(() => {
    setIsVisible(true);
    (async () => {
      try {
        const all = await fetchDelegatesAll();
        const list = (all || [])
          .map(normalizeDelegate)
          .filter(x => x.checkedIn && x.checkinTime)
          .sort((a, b) => new Date(b.checkinTime || 0).getTime() - new Date(a.checkinTime || 0).getTime());

        setRecentCheckins(list);
        if (list.length > 0) {
          setCurrent(list[0]);
          lastShownRef.current = { id: String(list[0].id), at: Date.now() };
          scheduleHide();
        }
      } catch (e) {
        console.error('Không tải được danh sách đã điểm danh.', e);
      }
    })();

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      try { window.speechSynthesis?.cancel(); } catch {}
    };
  }, []);

  // ---------- Socket: đăng ký 1 lần ----------
  useEffect(() => {
    const s = getSocket();

    // đặt trạng thái ngay lập tức
    setConnected(s.connected ? 'connected' : 'connecting');

    const onConnect = () => setConnected('connected');
    const onDisconnect = () => setConnected('disconnected');
    const onConnectError = () => setConnected('disconnected');
    const onReconnectAttempt = () => setConnected('connecting');
    const onReconnect = () => setConnected('connected');

    const onUpdate = async (evt: { delegateId: number; checkedIn: boolean; checkinTime?: string }) => {
      if (!evt?.checkedIn) return;

      // chống trùng theo ID trong 5s
      const now = Date.now();
      if (lastShownRef.current.id === String(evt.delegateId) && (now - lastShownRef.current.at) < DUP_WINDOW_MS) {
        return;
      }

      try {
        let raw: any = null;
        try {
          raw = await fetchDelegateById(evt.delegateId);
        } catch {
          // fallback
        }

        const fallbackFromList = !raw ? recentCheckinsRef.current.find(x => String(x.id) === String(evt.delegateId)) : null;
        const d = normalizeDelegate(raw?.item ?? raw ?? fallbackFromList ?? { id: evt.delegateId });
        d.checkinTime = d.checkinTime || evt.checkinTime || new Date().toISOString();

        setCurrent(d);
        lastShownRef.current = { id: String(d.id), at: Date.now() };
        setRecentCheckins(prev => {
          const filtered = prev.filter(x => String(x.id) !== String(d.id));
          return [d, ...filtered];
        });

        // Lập lại timer ẩn khung
        scheduleHide();

        // TTS: nếu chưa sẵn sàng, lưu pending để đọc sau khi enable
        const sentence = d.fullName
          ? `Chào mừng đại biểu ${d.fullName}${d.unit ? `, ${d.unit}` : ''}`
          : `Điểm danh thành công.`;

        if (!ttsReadyRef.current) {
          pendingSpeechRef.current = sentence;
        } else {
          speak(sentence);
        }
      } catch (e) {
        console.error('Sự cố xử lý checkin.updated', e);
      }
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('connect_error', onConnectError);
    s.on('reconnect_attempt', onReconnectAttempt as any);
    s.on('reconnect', onReconnect as any);
    s.on('checkin.updated', onUpdate);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('connect_error', onConnectError);
      s.off('reconnect_attempt', onReconnectAttempt as any);
      s.off('reconnect', onReconnect as any);
      s.off('checkin.updated', onUpdate);
    };
  }, []); // Đăng ký đúng 1 lần

  const enterFullscreen = () => {
    const el: any = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-cyan-50 via-white to-cyan-100 relative overflow-hidden">
      {/* nền */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 opacity-5">
          <div className="absolute inset-0 border-4 border-cyan-400 rounded-full"></div>
          <div className="absolute inset-8 border-3 border-cyan-500 rounded-full"></div>
          <div className="absolute inset-16 border-2 border-cyan-600 rounded-full"></div>
        </div>
        <div className="absolute bottom-20 right-20 w-48 h-48 opacity-5">
          <div className="absolute inset-0 border-3 border-cyan-400 rounded-full"></div>
          <div className="absolute inset-6 border-2 border-cyan-500 rounded-full"></div>
          <div className="absolute inset-12 border border-cyan-600 rounded-full"></div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-400/5 via-transparent to-cyan-600/5"></div>
      </div>

      {/* Header điều khiển */}
      <div className="relative z-10 px-6 py-4 flex items-center justify-between gap-3 flex-wrap bg-white/80 backdrop-blur-sm border-b border-cyan-200/50">
        <div className="text-xl font-bold text-gray-800 flex items-center gap-3">
          <span className={`inline-flex h-3 w-3 rounded-full ${connected === 'connected' ? 'bg-emerald-500' : connected === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
          <i className="ri-live-line text-cyan-600"></i>
          <span>Check-in Display</span>
          <div className="text-sm text-gray-500 font-normal">
            Realtime:{' '}
            <span className={connected === 'connected' ? 'text-green-600' : connected === 'connecting' ? 'text-yellow-600' : 'text-red-600'}>
              {connected === 'connected' ? 'Đã kết nối' : connected === 'connecting' ? 'Đang kết nối…' : 'Mất kết nối'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!ttsReady && (
            <button
              onClick={enableAudio}
              className="group px-4 py-2 rounded-xl border text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap cursor-pointer transform hover:-translate-y-1"
              title="Bật âm thanh (nhấn 1 lần)"
            >
              <i className="ri-volume-up-line mr-2 group-hover:scale-110 transition-transform"></i>
              Bật âm thanh
            </button>
          )}

          <button
            onClick={() => setMute(m => !m)}
            className="group px-4 py-2 rounded-xl border text-sm bg-white/90 hover:bg-white text-gray-700 hover:text-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap cursor-pointer transform hover:-translate-y-1"
            title={mute ? 'Bật tiếng' : 'Tắt tiếng'}
          >
            {mute ? (
              <i className="ri-volume-mute-line mr-2 group-hover:scale-110 transition-transform" />
            ) : (
              <i className="ri-volume-up-line mr-2 group-hover:scale-110 transition-transform" />
            )}
            {mute ? 'Đang tắt' : 'Đang bật'}
          </button>

          <button
            onClick={enterFullscreen}
            className="group px-4 py-2 rounded-xl border text-sm bg-white/90 hover:bg-white text-gray-700 hover:text-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap cursor-pointer transform hover:-translate-y-1"
            title="Toàn màn hình"
          >
            <i className="ri-fullscreen-line mr-2 group-hover:scale-110 transition-transform"></i>
            Toàn màn hình
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 px-6 pb-10 pt-6">
        {!current ? (
         
          null
        ) : (
          <div className="mx-auto max-w-5xl">
            <div className={`relative overflow-hidden rounded-3xl md:rounded-[2rem] bg-white/95 backdrop-blur-sm shadow-2xl border border-cyan-200/50 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="absolute inset-0 opacity-90 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-emerald-400/5 to-cyan-600/5"></div>
              </div>

              <div className="relative p-6 md:p-12">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-8">
                  <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 px-6 py-3 text-lg font-semibold shadow-lg">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 animate-pulse">
                      <i className="ri-check-line text-emerald-700 text-sm" />
                    </span>
                    Điểm danh thành công
                  </div>
                  <div className="text-lg text-gray-600 bg-white/80 px-4 py-2 rounded-xl shadow-md">
                    <i className="ri-time-line mr-2 text-cyan-600"></i>
                    {current.checkinTime
                      ? new Date(current.checkinTime).toLocaleString('vi-VN')
                      : new Date().toLocaleString('vi-VN')}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                  <div className="shrink-0 relative">
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-cyan-400/40 via-emerald-400/30 to-cyan-600/40 blur-2xl animate-pulse"></div>
                    {current.avatar ? (
                      <img
                        src={current.avatar}
                        alt={current.fullName}
                        className="relative w-56 h-56 md:w-72 md:h-72 rounded-full object-cover border-4 border-white shadow-2xl"
                      />
                    ) : (
                      <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full bg-white border-4 border-white shadow-2xl flex items-center justify-center p-8 overflow-hidden">
                        <img
                          src="src/assets/image/BieuTrung.png"
                          alt="Logo Đại hội"
                          className="object-contain w-full h-full"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full text-center">
                    <h2 className="text-3xl font-semibold text-gray-700 mb-4">CHÀO MỪNG</h2>
                    <div className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-cyan-700 to-cyan-800">
                        {current.fullName}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-4 text-gray-700 mb-8">
                      {current.position && (
                        <div className="flex items-center justify-center gap-3 text-2xl font-semibold text-emerald-700">
                          <i className="ri-vip-crown-line" />
                          <span>{current.position}</span>
                        </div>
                      )}
                      {current.unit && (
                        <div className="flex items-center justify-center gap-3 text-xl font-medium text-purple-700">
                          <i className="ri-building-line" />
                          <span>{current.unit}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-3 bg-gray-100 rounded-lg px-4 py-2 text-lg">
                        <i className="ri-id-card-line text-cyan-700" />
                        <span className="text-sm text-gray-500">Mã đại biểu:</span>
                        <b className="text-gray-800">{current.delegateCode}</b>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <i className="ri-checkbox-circle-fill text-3xl text-emerald-600"></i>
                        <span className="text-2xl font-bold text-emerald-700">Chào mừng tham dự Đại hội!</span>
                      </div>
                      <p className="text-lg text-gray-700">
                        Chúc đồng chí có một kỳ Đại hội thành công tốt đẹp!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>            
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckinDisplay;
