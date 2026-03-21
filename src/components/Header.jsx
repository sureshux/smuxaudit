import { useRef } from 'react';
import { useAudit } from '../context/AuditContext';
import { Button } from './UI';
import { exportExcel, exportCSVFile, exportHtmlReport } from '../utils/exportUtils';
import { dlBlob, slug } from '../utils/helpers';
import { HEURISTICS, WCAG } from '../data/auditData';

export default function Header({ onConfirm, onShowMd }) {
  const { meta, setMeta, issues, checkState, stats, hFails, wFails, saveNow, lastSaved, clearAll, loadFromJSON, toast } = useAudit();
  const fileRef = useRef();

  const headerSub = [meta.app, meta.auditor, meta.date].filter(Boolean).join(' · ') || 'No project loaded';

  const handleExcel = () => {
    try {
      const name = exportExcel({ meta, issues, checkState });
      toast(`✅ Excel exported: ${name} (4 sheets)`, 'success', 5000);
    } catch (e) {
      toast('Excel export failed: ' + e.message, 'error');
    }
  };

  const handleCSV = () => {
    if (!issues.length) { toast('No issues to export.', 'warning'); return; }
    exportCSVFile({ meta, issues });
    toast(`CSV exported (${issues.length} issues)`, 'success');
  };

  const handleHtmlReport = () => {
    exportHtmlReport({ meta, issues, checkState });
    toast('HTML Report downloaded — open in any browser. Screenshots fully embedded.', 'success', 5000);
  };

  const handleSaveJSON = () => {
    const data = { meta, issues, checkState,
      statistics: { total: issues.length, bySev: stats.bySev, byPri: stats.byPri } };
    dlBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      `UX-Audit_${slug(meta.app || 'audit')}_${meta.date}.json`);
    toast('JSON saved.', 'success');
  };

  const handleLoadJSON = () => fileRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const go = () => {
      const r = new FileReader();
      r.onload = ev => {
        try {
          const d = JSON.parse(ev.target.result);
          if (!d.meta || !Array.isArray(d.issues)) throw new Error('Invalid file');
          loadFromJSON(d);
          toast(`Loaded ${d.issues.length} issues from ${file.name}`, 'success');
        } catch (err) { toast('Load failed: ' + err.message, 'error'); }
        e.target.value = '';
      };
      r.readAsText(file);
    };
    if (issues.length > 0) {
      onConfirm({ title: 'Load File', msg: `Replace current data with "${file.name}"?`, onOk: go, onCancel: () => { e.target.value = ''; } });
    } else go();
  };

  const handleClear = () => {
    onConfirm({
      title: 'Clear All Data',
      msg: `Delete all ${issues.length} issue(s) and reset all checklists? This cannot be undone.`,
      onOk: clearAll,
    });
  };

  const handleEmail = () => {
    const body = [
      `UX Audit: ${meta.app || 'Application'}`,
      `Auditor: ${meta.auditor || '—'} | Date: ${meta.date}`,
      '',
      `Issues: ${stats.total}`,
      `Critical: ${stats.bySev.Critical} | High: ${stats.bySev.High} | Medium: ${stats.bySev.Medium} | Low: ${stats.bySev.Low}`,
      `P1: ${stats.byPri.P1} | P2: ${stats.byPri.P2} | P3: ${stats.byPri.P3}`,
      '',
      `Heuristic Violations: ${hFails}/10`,
      `WCAG Failures: ${wFails}/${WCAG.length}`,
      '',
      '(Attach JSON/Excel for full details)',
    ].join('\n');
    window.location.href = `mailto:?subject=${encodeURIComponent(`UX Audit: ${meta.app||'Application'}`)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <header className="bg-[#1A1917] text-[#F5F4F0] sticky top-0 z-40 border-b-2 border-black">
      <div className="flex items-center justify-between px-6 py-3 gap-3 flex-wrap">
        <div>
          <div className="font-mono text-[13px] font-bold uppercase tracking-[.05em]">UX Audit Tool</div>
          <div className="font-mono text-[11px] text-[rgba(245,244,240,0.5)] tracking-[.03em] mt-0.5">{headerSub}</div>
        </div>
        <nav className="flex items-center gap-2 flex-wrap">
          <Button variant="inv" size="sm" onClick={saveNow} title="Ctrl+S">💾 Save JSON</Button>
          <Button variant="inv" size="sm" onClick={handleLoadJSON}>📂 Load JSON</Button>
          <Button variant="excel" size="sm" onClick={handleExcel} title="Export all tabs to Excel">📊 Export Excel</Button>
          <Button variant="inv" size="sm" onClick={handleHtmlReport}>📄 HTML Report</Button>
          <Button variant="inv" size="sm" onClick={handleCSV}>📋 CSV</Button>
          <Button variant="inv" size="sm" onClick={onShowMd}>Markdown</Button>
          <Button variant="inv" size="sm" onClick={handleEmail}>✉ Email</Button>
          <Button variant="danger" size="sm" onClick={handleClear}>🗑 Clear</Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
        </nav>
      </div>
      {lastSaved && (
        <div className="px-6 pb-1.5 text-[10px] text-[rgba(245,244,240,0.4)] font-mono">{lastSaved}</div>
      )}
    </header>
  );
}
