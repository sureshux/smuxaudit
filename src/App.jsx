import { useState, useCallback } from 'react';
import { useAudit } from './context/AuditContext';
import Header from './components/Header';
import MetaBar from './components/MetaBar';
import IssueForm from './components/IssueForm';
import IssueTable from './components/IssueTable';
import HeuristicsTab from './components/HeuristicsTab';
import WcagTab from './components/WcagTab';
import { ToastContainer, ConfirmModal, MdModal } from './components/UI';
import { HEURISTICS, WCAG } from './data/auditData';

export default function App() {
  const { toasts, checkState, issues, stats, hFails, wFails, meta } = useAudit();
  const [tab, setTab] = useState('issues');
  const [confirm, setConfirm] = useState(null);
  const [mdModal, setMdModal] = useState(false);
  const [mdText, setMdText] = useState('');
  const [editIssue, setEditIssue] = useState(null);
  const [prefill, setPrefill] = useState(null);

  const handlePushToLog = useCallback((itemId, type) => {
    const list = type === 'h' ? HEURISTICS : WCAG;
    const item = list.find(x => x.id === itemId);
    const s = checkState[itemId];
    if (!item || !s) return;
    setPrefill({
      desc: s.notes || `Violation of: ${item.t}`,
      rec: s.rec || '',
      sev: s.severity || '',
      pri: s.priority || '',
      sc: s.sc || null,
      cats: [type === 'h' ? 'Heuristic' : 'WCAG'],
      heur: type === 'h' ? `H${item.n}: ${item.t}` : '',
      wcag: type === 'w' ? item.n : '',
    });
    setEditIssue(null);
    setTab('issues');
  }, [checkState]);

  const handleShowMd = () => {
    const hF = HEURISTICS.filter(h => checkState[h.id]?.status === 'Fail').length;
    const wF = WCAG.filter(c => checkState[c.id]?.status === 'Fail').length;
    const lines = [
      `## UX Audit: ${meta.app || 'Application'}`,
      `**Auditor:** ${meta.auditor || '—'}  |  **Date:** ${meta.date}`,
      '',
      `**Issues:** ${stats.total}  ·  Critical: ${stats.bySev.Critical}  ·  High: ${stats.bySev.High}`,
      `**Heuristic Fails:** ${hF}/10  ·  **WCAG Fails:** ${wF}/${WCAG.length}`,
      '',
      '| # | Page | Issue | Severity | Priority | Category | Recommendation |',
      '|---|------|-------|----------|----------|----------|----------------|',
      ...issues.map(i =>
        `| #${i.num} | ${i.page || ''} | ${(i.desc || '').slice(0, 80)} | ${i.sev || '—'} | ${i.pri || '—'} | ${(i.cats || []).join(', ') || '—'} | ${i.rec || '—'} |`
      ),
    ];
    setMdText(lines.join('\n'));
    setMdModal(true);
  };

  const tabBadge = {
    issues: issues.length,
    heuristics: hFails > 0 ? `${hFails} Fail` : "Nielsen's 10",
    wcag: wFails > 0 ? `${wFails} Fail` : 'AA',
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0]">
      <ToastContainer toasts={toasts} />
      {confirm && <ConfirmModal {...confirm} onClose={() => setConfirm(null)} />}
      {mdModal && <MdModal text={mdText} onClose={() => setMdModal(false)} />}

      <Header onConfirm={setConfirm} onShowMd={handleShowMd} />
      <MetaBar />

      {/* Tab Nav */}
      <nav className="bg-white border-b border-[#D8D6D1] px-6 flex overflow-x-auto sticky top-[56px] z-30">
        {[
          { id: 'issues',     label: '📋 Issue Log' },
          { id: 'heuristics', label: '🧠 Heuristics' },
          { id: 'wcag',       label: '♿ WCAG 2.1' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 text-[13px] font-medium px-4 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer bg-transparent
              ${tab === t.id
                ? 'text-[#1A1917] border-[#1A1917] font-semibold'
                : 'text-[#9B9791] border-transparent hover:text-[#5C5954]'
              }`}
            style={{ marginBottom: -1 }}
          >
            {t.label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors
              ${tab === t.id ? 'bg-[#1A1917] text-white' : 'bg-[#EDECEA] text-[#9B9791]'}`}>
              {tabBadge[t.id]}
            </span>
          </button>
        ))}
      </nav>

      {/* Tab Panels */}
      {tab === 'issues' && (
        <div
          className="grid"
          style={{ gridTemplateColumns: '350px 1fr', minHeight: 'calc(100vh - 148px)' }}
        >
          <IssueForm
            prefill={prefill}
            editId={editIssue?.id || null}
            editData={editIssue}
            onCancelEdit={() => { setEditIssue(null); setPrefill(null); }}
          />
          <IssueTable
            onEdit={(iss) => { setEditIssue(iss); setPrefill(iss); }}
          />
        </div>
      )}

      {tab === 'heuristics' && (
        <HeuristicsTab onPushToLog={handlePushToLog} />
      )}

      {tab === 'wcag' && (
        <WcagTab onPushToLog={handlePushToLog} />
      )}
    </div>
  );
}
