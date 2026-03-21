import { useState, useEffect } from 'react';
import { useAudit } from '../context/AuditContext';
import { Button, SectionTitle, ScreenshotDropZone } from './UI';
import { CATEGORIES } from '../data/auditData';

const EMPTY = { page:'', url:'', desc:'', sev:'', pri:'', cats:[], heur:'', wcag:'', sc:null, rec:'', ass:'' };

export default function IssueForm({ prefill, editId, onCancelEdit }) {
  const { addIssue, updateIssue, toast } = useAudit();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (prefill) setForm(f => ({ ...f, ...prefill }));
  }, [prefill]);

  useEffect(() => {
    if (editId === null) setForm(EMPTY);
  }, [editId]);

  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setErrors(e => ({ ...e, [key]: false })); };

  const toggleCat = (cat) => {
    setForm(f => ({
      ...f,
      cats: f.cats.includes(cat) ? f.cats.filter(c => c !== cat) : [...f.cats, cat],
    }));
    setErrors(e => ({ ...e, cats: false }));
  };

  const validate = () => {
    const e = {};
    if (!form.page.trim()) e.page = true;
    if (!form.desc.trim()) e.desc = true;
    if (!form.sev) e.sev = true;
    if (!form.pri) e.pri = true;
    if (!form.cats.length) e.cats = true;
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = () => {
    if (!validate()) { toast('Please fill in all required fields.', 'error'); return; }
    if (editId) {
      updateIssue(editId, form);
      toast('Issue updated.', 'success');
      onCancelEdit();
    } else {
      addIssue(form);
      toast(`Issue added.`, 'success');
    }
    setForm(EMPTY);
  };

  const reset = () => { setForm(EMPTY); setErrors({}); onCancelEdit?.(); };

  return (
    <aside className="bg-white border-r border-[#D8D6D1] p-5 overflow-y-auto" style={{ position: 'sticky', top: 92, height: 'calc(100vh - 92px)' }}>
      <SectionTitle>Capture Issue</SectionTitle>

      {editId && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-[6px] px-3 py-2 text-[12px] text-orange-600 font-medium mb-3">
          ✏️ Editing issue
          <Button variant="ghost" size="sm" onClick={onCancelEdit} className="ml-auto !py-0.5">Cancel</Button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {/* Page + URL */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label>Page / Screen <span className="text-red-500">*</span></label>
            <input value={form.page} onChange={e => set('page', e.target.value)} placeholder="e.g. Login" className={errors.page ? 'error' : ''} />
          </div>
          <div>
            <label>URL</label>
            <input type="url" value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://…" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label>Issue Description <span className="text-red-500">*</span></label>
          <textarea value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="Describe the UX/UI issue clearly…" className={errors.desc ? 'error' : ''} rows={3} />
        </div>

        {/* Severity + Priority */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label>Severity <span className="text-red-500">*</span></label>
            <select value={form.sev} onChange={e => set('sev', e.target.value)} className={errors.sev ? 'error' : ''}>
              <option value="">Select…</option>
              <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>
          <div>
            <label>Priority <span className="text-red-500">*</span></label>
            <select value={form.pri} onChange={e => set('pri', e.target.value)} className={errors.pri ? 'error' : ''}>
              <option value="">Select…</option>
              <option value="P1">P1 — Must Fix</option>
              <option value="P2">P2 — Should Fix</option>
              <option value="P3">P3 — Nice to Have</option>
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label>Category <span className="text-red-500">*</span></label>
          <div className={`flex flex-wrap gap-1.5 ${errors.cats ? 'outline outline-2 outline-red-400 rounded p-1' : ''}`}>
            {CATEGORIES.map(cat => (
              <label key={cat} className={`flex items-center gap-1 px-2.5 py-1 border-[1.5px] rounded-full cursor-pointer text-[12px] font-medium select-none transition-all
                ${form.cats.includes(cat) ? 'border-[#1A1917] bg-[#1A1917] text-white' : 'border-[#D8D6D1] hover:border-[#B0ADA6] hover:bg-[#EDECEA]'}`}>
                <input type="checkbox" checked={form.cats.includes(cat)} onChange={() => toggleCat(cat)} className="hidden" />
                {cat}
              </label>
            ))}
          </div>
        </div>

        {/* Heuristic + WCAG */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label>Heuristic</label>
            <select value={form.heur} onChange={e => set('heur', e.target.value)}>
              <option value="">None</option>
              {['H1: System Status','H2: Real World','H3: User Control','H4: Consistency','H5: Error Prevention','H6: Recognition','H7: Flexibility','H8: Minimalist','H9: Error Recovery','H10: Help & Docs'].map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div>
            <label>WCAG Criterion</label>
            <input value={form.wcag} onChange={e => set('wcag', e.target.value)} placeholder="e.g. 1.4.3" />
          </div>
        </div>

        {/* Screenshot */}
        <div>
          <label>Screenshot <span className="text-[#9B9791] text-[10px] normal-case tracking-normal font-normal">(optional, ≤2MB)</span></label>
          <ScreenshotDropZone value={form.sc} onChange={v => set('sc', v)} />
        </div>

        {/* Recommendation */}
        <div>
          <label>Recommendation</label>
          <textarea value={form.rec} onChange={e => set('rec', e.target.value)} placeholder="Suggested fix…" rows={2} />
        </div>

        {/* Assignee */}
        <div>
          <label>Assignee Email</label>
          <input type="email" value={form.ass} onChange={e => set('ass', e.target.value)} placeholder="dev@example.com" />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="primary" onClick={submit} className="flex-1 justify-center">
            {editId ? '✓ Update Issue' : '+ Add Issue'}
          </Button>
          <Button variant="ghost" onClick={reset} className="flex-1 justify-center">↺ Clear</Button>
        </div>
      </div>
    </aside>
  );
}
