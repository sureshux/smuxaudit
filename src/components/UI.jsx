import { useState, useEffect } from 'react';

// ── Button ────────────────────────────────────
const BTN_VARIANTS = {
  primary:  'bg-[#1A1917] text-[#F5F4F0] border-[#1A1917] hover:bg-[#333]',
  ghost:    'bg-transparent text-[#5C5954] border-[#D8D6D1] hover:bg-[#EDECEA] hover:border-[#B0ADA6] hover:text-[#1A1917]',
  inv:      'bg-transparent text-[rgba(245,244,240,0.85)] border-[rgba(245,244,240,0.25)] hover:bg-[rgba(245,244,240,0.1)] hover:border-[rgba(245,244,240,0.4)] hover:text-white',
  danger:   'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]',
  success:  'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0] hover:bg-[#DCFCE7]',
  excel:    'bg-[#1D6F42] text-white border-[#1D6F42] hover:bg-[#155534]',
};

export function Button({ variant = 'ghost', size = 'md', children, className = '', ...props }) {
  const sizes = { sm: 'px-2.5 py-1 text-[11px]', md: 'px-3.5 py-1.5 text-[12px]', lg: 'px-4 py-2 text-[13px]' };
  return (
    <button
      className={`inline-flex items-center gap-1.5 border-[1.5px] rounded-[6px] font-medium cursor-pointer transition-all duration-150 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[#1A1917]/20 ${BTN_VARIANTS[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Badge ─────────────────────────────────────
const BADGE_MAP = {
  Critical: 'bg-red-50 text-red-600 border-red-200',
  High:     'bg-orange-50 text-orange-600 border-orange-200',
  Medium:   'bg-yellow-50 text-yellow-600 border-yellow-200',
  Low:      'bg-green-50 text-green-700 border-green-200',
  P1:       'bg-red-50 text-red-700 border-red-200 font-extrabold',
  P2:       'bg-gray-100 text-gray-600 border-gray-200',
  P3:       'bg-gray-100 text-gray-400 border-gray-200',
  Pass:     'bg-green-50 text-green-700 border-green-300',
  Fail:     'bg-red-50 text-red-600 border-red-300',
  'N/A':    'bg-gray-100 text-gray-400 border-gray-200',
};

export function Badge({ value, className = '' }) {
  if (!value) return null;
  const cls = BADGE_MAP[value] || 'bg-gray-100 text-gray-500 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${cls} ${className}`}>
      {value}
    </span>
  );
}

export function LevelBadge({ level }) {
  return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
      {level}
    </span>
  );
}

// ── Status Select ──────────────────────────────
const STATUS_CLS = {
  Pass: 'bg-green-50 border-green-300 text-green-700',
  Fail: 'bg-red-50 border-red-300 text-red-600',
  'N/A':'bg-gray-100 border-gray-200 text-gray-400',
};

export function StatusSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-24 text-[12px] font-semibold border-[1.5px] rounded-[5px] px-2.5 py-1.5 cursor-pointer ${STATUS_CLS[value] || STATUS_CLS['N/A']}`}
      style={{ backgroundPosition: 'right 6px center' }}
    >
      <option value="N/A">N/A</option>
      <option value="Pass">Pass</option>
      <option value="Fail">Fail</option>
    </select>
  );
}

// ── Confirm Modal ─────────────────────────────
export function ConfirmModal({ title, msg, onOk, onCancel, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-7 max-w-md w-full shadow-xl" style={{ animation: 'modalIn .18s ease' }} onClick={e => e.stopPropagation()}>
        <h3 className="text-[17px] font-bold mb-2">{title}</h3>
        <p className="text-[14px] text-[#5C5954] mb-5 leading-relaxed">{msg}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => { onCancel?.(); onClose(); }}>Cancel</Button>
          <Button variant="danger" onClick={() => { onOk(); onClose(); }}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────
const TOAST_CLS = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error:   'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info:    'bg-blue-50 text-blue-800 border-blue-200',
};
const TOAST_ICON = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };

export function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-start gap-2.5 px-4 py-3 rounded-lg border font-medium text-[13px] min-w-[260px] max-w-[380px] pointer-events-auto shadow-lg ${TOAST_CLS[t.type]||TOAST_CLS.info}`}
          style={{ animation: 'slideIn .2s ease' }}>
          <span>{TOAST_ICON[t.type]||'ℹ️'}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ── Image Viewer Modal ────────────────────────
const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4];

export function ImageViewer({ src, title, meta: imgMeta, label, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [dims, setDims] = useState('');

  useEffect(() => {
    setZoom(1);
    const handler = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') zoomDir(1);
      if (e.key === '-') zoomDir(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const zoomDir = (dir) => {
    setZoom(z => {
      let idx = ZOOM_STEPS.findIndex(s => Math.abs(s - z) < 0.01);
      if (idx === -1) idx = ZOOM_STEPS.findIndex(s => s > z) - 1;
      return ZOOM_STEPS[Math.max(0, Math.min(ZOOM_STEPS.length - 1, idx + dir))];
    });
  };

  const handleDownload = () => {
    try {
      const arr = src.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      const u8 = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
      const blob = new Blob([u8], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = (label || 'screenshot') + '.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) { alert('Could not save image: ' + e.message); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl overflow-hidden flex flex-col shadow-2xl"
        style={{ width: 'min(92vw, 1100px)', maxHeight: '92vh', animation: 'modalIn .18s ease' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 flex-shrink-0 flex-wrap gap-3">
          <div>
            <div className="font-semibold text-[14px]">{title}</div>
            {imgMeta && <div className="text-[11px] text-[#9B9791] mt-0.5">{imgMeta}</div>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => zoomDir(-1)}>−</Button>
            <span className="text-[12px] font-semibold text-[#5C5954] w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={() => zoomDir(1)}>+</Button>
            <Button variant="ghost" size="sm" onClick={() => setZoom(1)}>⊡ Fit</Button>
            <Button variant="success" size="sm" onClick={handleDownload}>⬇ Save</Button>
            <Button variant="danger" size="sm" onClick={onClose}>✕</Button>
          </div>
        </div>
        {/* Security notice */}
        <div className="flex items-start gap-2.5 px-5 py-2.5 bg-green-50 border-b border-green-200 text-[12px] text-green-800 flex-shrink-0">
          <span className="text-base">🔒</span>
          <span><strong>This image is safe.</strong> It is your own screenshot stored as base64 data inside this tool — not downloaded from the internet. The Save button saves it directly from your browser with no Windows security warning.</span>
        </div>
        {/* Image */}
        <div className="flex-1 bg-[#1A1917] overflow-auto flex items-center justify-center p-4 min-h-[200px]">
          <img
            src={src}
            alt="Screenshot"
            onLoad={e => setDims(`${e.target.naturalWidth} × ${e.target.naturalHeight}px`)}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform .15s ease', display: 'block', borderRadius: 4, boxShadow: '0 4px 24px rgba(0,0,0,.5)', maxWidth: 'none' }}
          />
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50 border-t border-gray-200 flex-shrink-0 flex-wrap gap-2">
          <span className="text-[11px] text-[#9B9791]">{dims}</span>
          <span className="text-[11px] text-[#9B9791]">Click outside or press <kbd className="px-1.5 py-0.5 border border-gray-200 rounded bg-gray-100 font-mono text-[10px]">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}

// ── Markdown Modal ────────────────────────────
export function MdModal({ text, onClose }) {
  const copy = () => navigator.clipboard.writeText(text).then(() => {});
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl" style={{ animation: 'modalIn .18s ease' }} onClick={e => e.stopPropagation()}>
        <h3 className="text-[17px] font-bold mb-3">Markdown Export</h3>
        <textarea readOnly value={text} rows={14} className="font-mono text-[11px] w-full bg-[#F5F4F0] resize-y" />
        <div className="flex gap-2 justify-end mt-3">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={copy}>Copy</Button>
        </div>
      </div>
    </div>
  );
}

// ── Screenshot Drop Zone ──────────────────────
export function ScreenshotDropZone({ value, onChange }) {
  const [drag, setDrag] = useState(false);

  const handle = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) alert('Screenshot >2MB may slow saves.');
    const reader = new FileReader();
    reader.onload = e => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-[6px] p-4 text-center cursor-pointer transition-all ${drag ? 'border-[#1A1917] bg-[#EDECEA]' : 'border-[#D8D6D1] bg-[#F5F4F0] hover:border-[#B0ADA6] hover:bg-[#EDECEA]'}`}
        onClick={() => document.getElementById('sc-input').click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
      >
        <div className="text-2xl text-[#9B9791] mb-1">🖼</div>
        <p className="text-[12px] text-[#9B9791]">Click to upload or drag & drop</p>
        <input id="sc-input" type="file" accept="image/*" className="hidden" onChange={e => handle(e.target.files[0])} />
      </div>
      {value && (
        <div className="mt-2">
          <img src={value} alt="Preview" className="max-w-full max-h-[100px] rounded border border-[#D8D6D1]" />
          <button onClick={() => onChange(null)} className="mt-1 text-[12px] text-[#DC2626] hover:underline">✕ Remove</button>
        </div>
      )}
    </div>
  );
}

// ── Section Title ─────────────────────────────
export function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3.5">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[.08em] text-[#9B9791] whitespace-nowrap">{children}</span>
      <div className="flex-1 h-px bg-[#D8D6D1]" />
    </div>
  );
}

// ── Stat Chip ─────────────────────────────────
const CHIP_MAP = {
  total:    'bg-[#EDECEA] border-[#D8D6D1] text-[#1A1917]',
  Critical: 'bg-red-50 border-red-200 text-red-600',
  High:     'bg-orange-50 border-orange-200 text-orange-600',
  Medium:   'bg-yellow-50 border-yellow-200 text-yellow-600',
  Low:      'bg-green-50 border-green-200 text-green-700',
  Pass:     'bg-green-50 border-green-200 text-green-700',
  Fail:     'bg-red-50 border-red-200 text-red-600',
  na:       'bg-[#EDECEA] border-[#D8D6D1] text-[#9B9791]',
};

export function StatChip({ label, value, type = 'total' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold border-[1.5px] ${CHIP_MAP[type] || CHIP_MAP.total}`}>
      {type !== 'total' && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {label}: <strong>{value}</strong>
    </span>
  );
}
