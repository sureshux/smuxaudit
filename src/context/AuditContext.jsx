import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { initCheckState, calcStats } from '../utils/helpers';
import { HEURISTICS, WCAG } from '../data/auditData';

const LS_KEY = 'ux-audit-react-v1';

const AuditContext = createContext(null);

export function AuditProvider({ children }) {
  const [meta, setMeta] = useState({
    app: '', auditor: '', date: new Date().toISOString().split('T')[0],
  });
  const [issues, setIssues] = useState([]);
  const [checkState, setCheckState] = useState(initCheckState);
  const [lastSaved, setLastSaved] = useState('');
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  // ── Toast ──────────────────────────────────
  const toast = useCallback((msg, type = 'info', dur = 4000) => {
    const id = ++toastId.current;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), dur);
  }, []);

  // ── Load from localStorage ─────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.meta) setMeta(d.meta);
      if (Array.isArray(d.issues)) setIssues(d.issues);
      if (d.checkState) setCheckState(cs => ({ ...cs, ...d.checkState }));
    } catch (e) { /* ignore corrupt data */ }
  }, []);

  // ── Auto-save every 30s ────────────────────
  const doSave = useCallback((m, iss, cs) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ meta: m, issues: iss, checkState: cs }));
      setLastSaved('Auto-saved ' + new Date().toLocaleTimeString());
    } catch (e) {
      toast('localStorage full! Export JSON now.', 'error');
    }
  }, [toast]);

  useEffect(() => {
    const id = setInterval(() => doSave(meta, issues, checkState), 30000);
    return () => clearInterval(id);
  }, [meta, issues, checkState, doSave]);

  const saveNow = useCallback(() => {
    doSave(meta, issues, checkState);
    toast('Session saved to browser storage.', 'success');
  }, [meta, issues, checkState, doSave, toast]);

  // ── Issue CRUD ─────────────────────────────
  const addIssue = useCallback((issue) => {
    setIssues(prev => {
      const next = [...prev, { ...issue, id: Date.now().toString(), num: prev.length + 1, created: new Date().toISOString() }];
      doSave(meta, next, checkState);
      return next;
    });
  }, [meta, checkState, doSave]);

  const updateIssue = useCallback((id, data) => {
    setIssues(prev => {
      const next = prev.map(i => i.id === id ? { ...i, ...data, updatedAt: new Date().toISOString() } : i);
      doSave(meta, next, checkState);
      return next;
    });
  }, [meta, checkState, doSave]);

  const deleteIssue = useCallback((id) => {
    setIssues(prev => {
      const next = prev.filter(i => i.id !== id).map((i, idx) => ({ ...i, num: idx + 1 }));
      doSave(meta, next, checkState);
      return next;
    });
  }, [meta, checkState, doSave]);

  const duplicateIssue = useCallback((id) => {
    setIssues(prev => {
      const src = prev.find(i => i.id === id);
      if (!src) return prev;
      const next = [...prev, { ...src, id: Date.now().toString(), num: prev.length + 1, page: src.page + ' (copy)', created: new Date().toISOString() }];
      doSave(meta, next, checkState);
      return next;
    });
  }, [meta, checkState, doSave]);

  // ── Checklist CRUD ─────────────────────────
  const updateCheck = useCallback((id, fields) => {
    setCheckState(prev => {
      const next = { ...prev, [id]: { ...prev[id], ...fields } };
      doSave(meta, issues, next);
      return next;
    });
  }, [meta, issues, doSave]);

  // ── Clear all ──────────────────────────────
  const clearAll = useCallback(() => {
    setIssues([]);
    setCheckState(initCheckState());
    setMeta(m => ({ ...m, app: '', auditor: '' }));
    localStorage.removeItem(LS_KEY);
  }, []);

  // ── Load JSON ─────────────────────────────
  const loadFromJSON = useCallback((data) => {
    if (data.meta) setMeta(data.meta);
    if (Array.isArray(data.issues)) setIssues(data.issues);
    if (data.checkState) setCheckState(cs => ({ ...initCheckState(), ...data.checkState }));
  }, []);

  const stats = calcStats(issues);
  const hFails = HEURISTICS.filter(h => checkState[h.id]?.status === 'Fail').length;
  const wFails = WCAG.filter(c => checkState[c.id]?.status === 'Fail').length;

  return (
    <AuditContext.Provider value={{
      meta, setMeta,
      issues, addIssue, updateIssue, deleteIssue, duplicateIssue,
      checkState, updateCheck,
      stats, hFails, wFails,
      lastSaved, saveNow,
      clearAll, loadFromJSON,
      toasts, toast,
    }}>
      {children}
    </AuditContext.Provider>
  );
}

export const useAudit = () => useContext(AuditContext);
