import { useAudit } from '../context/AuditContext';
import { StatusSelect, Badge, LevelBadge, Button, ScreenshotDropZone, ImageViewer } from './UI';
import { useState } from 'react';
import { slug } from '../utils/helpers';

export default function ChecklistItem({ item, type, onPushToLog }) {
  const { checkState, updateCheck } = useAudit();
  const s = checkState[item.id] || { status: 'N/A', severity: '', priority: '', notes: '', rec: '', sc: null, cap: '' };
  const isFail = s.status === 'Fail';
  const [imgView, setImgView] = useState(false);

  const set = (field, val) => updateCheck(item.id, { [field]: val });

  const borderColor = s.status === 'Pass' ? '#16A34A' : s.status === 'Fail' ? '#DC2626' : '#D8D6D1';

  return (
    <div id={`cl-${item.id}`}
      className="bg-white border border-[#D8D6D1] rounded-lg mb-2.5 overflow-hidden transition-colors"
      style={{ borderLeft: `3px solid ${borderColor}` }}>

      {imgView && s.sc && (
        <ImageViewer src={s.sc} title={`${type === 'h' ? 'Heuristic' : 'WCAG'} ${item.n} — ${item.t}`}
          label={`${type === 'h' ? 'heuristic' : 'wcag'}-${slug(item.n)}`}
          onClose={() => setImgView(false)} />
      )}

      {/* Header */}
      <div className="px-4 pt-3.5 pb-3">
        <div className="flex items-start gap-3">
          <span className="font-mono text-[11px] font-bold text-[#9B9791] bg-[#EDECEA] border border-[#D8D6D1] rounded px-2 py-0.5 whitespace-nowrap mt-0.5 shrink-0">
            {item.n}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-semibold text-[#1A1917]">{item.t}</span>
              {item.l && <LevelBadge level={item.l} />}
            </div>
            <p className="text-[12px] text-[#9B9791] mt-1 leading-snug">{item.d}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mt-2.5 flex-wrap pl-10">
          <StatusSelect value={s.status} onChange={v => set('status', v)} />
          {isFail && (
            <>
              <select value={s.severity} onChange={e => set('severity', e.target.value)}
                className="w-auto text-[11px] font-semibold !py-1.5 !px-2 !min-w-0">
                <option value="">Severity…</option>
                <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
              </select>
              <select value={s.priority} onChange={e => set('priority', e.target.value)}
                className="w-auto text-[11px] font-semibold !py-1.5 !px-2 !min-w-0">
                <option value="">Priority…</option>
                <option value="P1">P1 — Must Fix</option>
                <option value="P2">P2 — Should Fix</option>
                <option value="P3">P3 — Nice to Have</option>
              </select>
              <button onClick={() => onPushToLog(item.id, type)}
                className="text-[11px] font-semibold text-[#DC2626] border border-[#FECACA] rounded px-2.5 py-1 bg-[#FEF2F2] hover:bg-[#FEE2E2] transition-colors cursor-pointer">
                + Add to Issue Log
              </button>
            </>
          )}
        </div>
      </div>

      {/* Detail panel (visible when Fail) */}
      {isFail && (
        <div className="border-t border-[#D8D6D1] px-4 py-3.5 bg-[#FAFAF9] grid gap-2.5">
          <div>
            <label>Notes / Evidence <span className="text-[#9B9791] text-[10px] normal-case tracking-normal font-normal">(shown in summary when Fail)</span></label>
            <textarea value={s.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Describe the specific violation observed…" rows={2} className="text-[12px]" />
          </div>
          <div>
            <label>Recommendation</label>
            <textarea value={s.rec} onChange={e => set('rec', e.target.value)}
              placeholder="How should this be fixed?" rows={2} className="text-[12px]" />
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="shrink-0">
              <label>Screenshot</label>
              <ScreenshotDropZone value={s.sc} onChange={v => set('sc', v)} />
              {s.sc && (
                <img src={s.sc} alt="Evidence" className="mt-2 w-14 h-10 object-cover rounded border border-[#D8D6D1] cursor-zoom-in"
                  onClick={() => setImgView(true)} title="Click to enlarge" />
              )}
            </div>
            <div className="flex-1 min-w-[140px]">
              <label>Caption</label>
              <input value={s.cap} onChange={e => set('cap', e.target.value)} placeholder="Optional caption…" className="text-[12px]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
