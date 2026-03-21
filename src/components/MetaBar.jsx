import { useAudit } from '../context/AuditContext';

export default function MetaBar() {
  const { meta, setMeta } = useAudit();
  const update = (key, val) => setMeta(m => ({ ...m, [key]: val }));

  return (
    <section className="bg-white border-b border-[#D8D6D1] px-6 py-3.5">
      <div className="grid gap-4 max-w-[880px]" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
        <div>
          <label>Application / Product <span className="text-red-500">*</span></label>
          <input value={meta.app} onChange={e => update('app', e.target.value)} placeholder="e.g. Acme Dashboard v2" />
        </div>
        <div>
          <label>Auditor Name <span className="text-red-500">*</span></label>
          <input value={meta.auditor} onChange={e => update('auditor', e.target.value)} placeholder="e.g. Jane Smith" />
        </div>
        <div>
          <label>Audit Date</label>
          <input type="date" value={meta.date} onChange={e => update('date', e.target.value)} style={{ minWidth: 136 }} />
        </div>
      </div>
    </section>
  );
}
