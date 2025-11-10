import React, { useEffect, useRef, useState } from 'react';
import { getSocket } from '../../utils/socket';
import { fetchDelegatesAll, fetchDelegateById } from '../../services/delegates';

type UIDelegate = {
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
    email: user.email ?? d.email,
    phone: di.phone ?? d.phone,
    avatar: user.ava ?? d.ava ?? null,
    checkedIn: Boolean(di.checkedIn ?? d.checkedIn),
    checkinTime: (di.checkinTime ?? d.checkinTime) || null,
  };
};

// tránh đọc trùng trong một khoảng ngắn nếu event socket bắn lại nhiều lần
const DUP_WINDOW_MS = 5000;

const CheckinDisplay: React.FC = () => {
  const [current, setCurrent] = useState<UIDelegate | null>(null);
  const [connected, setConnected] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // TTS
  const [mute, setMute] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // danh sách để có thể lấy fallback (khi fetch-by-id lỗi)
  const [checkedList, setCheckedList] = useState<UIDelegate[]>([]);

  const lastShownRef = useRef<{ id?: string; at: number }>({ id: undefined, at: 0 });

  // ====== TTS setup ======
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices?.() || [];
      const vi = voices.find(v => /vi/i.test(v.lang) || /Viet/i.test(v.name));
      voiceRef.current = vi || voices[0] || null;
    };
    loadVoices();
    window.speechSynthesis?.addEventListener?.('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', loadVoices);
  }, []);

  const enableAudio = () => {
    try {
      window.speechSynthesis?.cancel();
      const u = new SpeechSynthesisUtterance('Âm thanh đã được bật');
      if (voiceRef.current) u.voice = voiceRef.current;
      u.lang = voiceRef.current?.lang || 'vi-VN';
      u.rate = 1;
      u.volume = 1;
      window.speechSynthesis?.speak(u);
      setTtsReady(true);
    } catch {
      setTtsReady(true);
    }
  };

  const speak = (text: string) => {
    if (mute) return;
    if (!ttsReady) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.lang = voiceRef.current?.lang || 'vi-VN';
      u.rate = 1;
      u.volume = 1;
      window.speechSynthesis.cancel(); // clear queue cũ
      window.speechSynthesis.speak(u);
    } catch {}
    if (navigator.vibrate) navigator.vibrate(50);
  };

  // ====== Load người đã điểm danh gần nhất để có màn hình ban đầu ======
  useEffect(() => {
    (async () => {
      try {
        const all = await fetchDelegatesAll();
        const list = (all || [])
          .map(normalizeDelegate)
          .filter(x => x.checkedIn && x.checkinTime)
          .sort((a, b) => new Date(b.checkinTime || 0).getTime() - new Date(a.checkinTime || 0).getTime());
        setCheckedList(list);
        if (list.length) {
          const first = list[0];
          setCurrent(first);
          lastShownRef.current = { id: String(first.id), at: Date.now() };
        }
      } catch (e) {
        console.error('Không tải được danh sách đã điểm danh.', e);
      }
    })();
  }, []);

  // ====== Socket: có check-in mới thì hiển thị ngay & đọc tên ======
  useEffect(() => {
    const s = getSocket();
    const onConnect = () => setConnected('connected');
    const onDisconnect = () => setConnected('disconnected');

    const onUpdate = async (evt: { delegateId: number; checkedIn: boolean; checkinTime?: string }) => {
      if (!evt?.checkedIn) return;

      const now = Date.now();
      if (lastShownRef.current.id === String(evt.delegateId) && (now - lastShownRef.current.at) < DUP_WINDOW_MS) return;

      try {
        let raw: any = null;
        try {
          raw = await fetchDelegateById(evt.delegateId);
        } catch { /* fallback */ }

        const fallbackFromList = !raw ? checkedList.find(x => String(x.id) === String(evt.delegateId)) : null;
        const d = normalizeDelegate(raw?.item ?? raw ?? fallbackFromList ?? { id: evt.delegateId });
        d.checkinTime = d.checkinTime || evt.checkinTime || new Date().toISOString();

        setCurrent(d);
        lastShownRef.current = { id: String(d.id), at: Date.now() };

        // cập nhật vào danh sách (đầu list)
        setCheckedList(prev => {
          const filtered = prev.filter(x => String(x.id) !== String(d.id));
          return [d, ...filtered];
        });

        // ĐỌC TÊN
        if (d.fullName) {
          speak(`Xin mời đại biểu ${d.fullName}${d.unit ? `, ${d.unit}` : ''}. Điểm danh thành công.`);
        } else {
          speak(`Điểm danh thành công.`);
        }
      } catch (e) {
        console.error('Sự cố xử lý checkin.updated', e);
      }
    };

    setConnected('connecting');
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('checkin.updated', onUpdate);
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('checkin.updated', onUpdate);
    };
  }, [mute, ttsReady, checkedList]);

  // ====== UI helpers ======
  const enterFullscreen = () => {
    const el: any = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  const standby = (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="text-7xl mb-6">🎤</div>
      <div className="text-2xl font-semibold text-gray-700">Đang chờ điểm danh…</div>
      <div className="mt-2 text-sm text-gray-500">
        Realtime:{' '}
        <span className={connected === 'connected' ? 'text-green-600' : connected === 'connecting' ? 'text-yellow-600' : 'text-red-600'}>
          {connected === 'connected' ? 'Đã kết nối' : connected === 'connecting' ? 'Đang kết nối…' : 'Mất kết nối'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      {/* Top controls */}
      <div className="px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Màn hình Check-in
        </div>

        <div className="flex items-center gap-2">
          {!ttsReady && (
            <button
              onClick={enableAudio}
              className="px-3 py-1 rounded-lg border text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow"
              title="Bật âm thanh (nhấn 1 lần)"
            >
              <i className="ri-volume-up-line mr-1" /> Bật âm thanh
            </button>
          )}

          <button
            onClick={() => setMute(m => !m)}
            className="px-3 py-1 rounded-lg border text-sm bg-white hover:bg-gray-50"
            title={mute ? 'Bật tiếng' : 'Tắt tiếng'}
          >
            {mute ? <i className="ri-volume-mute-line mr-1" /> : <i className="ri-volume-up-line mr-1" />} {mute ? 'Đang tắt' : 'Đang bật'}
          </button>

          <button
            onClick={enterFullscreen}
            className="px-3 py-1 rounded-lg border text-sm bg-white hover:bg-gray-50"
            title="Toàn màn hình"
          >
            <i className="ri-fullscreen-line mr-1" /> Toàn màn hình
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 pb-10">
        {!current ? (
          standby
        ) : (
          <div className="mx-auto max-w-5xl">
            {/* Success banner */}
            <div className="relative overflow-hidden rounded-3xl md:rounded-[2rem] bg-white/90 shadow-xl border border-gray-100">
              <div className="absolute inset-0 opacity-90 bg-[radial-gradient(1200px_400px_at_-10%_-10%,rgba(99,102,241,0.08),transparent),radial-gradient(1200px_400px_at_110%_110%,rgba(16,185,129,0.08),transparent)]" />
              <div className="relative p-6 md:p-10">
                {/* Badge + time */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-sm font-medium">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-200">
                      <i className="ri-check-line text-emerald-700 text-[12px]" />
                    </span>
                    Điểm danh thành công
                  </div>
                  <div className="text-xs text-gray-500">
                    {current.checkinTime
                      ? new Date(current.checkinTime).toLocaleString('vi-VN')
                      : new Date().toLocaleString('vi-VN')}
                  </div>
                </div>

                {/* Main row */}
                <div className="mt-6 flex flex-col md:flex-row items-center md:items-start gap-8">
                  {/* Avatar */}
                  <div className="shrink-0 relative">
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-400/40 to-indigo-400/40 blur-xl" />
                    {current.avatar ? (
                      <img
                        src={current.avatar}
                        alt={current.fullName}
                        className="relative w-44 h-44 md:w-56 md:h-56 rounded-2xl object-cover border shadow"
                      />
                    ) : (
                      <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500
                                      text-white flex items-center justify-center text-6xl font-extrabold border shadow">
                        {current.fullName?.trim()?.charAt(0) ?? 'Đ'}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 w-full">
                    <div className="text-4xl md:text-5xl font-extrabold">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                        {current.fullName}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                      <div className="inline-flex items-center gap-2">
                        <i className="ri-id-card-line text-indigo-500" />
                        <span>Mã đại biểu:</span>
                        <b className="ml-1">{current.delegateCode}</b>
                      </div>

                      {current.position && (
                        <div className="inline-flex items-center gap-2">
                          <i className="ri-vip-crown-line text-amber-500" />
                          <span>Chức vụ:</span>
                          <b className="ml-1">{current.position}</b>
                        </div>
                      )}

                      {current.unit && (
                        <div className="inline-flex items-center gap-2">
                          <i className="ri-building-line text-emerald-600" />
                          <span>Đơn vị:</span>
                          <b className="ml-1">{current.unit}</b>
                        </div>
                      )}

                      {current.email && (
                        <div className="inline-flex items-center gap-2">
                          <i className="ri-mail-line text-gray-400" />
                          {current.email}
                        </div>
                      )}

                      {current.phone && (
                        <div className="inline-flex items-center gap-2">
                          <i className="ri-phone-line text-gray-400" />
                          {current.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>



              











                {/* Bottom hint */}
                <div className="mt-8 flex items-center justify-between text-sm text-gray-500">
                  <div>
                    Realtime:{' '}
                    <span className={connected === 'connected' ? 'text-emerald-600' : connected === 'connecting' ? 'text-yellow-600' : 'text-red-600'}>
                      {connected === 'connected' ? 'Đã kết nối' : connected === 'connecting' ? 'Đang kết nối…' : 'Mất kết nối'}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    Đặt màn hình này trước cửa ra vào · Tự động hiển thị khi có người quét
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
