import * as XLSX from 'xlsx';
import { HEURISTICS, WCAG } from '../data/auditData';
import { slug, dlBlob, calcStats, buildCSV } from './helpers';

const SEV_COLORS = {
  Critical: { bg: 'FFC7CE', fg: '9C0006' },
  High:     { bg: 'FDDCB5', fg: '7D3C00' },
  Medium:   { bg: 'FFEB9C', fg: '7D6608' },
  Low:      { bg: 'C6EFCE', fg: '276221' },
};
const STATUS_COLORS = {
  Pass: { bg: 'C6EFCE', fg: '276221' },
  Fail: { bg: 'FFC7CE', fg: '9C0006' },
  'N/A':{ bg: 'F2F2F2', fg: '999999' },
};

function colorCell(ws, r, c, bg, fg, bold = false) {
  const ref = XLSX.utils.encode_cell({ r, c });
  if (!ws[ref]) return;
  ws[ref].s = {
    fill: { fgColor: { rgb: bg } },
    font: { color: { rgb: fg }, bold },
  };
}

export function exportExcel({ meta, issues, checkState }) {
  const { app = 'UX-Audit', auditor = '—', date } = meta;
  const wb = XLSX.utils.book_new();
  const stats = calcStats(issues);
  const hFails = HEURISTICS.filter(h => checkState[h.id]?.status === 'Fail');
  const wFails = WCAG.filter(c => checkState[c.id]?.status === 'Fail');

  // ── Sheet 1: Issue Log ──────────────────────
  const issHdr = ['#','Date','Page / Screen','URL','Description','Severity','Priority','Category','Heuristic','WCAG','Recommendation','Assignee','Has Screenshot'];
  const issRows = issues.map(i => [
    i.num,
    i.created ? new Date(i.created).toLocaleDateString() : '',
    i.page||'', i.url||'', i.desc||'',
    i.sev||'', i.pri||'',
    (i.cats||[]).join(', '),
    i.heur||'', i.wcag||'', i.rec||'', i.ass||'',
    i.sc ? 'Yes' : 'No',
  ]);
  const ws1 = XLSX.utils.aoa_to_sheet([
    [`UX Audit — ${app}`],
    [`Auditor: ${auditor}  |  Date: ${date}`],
    [`For screenshots, use the HTML Report export`],
    [],
    issHdr,
    ...issRows,
  ]);
  ws1['!cols'] = [4,11,20,28,50,10,10,22,22,12,40,22,14].map(wch => ({ wch }));
  issRows.forEach((row, i) => {
    const r = 5 + i;
    const sev = row[5]; const pri = row[6]; const hasSc = row[12];
    if (SEV_COLORS[sev]) colorCell(ws1, r, 5, SEV_COLORS[sev].bg, SEV_COLORS[sev].fg, true);
    if (pri === 'P1') colorCell(ws1, r, 6, 'FFC7CE', '9C0006', true);
    else if (pri === 'P2') colorCell(ws1, r, 6, 'FFEB9C', '7D6608', false);
    if (hasSc === 'Yes') colorCell(ws1, r, 12, 'C6EFCE', '276221', true);
  });
  XLSX.utils.book_append_sheet(wb, ws1, 'Issue Log');

  // ── Sheet 2: Heuristics ──────────────────────
  const hHdr = ['#','Heuristic','Description','Status','Severity','Priority','Notes / Evidence','Recommendation','Caption','Has Screenshot'];
  const hRows = HEURISTICS.map(h => {
    const s = checkState[h.id] || {};
    return [h.n, h.t, h.d, s.status||'N/A', s.severity||'', s.priority||'', s.notes||'', s.rec||'', s.cap||'', s.sc?'Yes':'No'];
  });
  const ws2 = XLSX.utils.aoa_to_sheet([
    [`Heuristic Violations (Nielsen's 10) — ${app}`],
    [`Auditor: ${auditor}  |  Date: ${date}`],
    [`Pass: ${HEURISTICS.filter(h=>checkState[h.id]?.status==='Pass').length}  |  Fail: ${hFails.length}  |  N/A: ${HEURISTICS.filter(h=>checkState[h.id]?.status==='N/A').length}`],
    [],
    hHdr,
    ...hRows,
  ]);
  ws2['!cols'] = [4,42,60,8,10,10,50,40,30,14].map(wch => ({ wch }));
  hRows.forEach((row, i) => {
    const r = 5 + i;
    const st = row[3];
    if (STATUS_COLORS[st]) colorCell(ws2, r, 3, STATUS_COLORS[st].bg, STATUS_COLORS[st].fg, true);
    if (SEV_COLORS[row[4]]) colorCell(ws2, r, 4, SEV_COLORS[row[4]].bg, SEV_COLORS[row[4]].fg, true);
  });
  XLSX.utils.book_append_sheet(wb, ws2, 'Heuristics');

  // ── Sheet 3: WCAG 2.1 ───────────────────────
  const wHdr = ['#','Criterion','Title','Level','Principle','Status','Severity','Priority','Notes / Evidence','Recommendation','Caption','Has Screenshot'];
  const wRows = WCAG.map(c => {
    const s = checkState[c.id] || {};
    return [c.n, c.n, c.t, c.l, c.p, s.status||'N/A', s.severity||'', s.priority||'', s.notes||'', s.rec||'', s.cap||'', s.sc?'Yes':'No'];
  });
  const ws3 = XLSX.utils.aoa_to_sheet([
    [`WCAG 2.1 Accessibility Audit — ${app}`],
    [`Auditor: ${auditor}  |  Date: ${date}`],
    [`Pass: ${WCAG.filter(c=>checkState[c.id]?.status==='Pass').length}  |  Fail: ${wFails.length}  |  Level A Fails: ${WCAG.filter(c=>c.l==='A'&&checkState[c.id]?.status==='Fail').length}  |  Level AA Fails: ${WCAG.filter(c=>c.l==='AA'&&checkState[c.id]?.status==='Fail').length}`],
    [],
    wHdr,
    ...wRows,
  ]);
  ws3['!cols'] = [4,8,38,7,14,8,10,10,50,40,30,14].map(wch => ({ wch }));
  wRows.forEach((row, i) => {
    const r = 5 + i;
    const st = row[5];
    if (STATUS_COLORS[st]) colorCell(ws3, r, 5, STATUS_COLORS[st].bg, STATUS_COLORS[st].fg, true);
    const lv = row[3];
    colorCell(ws3, r, 3, lv==='A'?'DBEAFE':'E0E7FF', '1E40AF', true);
    if (SEV_COLORS[row[6]]) colorCell(ws3, r, 6, SEV_COLORS[row[6]].bg, SEV_COLORS[row[6]].fg, true);
  });
  XLSX.utils.book_append_sheet(wb, ws3, 'WCAG 2.1');

  // ── Sheet 4: Summary ────────────────────────
  const ws4 = XLSX.utils.aoa_to_sheet([
    [`UX Audit Summary — ${app}`],
    [`Auditor: ${auditor}  |  Date: ${date}`],
    [],
    ['ISSUE LOG SUMMARY'],
    ['Total Issues',      stats.total],
    ['Critical',          stats.bySev.Critical],
    ['High',              stats.bySev.High],
    ['Medium',            stats.bySev.Medium],
    ['Low',               stats.bySev.Low],
    ['P1 — Must Fix',     stats.byPri.P1],
    ['P2 — Should Fix',   stats.byPri.P2],
    ['P3 — Nice to Have', stats.byPri.P3],
    [],
    ['HEURISTICS SUMMARY'],
    ['Total',   HEURISTICS.length],
    ['Pass',    HEURISTICS.filter(h=>checkState[h.id]?.status==='Pass').length],
    ['Fail',    hFails.length],
    ['N/A',     HEURISTICS.filter(h=>checkState[h.id]?.status==='N/A').length],
    [],
    hFails.length ? ['HEURISTIC VIOLATIONS'] : ['No heuristic violations recorded'],
    ...hFails.map(h => [h.n, h.t, checkState[h.id]?.severity||'', checkState[h.id]?.priority||'', checkState[h.id]?.notes||'']),
    [],
    ['WCAG 2.1 SUMMARY'],
    ['Total',        WCAG.length],
    ['Pass',         WCAG.filter(c=>checkState[c.id]?.status==='Pass').length],
    ['Fail',         wFails.length],
    ['Level A Fails',WCAG.filter(c=>c.l==='A'&&checkState[c.id]?.status==='Fail').length],
    ['Level AA Fails',WCAG.filter(c=>c.l==='AA'&&checkState[c.id]?.status==='Fail').length],
    [],
    wFails.length ? ['WCAG FAILURES'] : ['No WCAG failures recorded'],
    ...wFails.map(c => [c.n, c.t, c.l, c.p, checkState[c.id]?.severity||'', checkState[c.id]?.priority||'', checkState[c.id]?.notes||'']),
  ]);
  ws4['!cols'] = [28,10,38,7,14,10,10,50].map(wch => ({ wch }));
  XLSX.utils.book_append_sheet(wb, ws4, 'Summary');

  const filename = `UX-Audit_${slug(app)}_${date}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
}

export function exportCSVFile({ meta, issues }) {
  const { app='UX-Audit', date } = meta;
  const hdr = ['#','Date','Page','URL','Description','Severity','Priority','Category','Heuristic','WCAG','Recommendation','Assignee','Has Screenshot'];
  const rows = issues.map(i => [
    i.num, i.created ? new Date(i.created).toLocaleDateString() : '',
    i.page, i.url, i.desc, i.sev, i.pri,
    (i.cats||[]).join('; '), i.heur, i.wcag, i.rec, i.ass, i.sc?'Yes':'No',
  ]);
  dlBlob(new Blob(['\ufeff' + buildCSV([hdr, ...rows])], { type:'text/csv;charset=utf-8' }),
    `UX-Audit_${slug(app)}_${date}.csv`);
}

export function exportHtmlReport({ meta, issues, checkState }) {
  const { app='UX Audit', auditor='—', date } = meta;
  const stats = calcStats(issues);
  const hFails = HEURISTICS.filter(h => checkState[h.id]?.status === 'Fail').length;
  const wFails = WCAG.filter(c => checkState[c.id]?.status === 'Fail').length;

  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const scImg = src => src ? `<img src="${src}" style="max-width:100%;max-height:120px;border-radius:4px;border:1px solid #ddd;margin-top:6px;display:block;">` : '';
  const badge = (t,bg,c) => `<span style="display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700;background:${bg};color:${c};border:1px solid ${c}30">${esc(t)}</span>`;
  const SEV_MAP = { Critical:['#FEF2F2','#DC2626'], High:['#FFF7ED','#EA580C'], Medium:['#FFFBEB','#D97706'], Low:['#F0FDF4','#16A34A'] };

  const issueRows = issues.map(i => `<tr>
    <td style="color:#9B9791;font-family:monospace;font-size:11px">${i.num}</td>
    <td><strong>${esc(i.page||'—')}</strong>${i.url?`<br><span style="font-size:11px;color:#9B9791;font-family:monospace">${esc(i.url)}</span>`:''}</td>
    <td style="font-size:12px;color:#5C5954;max-width:240px">${esc(i.desc||'')}${i.heur?`<br><small style="color:#9B9791">${esc(i.heur)}</small>`:''}${i.wcag?`<br><small style="color:#9B9791">WCAG ${esc(i.wcag)}</small>`:''}</td>
    <td>${i.sev&&SEV_MAP[i.sev]?badge(i.sev,SEV_MAP[i.sev][0],SEV_MAP[i.sev][1]):''}</td>
    <td style="font-size:12px;font-weight:700;color:${i.pri==='P1'?'#B91C1C':i.pri==='P2'?'#5C5954':'#9B9791'}">${esc(i.pri||'')}</td>
    <td style="font-size:11px">${(i.cats||[]).join(', ')}</td>
    <td style="font-size:12px;color:#5C5954;max-width:200px">${esc(i.rec||'')}</td>
    <td>${scImg(i.sc)}</td>
  </tr>`).join('');

  const heurRows = HEURISTICS.map(h => {
    const s = checkState[h.id]||{};
    const sc = s.status==='Pass'?['#F0FDF4','#16A34A']:s.status==='Fail'?['#FEF2F2','#DC2626']:['#F5F4F0','#9B9791'];
    return `<tr style="border-left:3px solid ${sc[1]}">
      <td style="font-family:monospace;font-size:11px;color:#9B9791">${h.n}</td>
      <td><strong>${esc(h.t)}</strong><br><span style="font-size:11px;color:#9B9791">${esc(h.d)}</span></td>
      <td><span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;background:${sc[0]};color:${sc[1]}">${s.status||'N/A'}</span></td>
      <td>${s.severity&&SEV_MAP[s.severity]?badge(s.severity,SEV_MAP[s.severity][0],SEV_MAP[s.severity][1]):''}</td>
      <td style="font-size:12px;color:#5C5954">${esc(s.notes||'')}</td>
      <td style="font-size:12px;color:#5C5954">${esc(s.rec||'')}</td>
      <td>${scImg(s.sc)}</td>
    </tr>`;
  }).join('');

  const wcagRows = WCAG.map(c => {
    const s = checkState[c.id]||{};
    const sc = s.status==='Pass'?['#F0FDF4','#16A34A']:s.status==='Fail'?['#FEF2F2','#DC2626']:['#F5F4F0','#9B9791'];
    return `<tr style="border-left:3px solid ${sc[1]}">
      <td style="font-family:monospace;font-size:11px;color:#9B9791">${c.n}</td>
      <td><strong style="font-size:12px">${esc(c.t)}</strong><br><span style="font-size:11px;color:#9B9791">${esc(c.d)}</span></td>
      <td><span style="font-size:9px;font-weight:700;padding:2px 5px;border-radius:3px;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE">${c.l}</span></td>
      <td style="font-size:11px;color:#5C5954">${c.p}</td>
      <td><span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;background:${sc[0]};color:${sc[1]}">${s.status||'N/A'}</span></td>
      <td>${s.severity&&SEV_MAP[s.severity]?badge(s.severity,SEV_MAP[s.severity][0],SEV_MAP[s.severity][1]):''}</td>
      <td style="font-size:12px;color:#5C5954">${esc(s.notes||'')}</td>
      <td style="font-size:12px;color:#5C5954">${esc(s.rec||'')}</td>
      <td>${scImg(s.sc)}</td>
    </tr>`;
  }).join('');

  const th = `background:#1A1917;color:#F5F4F0;padding:9px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap`;
  const td = `padding:10px 12px;border-bottom:1px solid #E5E5E5;vertical-align:top`;

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>UX Audit Report — ${esc(app)}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;background:#F5F4F0;color:#1A1917;font-size:14px;line-height:1.5}.wrap{max-width:1200px;margin:0 auto;padding:32px 24px}.cover{background:#1A1917;color:#F5F4F0;border-radius:10px;padding:32px;margin-bottom:28px}.cover h1{font-size:26px;font-weight:700;margin-bottom:6px}.stats{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}.stat{background:rgba(255,255,255,.08);border-radius:8px;padding:12px 18px}.stat .val{font-size:28px;font-weight:700}.stat .lbl{font-size:11px;opacity:.6;text-transform:uppercase;letter-spacing:.04em;margin-top:4px}.section{background:#fff;border-radius:10px;padding:24px;margin-bottom:22px;box-shadow:0 1px 3px rgba(0,0,0,.07)}.sec-title{font-size:16px;font-weight:700;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid #E5E5E5}.tbl-wrap{overflow-x:auto;border-radius:7px;border:1px solid #E5E5E5}table{width:100%;border-collapse:collapse}th{${th}}td{${td}}tr:last-child td{border-bottom:none}tr:hover td{background:#FAFAF9}.footer{text-align:center;font-size:12px;color:#9B9791;padding:16px 0;border-top:1px solid #E5E5E5;margin-top:28px}@media print{body{background:#fff}}</style></head><body>
<div class="wrap">
<div class="cover"><h1>UX Audit Report</h1><p>${esc(app)}</p><p style="margin-top:6px;opacity:.65">Auditor: <strong>${esc(auditor)}</strong> · Date: <strong>${esc(date)}</strong></p>
<div class="stats">
  <div class="stat"><div class="val">${stats.total}</div><div class="lbl">Issues</div></div>
  <div class="stat"><div class="val" style="color:#FCA5A5">${stats.bySev.Critical}</div><div class="lbl">Critical</div></div>
  <div class="stat"><div class="val" style="color:#FDB87F">${stats.bySev.High}</div><div class="lbl">High</div></div>
  <div class="stat"><div class="val" style="color:#FCA5A5">${hFails}/10</div><div class="lbl">Heur Fails</div></div>
  <div class="stat"><div class="val" style="color:#FCA5A5">${wFails}/${WCAG.length}</div><div class="lbl">WCAG Fails</div></div>
</div></div>
<div class="section"><div class="sec-title">📋 Issue Log (${issues.length})</div>
${issues.length ? `<div class="tbl-wrap"><table><thead><tr><th>#</th><th>Page</th><th>Issue</th><th>Severity</th><th>Priority</th><th>Category</th><th>Recommendation</th><th>Screenshot</th></tr></thead><tbody>${issueRows}</tbody></table></div>` : '<p style="color:#9B9791;font-style:italic">No issues captured.</p>'}
</div>
<div class="section"><div class="sec-title">🧠 Heuristics — Nielsen's 10</div>
<div class="tbl-wrap"><table><thead><tr><th>#</th><th>Heuristic</th><th>Status</th><th>Severity</th><th>Notes</th><th>Recommendation</th><th>Screenshot</th></tr></thead><tbody>${heurRows}</tbody></table></div></div>
<div class="section"><div class="sec-title">♿ WCAG 2.1 (${WCAG.length} criteria)</div>
<div class="tbl-wrap"><table><thead><tr><th>Criterion</th><th>Title</th><th>Level</th><th>Principle</th><th>Status</th><th>Severity</th><th>Notes</th><th>Recommendation</th><th>Screenshot</th></tr></thead><tbody>${wcagRows}</tbody></table></div></div>
<div class="footer">Generated by UX Audit Tool · ${new Date().toLocaleString()} · All screenshots embedded — no external files needed</div>
</div></body></html>`;

  dlBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), `UX-Audit-Report_${slug(app)}_${date}.html`);
}
