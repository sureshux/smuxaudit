import { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { Badge, StatChip, Button, ImageViewer } from './UI';
import { exportCSVFile } from '../utils/exportUtils';
import { slug, truncate } from '../utils/helpers';
import { SEV_ORDER, PRI_ORDER } from '../data/auditData';

const PRI_LABEL = { P1: 'P1 Must Fix', P2: 'P2 Should Fix', P3: 'P3 Nice' };

export default function IssueTable({ onEdit, onPrefill }) {
  const { issues, deleteIssue, duplicateIssue, stats, meta, toast } = useAudit();
  const [fSev, setFSev] = useState('');
  const [fPri, setFPri] = useState('');
  const [fCat, setFCat] = useState('');
  const [sortBy, setSort] = useState('date-desc');
  const [imgView, setImgView] = useState(null);

  const filtered = issues
    .filter(i => (!fSev || i.sev === fSev) && (!fPri || i.pri === fPri) && (!fCat || (i.cats||[]).includes(fCat)))
    .sort((a, b) => {
      if (sortBy === 'severity') return (SEV_ORDER[a.sev]??4) - (SEV_ORDER[b.sev]??4);
      if (sortBy === 'priority') return (PRI_ORDER[a.pri]??4) - (PRI_ORDER[b.pri]??4);
      if (sortBy === 'date-asc') return new Date(a.created) - new Date(b.created);
      return new Date(b.created) - new Date(a.created);
    });

  const copyMd = (iss) => {
    const md = [`### Issue #${iss.num}: ${iss.page}`,`**Severity:** ${iss.sev} | **Priority:** ${iss.pri}`,`**Category:** ${(iss.cats||[]).join(', ')}`,iss.heur?`**Heuristic:** ${iss.heur}`:'',iss.wcag?`**WCAG:** ${iss.wcag}`:'','',`**Description:** ${iss.desc}`,iss.rec?`\n**Recommendation:** ${iss.rec}`:''].filter(Boolean).join('\n');
    navigator.clipboard.writeText(md).then(() => toast(`Issue #${iss.num} copied!`, 'success'));
  };

  const clearFilters = () => { setFSev(''); setFPri(''); setFCat(''); setSort('date-desc'); };

  const exportFiltered = () => {
    if (!filtered.length) { toast('No issues match filters.', 'warning'); return; }
    exportCSVFile({ meta, issues: filtered });
    toast(`Filtered CSV exported (${filtered.length} issues)`, 'success');
  };

  return (
    <section className="p-5 flex-1 overflow-x-auto">
      {imgView && <ImageViewer {...imgView} onClose={() => setImgView(null)} />}

      {/* Stats */}
      <div className="flex items-center gap-2.5 flex-wrap mb-4">
        <StatChip label="Total" value={stats.total} type="total" />
        <StatChip label="Critical" value={stats.bySev.Critical} type="Critical" />
        <StatChip label="High" value={stats.bySev.High} type="High" />
        <StatChip label="Medium" value={stats.bySev.Medium} type="Medium" />
        <StatChip label="Low" value={stats.bySev.Low} type="Low" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap mb-3.5 px-3.5 py-2.5 bg-[#EDECEA] rounded-[6px] border border-[#D8D6D1]">
        <span className="text-[11px] font-bold uppercase tracking-[.06em] text-[#9B9791]">Filter</span>
        {[
          ['fSev', fSev, setFSev, ['Critical','High','Medium','Low'], 'All Severities'],
          ['fPri', fPri, setFPri, ['P1','P2','P3'], 'All Priorities'],
          ['fCat', fCat, setFCat, ['Heuristic','WCAG','Visual','Interaction','Content','Other'], 'All Categories'],
        ].map(([k, val, setter, opts, placeholder]) => (
          <select key={k} value={val} onChange={e => setter(e.target.value)}
            className="w-auto text-[12px] !py-1.5 !px-2.5 bg-white">
            <option value="">{placeholder}</option>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <span className="text-[11px] font-bold uppercase tracking-[.06em] text-[#9B9791] ml-1">Sort</span>
        <select value={sortBy} onChange={e => setSort(e.target.value)} className="w-auto text-[12px] !py-1.5 !px-2.5 bg-white">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="severity">By Severity</option>
          <option value="priority">By Priority</option>
        </select>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm" onClick={clearFilters}>✕ Clear</Button>
          <Button variant="success" size="sm" onClick={exportFiltered}>📋 Export Filtered</Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#D8D6D1] rounded-lg overflow-hidden bg-white">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-[15px] font-semibold text-[#5C5954] mb-2">No issues captured yet</h3>
            <p className="text-[13px] text-[#9B9791]">Fill in the form on the left and click <strong>Add Issue</strong>.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  {['#','🖼','Page ↕','Issue','Severity ↕','Priority ↕','Category','Actions'].map((h, i) => (
                    <th key={i} onClick={() => i===2?setSort('page'):i===4?setSort('severity'):i===5?setSort('priority'):null}
                      className="bg-[#EDECEA] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[.06em] text-[#9B9791] border-b border-[#D8D6D1] whitespace-nowrap cursor-pointer hover:text-[#1A1917]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(iss => (
                  <tr key={iss.id} className="border-b border-[#D8D6D1] last:border-0 hover:bg-[#F5F4F0] transition-colors">
                    <td className="px-3 py-2.5 font-mono text-[11px] text-[#9B9791] w-8">{iss.num}</td>
                    <td className="px-3 py-2.5 w-12">
                      {iss.sc ? (
                        <img src={iss.sc} alt="" className="w-10 h-8 object-cover rounded border border-[#D8D6D1] cursor-zoom-in"
                          onClick={() => setImgView({ src: iss.sc, title: `Issue #${iss.num} — ${iss.page}`, label: `issue-${iss.num}-${slug(iss.page)}` })} />
                      ) : (
                        <div className="w-10 h-8 bg-[#EDECEA] rounded border border-[#D8D6D1] flex items-center justify-center text-[#9B9791] text-xs">🖼</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-[13px]">{iss.page || '—'}</div>
                      {iss.url && <div className="font-mono text-[11px] text-[#9B9791] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">{iss.url}</div>}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-[13px] text-[#5C5954] max-w-[260px]">{truncate(iss.desc, 90)}</div>
                      {iss.heur && <div className="text-[11px] text-[#9B9791] mt-0.5">{iss.heur}</div>}
                      {iss.wcag && <div className="text-[11px] text-[#9B9791]">WCAG {iss.wcag}</div>}
                    </td>
                    <td className="px-3 py-2.5"><Badge value={iss.sev} /></td>
                    <td className="px-3 py-2.5"><Badge value={iss.pri ? PRI_LABEL[iss.pri] || iss.pri : ''} /></td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {(iss.cats||[]).map(c => (
                          <span key={c} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EDECEA] text-[#9B9791] uppercase tracking-[.04em]">{c}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1 items-center">
                        <Button variant="ghost" size="sm" className="!px-1.5 !py-1" title="Edit" onClick={() => onEdit(iss)}>✏️</Button>
                        <Button variant="ghost" size="sm" className="!px-1.5 !py-1" title="Duplicate" onClick={() => duplicateIssue(iss.id)}>📋</Button>
                        <Button variant="ghost" size="sm" className="!px-1.5 !py-1" title="Copy Markdown" onClick={() => copyMd(iss)}>#</Button>
                        <Button variant="danger" size="sm" className="!px-1.5 !py-1" title="Delete" onClick={() => deleteIssue(iss.id)}>🗑</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
