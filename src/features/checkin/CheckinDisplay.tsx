import React, { useEffect, useRef, useState } from 'react';
import { getSocket } from '../../utils/socket';
import { fetchDelegatesAll, fetchDelegateById } from '../../services/delegates';
import bg from '../../assets/image/WEB DISPLAY.png';

// ✅ Fallback đọc giọng đơn giản
const basicSpeak = (text: string) => {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'vi-VN';
    u.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (e) {
    console.warn('TTS failed', e);
  }
};

interface CheckinData {
  id: number | string;
  delegateCode: string;
  fullName: string;
  unit?: string;
  position?: string;
  email?: string;
  phone?: string;
  ava?: string | null;
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
    ava: user.ava ?? d.ava ?? null,
    checkedIn: Boolean(di.checkedIn ?? d.checkedIn),
    checkinTime: (di.checkinTime ?? d.checkinTime) || null,
  };
};

const DUP_WINDOW_MS = 5000;
const HIDE_AFTER_MS = 10000;

const CheckinDisplay: React.FC = () => {
  const [current, setCurrent] = useState<CheckinData | null>(null);
  const [connected, setConnected] =
    useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [mute, setMute] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('auto');
  const [recentCheckins, setRecentCheckins] = useState<CheckinData[]>([]);
  const [audioUnlocked, setAudioUnlocked] = useState(false); // ⭐ phải bật 1 lần

  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const muteRef = useRef(mute);
  const lastShownRef = useRef<{ id?: string; at: number }>({
    id: undefined,
    at: 0,
  });
  const hideTimerRef = useRef<number | null>(null);
  const lastUtterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const unlockedRef = useRef(audioUnlocked);

  useEffect(() => {
    muteRef.current = mute;
  }, [mute]);

  useEffect(() => {
    unlockedRef.current = audioUnlocked;
  }, [audioUnlocked]);

  const ensureVoices = (): SpeechSynthesisVoice[] => {
    const v = window.speechSynthesis?.getVoices?.() || [];
    if (v.length === 0) window.speechSynthesis?.getVoices?.();
    return v;
  };

  const pickBestVoice = (list: SpeechSynthesisVoice[]) => {
    if (!list.length) return null;
    const viVoices = list.filter(v =>
      /vi|Viet/i.test((v.lang || '') + (v.name || '')),
    );

    const pool = viVoices.length ? viVoices : list;

    // ⭐ ưu tiên giọng "hay hơn" (tên chứa các từ này nếu có)
    const preferred =
      pool.find(v =>
        /google|natural|female|fpt|vbee/i.test(v.name || ''),
      ) || pool[0];

    return preferred || null;
  };

  const speak = (text: string) => {
    // ✅ Chỉ chặn khi tắt tiếng, chưa unlock, hoặc không có speechSynthesis
    if (muteRef.current || !unlockedRef.current || !('speechSynthesis' in window)) return;

    try {
      if (!voiceRef.current) {
        const list = ensureVoices();
        const chosen = pickBestVoice(list);
        if (chosen) voiceRef.current = chosen;
      }

      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.lang = voiceRef.current?.lang || 'vi-VN';
      u.rate = 1;
      u.pitch = 1;
      u.volume = 1;

      // ⭐ giữ reference, tránh GC trước khi nói xong
      lastUtterRef.current = u;
      (window as any).__lastTTS = u;

      window.speechSynthesis.cancel();
      u.onerror = e => console.warn('TTS error:', e);
      window.speechSynthesis.speak(u);
      if (navigator.vibrate) navigator.vibrate(40);
    } catch (e) {
      console.warn('TTS speak exception:', e);
      basicSpeak(text);
    }
  };

  // 🟡 Lấy danh sách voice + cho phép chọn giọng
  useEffect(() => {
    const pickVoice = () => {
      if (!('speechSynthesis' in window)) return;
      const list = ensureVoices();
      if (!list.length) return;

      setVoices(list);

      let chosen: SpeechSynthesisVoice | null = null;

      if (selectedVoiceId !== 'auto') {
        chosen = list.find(v => v.voiceURI === selectedVoiceId) || null;
      }

      if (!chosen) {
        chosen = pickBestVoice(list);
      }

      voiceRef.current = chosen;
    };

    pickVoice();
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', pickVoice);
    };
  }, [selectedVoiceId]);

  // anti-suspend cho SpeechSynthesis
  useEffect(() => {
    const id = window.setInterval(() => {
      try {
        window.speechSynthesis.resume();
      } catch {}
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  const scheduleHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(
      () => setCurrent(null),
      HIDE_AFTER_MS,
    );
  };

  // 🟢 Fetch danh sách ban đầu
  useEffect(() => {
    (async () => {
      try {
        const all = await fetchDelegatesAll();
        const list = (all || [])
          .map(normalizeDelegate)
          .filter(x => x.checkedIn && x.checkinTime)
          .sort(
            (a, b) =>
              new Date(b.checkinTime || 0).getTime() -
              new Date(a.checkinTime || 0).getTime(),
          );
        setRecentCheckins(list);
        if (list.length > 0) {
          setCurrent(list[0]);
          lastShownRef.current = { id: String(list[0].id), at: Date.now() };
          scheduleHide();
        }
      } catch (e) {
        console.error('Không tải được danh sách.', e);
      }
    })();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // 🟢 Socket: checkin.updated
  useEffect(() => {
    const s = getSocket();
    setConnected(s.connected ? 'connected' : 'connecting');
    const onConnect = () => setConnected('connected');
    const onDisconnect = () => setConnected('disconnected');

    const onUpdate = async (evt: {
      delegateId: number;
      checkedIn: boolean;
      checkinTime?: string;
    }) => {
      if (!evt.checkedIn) return;
      const now = Date.now();
      if (
        lastShownRef.current.id === String(evt.delegateId) &&
        now - lastShownRef.current.at < DUP_WINDOW_MS
      )
        return;
      try {
        let raw: any = null;
        try {
          raw = await fetchDelegateById(evt.delegateId);
        } catch {}
        const d = normalizeDelegate(raw?.item ?? raw ?? { id: evt.delegateId });
        d.checkinTime =
          d.checkinTime || evt.checkinTime || new Date().toISOString();
        setCurrent(d);
        lastShownRef.current = { id: String(d.id), at: Date.now() };
        setRecentCheckins(prev => [
          d,
          ...prev.filter(x => String(x.id) !== String(d.id)),
        ]);
        scheduleHide();

        const sentence = d.fullName
          ? `Chào mừng đại biểu ${d.fullName}${
              d.unit ? `, ${d.unit}` : ''
            }`
          : 'Điểm danh thành công.';

        // ✅ GỌI THẲNG, nhưng sẽ bị chặn nếu chưa unlock (audioUnlocked = false)
        speak(sentence);
      } catch (e) {
        console.error('Lỗi xử lý socket', e);
      }
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('checkin.updated', onUpdate);
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('checkin.updated', onUpdate);
    };
  }, []);

  const enterFullscreen = () => {
    const el: any = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  const viVoices = voices.filter(v =>
    /vi|Viet/i.test((v.lang || '') + (v.name || '')),
  );
  const displayVoices = viVoices.length ? viVoices : voices;

  // ⭐ Overlay: user phải click để bật âm thanh (unlock autoplay policy)
  const handleUnlockAudio = () => {
    setAudioUnlocked(true);
    try {
      if (!('speechSynthesis' in window)) return;
      const list = ensureVoices();
      const chosen = pickBestVoice(list);
      if (chosen) voiceRef.current = chosen;

      const u = new SpeechSynthesisUtterance(
        'Hệ thống điểm danh đại biểu đã sẵn sàng.',
      );
      if (voiceRef.current) u.voice = voiceRef.current;
      u.lang = voiceRef.current?.lang || 'vi-VN';
      u.rate = 1;

      lastUtterRef.current = u;
      (window as any).__lastTTS = u;

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('Unlock audio error:', e);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img
        src={bg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* Header */}
      <div className="relative px-6 py-4 flex items-center justify-between text-white mb-12">
        <div className="flex items-center gap-3 text-xl font-semibold">
          <span
            className={`h-3 w-3 rounded-full ${
              connected === 'connected'
                ? 'bg-emerald-400'
                : connected === 'connecting'
                ? 'bg-yellow-300'
                : 'bg-red-400'
            } animate-pulse`}
          />
          <span>Check-in Display</span>
          <span className="text-sm opacity-90">
            {connected === 'connected'
              ? 'Đã kết nối'
              : connected === 'connecting'
              ? 'Đang kết nối…'
              : 'Mất kết nối'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Chọn giọng nói */}
          {displayVoices.length > 0 && (
            <select
              value={selectedVoiceId}
              onChange={e => setSelectedVoiceId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/90 text-gray-800 text-sm border border-white/40"
            >
              <option value="auto">Giọng tự động</option>
              {displayVoices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setMute(m => !m)}
            className="px-4 py-2 rounded-xl bg-white/90 text-gray-800 hover:bg-white transition"
          >
            {mute ? 'Tắt tiếng' : 'Đang bật tiếng'}
          </button>

          <button
            onClick={enterFullscreen}
            className="px-4 py-2 rounded-xl bg-white/90 text-gray-800 hover:bg-white transition"
          >
            Toàn màn hình
          </button>
        </div>
      </div>

      {/* Nội dung hiển thị */}
      <div className="relative z-10 px-4 pb-16 pt-4 flex justify-center items-start md:items-center mt-12">
        {current && (
          <div className="mt-10 md:mt-0 max-w-4xl w-full rounded-3xl text-center mt-12">
            {current.ava ? (
              <div className="mt-12 w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-cyan-500 shadow-lg bg-gray-100">
                <img
                  src={current.ava}
                  alt={current.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-cyan-100 flex items-center justify-center text-5xl font-bold text-cyan-700 shadow-lg">
                {current.fullName?.charAt(0).toUpperCase() || '?'}
              </div>
            )}

            <h2 className="text-3xl font-semibold text-gray-700 mb-2">
              CHÀO MỪNG
            </h2>
            <div className="text-5xl font-extrabold text-cyan-700 mb-3">
              {current.fullName}
            </div>

            {current.unit && (
              <div className="text-xl text-gray-600 mb-1">
                Đoàn đại biểu <b>{current.unit}</b>
              </div>
            )}

            {current.position && (
              <div className="text-base text-gray-500 mb-2">
                {current.position}
              </div>
            )}

            <div className="text-sm text-gray-500 mb-4">
              Mã đại biểu: <b>{current.delegateCode}</b>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-lg font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Điểm danh thành công!</span>
            </div>
          </div>
        )}
      </div>

      {/* ⭐ Overlay bật âm thanh lần đầu */}
      {!audioUnlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white/95 rounded-3xl px-8 py-6 text-center shadow-2xl max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Bật âm thanh hệ thống
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              Vui lòng bấm nút bên dưới để cho phép hệ thống đọc tên đại biểu
              khi điểm danh.
            </p>
            <button
              onClick={handleUnlockAudio}
              className="px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition shadow-md"
            >
              Cho phép phát âm thanh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckinDisplay;
