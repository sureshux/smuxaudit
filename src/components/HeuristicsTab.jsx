import { useAudit } from '../context/AuditContext';
import { StatChip } from './UI';
import ChecklistItem from './ChecklistItem';
import { HEURISTICS } from '../data/auditData';

export default function HeuristicsTab({ onPushToLog }) {
  const { checkState } = useAudit();

  const pass = HEURISTICS.filter(h => checkState[h.id]?.status === 'Pass').length;
  const fail = HEURISTICS.filter(h => checkState[h.id]?.status === 'Fail').length;
  const na   = HEURISTICS.filter(h => checkState[h.id]?.status === 'N/A').length;
  const reviewed = HEURISTICS.length - na;
  const pct = Math.round((reviewed / HEURISTICS.length) * 100);

  const scrollTo = (id) => document.getElementById(`cl-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 148px)' }}>
      {/* Sidebar nav */}
      <nav className="bg-white border-r border-[#D8D6D1] w-64 shrink-0 p-3.5 overflow-y-auto"
        style={{ position: 'sticky', top: 92, height: 'calc(100vh - 92px)' }}>
        <div className="font-mono text-[10px] font-bold uppercase tracking-[.08em] text-[#9B9791] pb-2 border-b border-[#D8D6D1] mb-2">
          Nielsen's 10
        </div>
        {HEURISTICS.map(h => {
          const s = checkState[h.id]?.status || 'N/A';
          return (
            <button key={h.id} onClick={() => scrollTo(h.id)}
              className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-[5px] text-[12px] font-medium text-[#5C5954] hover:bg-[#EDECEA] hover:text-[#1A1917] transition-colors mb-0.5">
              <span className="font-mono text-[10px] font-bold text-[#9B9791] min-w-[18px]">{h.n}</span>
              <span className="flex-1 leading-snug">{h.t}</span>
              {s !== 'N/A' && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${s==='Pass'?'bg-green-50 text-green-700':'bg-red-50 text-red-600'}`}>{s}</span>
              )}
            </button>
          );
        })}

        {/* Progress */}
        <div className="mt-4 pt-3 border-t border-[#D8D6D1]">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[.08em] text-[#9B9791] mb-1.5">Progress</div>
          <div className="h-1.5 bg-[#D8D6D1] rounded overflow-hidden">
            <div className="h-full bg-green-500 rounded transition-all duration-300" style={{ width: pct + '%' }} />
          </div>
          <div className="text-[11px] text-[#9B9791] mt-1.5">{reviewed} of {HEURISTICS.length} reviewed</div>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-5">
          <h2 className="text-[20px] font-bold mb-1">Heuristic Violations — Nielsen's 10</h2>
          <p className="text-[13px] text-[#5C5954] max-w-2xl leading-relaxed">
            Note violations for each heuristic. Set status to <strong>Pass</strong>, <strong>Fail</strong>, or <strong>N/A</strong>.
            When a heuristic fails, add severity, evidence, and recommendation — then push it to the Issue Log.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap mb-5">
          <StatChip label="Total" value={HEURISTICS.length} type="total" />
          <StatChip label="Pass" value={pass} type="Pass" />
          <StatChip label="Fail" value={fail} type="Fail" />
          <StatChip label="N/A" value={na} type="na" />
        </div>

        {HEURISTICS.map(h => (
          <ChecklistItem key={h.id} item={h} type="h" onPushToLog={onPushToLog} />
        ))}
      </div>
    </div>
  );
}
