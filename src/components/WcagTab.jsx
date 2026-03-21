import { useAudit } from '../context/AuditContext';
import { StatChip } from './UI';
import ChecklistItem from './ChecklistItem';
import { WCAG, WCAG_PRINCIPLES } from '../data/auditData';

export default function WcagTab({ onPushToLog }) {
  const { checkState } = useAudit();

  const pass   = WCAG.filter(c => checkState[c.id]?.status === 'Pass').length;
  const fail   = WCAG.filter(c => checkState[c.id]?.status === 'Fail').length;
  const na     = WCAG.filter(c => checkState[c.id]?.status === 'N/A').length;
  const aFail  = WCAG.filter(c => c.l === 'A'  && checkState[c.id]?.status === 'Fail').length;
  const aaFail = WCAG.filter(c => c.l === 'AA' && checkState[c.id]?.status === 'Fail').length;
  const reviewed = WCAG.length - na;
  const pct = Math.round((reviewed / WCAG.length) * 100);

  const scrollTo = (id) => document.getElementById(`cl-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 148px)' }}>
      {/* Sidebar nav */}
      <nav className="bg-white border-r border-[#D8D6D1] w-64 shrink-0 p-3.5 overflow-y-auto"
        style={{ position: 'sticky', top: 92, height: 'calc(100vh - 92px)' }}>
        <div className="font-mono text-[10px] font-bold uppercase tracking-[.08em] text-[#9B9791] pb-2 border-b border-[#D8D6D1] mb-2">
          WCAG 2.1 Principles
        </div>
        {WCAG_PRINCIPLES.map(principle => (
          <div key={principle}>
            <div className="text-[10px] font-bold uppercase tracking-[.07em] text-[#9B9791] px-2.5 pt-2.5 pb-1 opacity-80">{principle}</div>
            {WCAG.filter(c => c.p === principle).map(c => {
              const s = checkState[c.id]?.status || 'N/A';
              return (
                <button key={c.id} onClick={() => scrollTo(c.id)}
                  className="flex items-center gap-1.5 w-full text-left px-2.5 py-1.5 rounded-[5px] text-[11px] font-medium text-[#5C5954] hover:bg-[#EDECEA] hover:text-[#1A1917] transition-colors mb-0.5">
                  <span className="font-mono text-[10px] font-bold text-[#9B9791] min-w-[32px]">{c.n}</span>
                  <span className="flex-1 leading-snug">{c.t}</span>
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">{c.l}</span>
                  {s !== 'N/A' && (
                    <span className={`text-[10px] font-bold px-1 py-0.5 rounded-full shrink-0 ${s==='Pass'?'bg-green-50 text-green-700':'bg-red-50 text-red-600'}`}>{s}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Progress */}
        <div className="mt-4 pt-3 border-t border-[#D8D6D1]">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[.08em] text-[#9B9791] mb-1.5">Progress</div>
          <div className="h-1.5 bg-[#D8D6D1] rounded overflow-hidden">
            <div className="h-full bg-green-500 rounded transition-all duration-300" style={{ width: pct + '%' }} />
          </div>
          <div className="text-[11px] text-[#9B9791] mt-1.5">{reviewed} of {WCAG.length} reviewed</div>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-5">
          <h2 className="text-[20px] font-bold mb-1">WCAG 2.1 Accessibility Audit</h2>
          <p className="text-[13px] text-[#5C5954] max-w-2xl leading-relaxed">
            Evaluate each success criterion. Criteria are organized by principle — Perceivable, Operable, Understandable, Robust.
            Mark each as <strong>Pass</strong>, <strong>Fail</strong>, or <strong>N/A</strong>. Failed items can be pushed to the Issue Log.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap mb-5">
          <StatChip label="Total" value={WCAG.length} type="total" />
          <StatChip label="Pass" value={pass} type="Pass" />
          <StatChip label="Fail" value={fail} type="Fail" />
          <StatChip label="N/A" value={na} type="na" />
          {aFail > 0 && <StatChip label="Level A Fails" value={aFail} type="Fail" />}
          {aaFail > 0 && <StatChip label="Level AA Fails" value={aaFail} type="Fail" />}
        </div>

        {WCAG_PRINCIPLES.map(principle => (
          <div key={principle}>
            <div className="flex items-center gap-2 py-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[.08em] text-[#9B9791]">{principle}</span>
              <div className="flex-1 h-px bg-[#D8D6D1]" />
            </div>
            {WCAG.filter(c => c.p === principle).map(c => (
              <ChecklistItem key={c.id} item={c} type="w" onPushToLog={onPushToLog} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
