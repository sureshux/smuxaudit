// ── String helpers ──────────────────────────────
export const slug = str =>
  (str || 'audit').replace(/[^a-z0-9]/gi, '-').toLowerCase().replace(/-+/g, '-').slice(0, 40);

export const truncate = (str, n = 90) =>
  (str || '').length > n ? str.slice(0, n) + '…' : (str || '');

// ── Download helpers ────────────────────────────
export function dlBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// ── Image helpers ───────────────────────────────
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = e => resolve(e.target.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function base64ToUint8(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  const u8 = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
  return { u8, mime };
}

// ── CSV builder ─────────────────────────────────
export function buildCSV(rows) {
  return rows
    .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
}

// ── Init checklist state ────────────────────────
import { HEURISTICS, WCAG } from '../data/auditData';
export function initCheckState() {
  const s = {};
  [...HEURISTICS, ...WCAG].forEach(item => {
    s[item.id] = { status: 'N/A', severity: '', priority: '', notes: '', rec: '', sc: null, cap: '' };
  });
  return s;
}

// ── Statistics ──────────────────────────────────
export function calcStats(issues) {
  const bySev = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  const byPri = { P1: 0, P2: 0, P3: 0 };
  issues.forEach(i => {
    if (bySev[i.sev] !== undefined) bySev[i.sev]++;
    if (byPri[i.pri] !== undefined) byPri[i.pri]++;
  });
  return { total: issues.length, bySev, byPri };
}
