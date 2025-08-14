import React, { useState, useMemo, useRef } from 'react';

// ---------- Styles (kept inline for portability) ----------
const styles = {
  page: {
    minHeight: '100vh',
    margin: 0,
    display: 'grid',
    placeItems: 'center',
    background:
      'radial-gradient(1200px 800px at 80% -10%, rgba(124,92,255,0.2), transparent),' +
      'radial-gradient(900px 700px at 10% 110%, rgba(33,212,253,0.18), transparent),' +
      '#0f1226',
    color: '#fff',
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    padding: 24,
  },
  wrap: {
    width: '100%',
    maxWidth: 980,
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))',
    border: '1px solid #2a2f6a',
    borderRadius: 16,
    padding: 24,
    backdropFilter: 'blur(6px)',
    boxShadow: '0 15px 60px rgba(0,0,0,0.35)',
  },
  header: { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #7c5cff, #21d4fd)',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 800,
    fontSize: 22,
  },
  h1: { margin: 0, fontSize: 'clamp(20px, 2.2vw, 28px)', letterSpacing: 0.2 },
  sub: { margin: '4px 0 0', color: '#a9b1d6', fontSize: 14 },
  grid: {
    display: 'grid',
    gap: 16,
    gridTemplateColumns: '1fr',
    marginTop: 20,
  },
  card: {
    background: '#15193a',
    border: '1px solid #2a2f6a',
    borderRadius: 14,
    padding: 18,
  },
  drop: {
    border: '2px dashed #394099',
    borderRadius: 12,
    padding: 28,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color .2s ease, background .2s ease',
  },
  dropActive: {
    borderColor: '#21d4fd',
    background: 'rgba(33,212,253,0.06)',
  },
  row: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 },
  btn: {
    appearance: 'none',
    border: '1px solid transparent',
    background: 'linear-gradient(135deg, #7c5cff, #21d4fd)',
    color: 'white',
    padding: '12px 16px',
    fontWeight: 700,
    borderRadius: 12,
    cursor: 'pointer',
    flex: '1 1 220px',
  },
  btnSecondary: {
    background: 'transparent',
    border: '1px solid #3b3f7a',
    color: '#cfd4ff',
  },
  status: { marginTop: 10, minHeight: 20, fontSize: 14, color: '#a9b1d6' },
  statusOK: { color: '#37d67a' },
  statusERR: { color: '#ff5a7a' },
  consoleWrap: {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: 12,
    lineHeight: 1.4,
    color: '#cdd3ff',
    maxHeight: 260,
    overflow: 'auto',
    background: '#0c1030',
    borderRadius: 10,
    padding: 12,
    border: '1px solid #2a2f6a',
    whiteSpace: 'pre-wrap',
  },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: {
    background: '#1a1f4f',
    color: '#cdd3ff',
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    border: '1px solid #2a2f6a',
  },
  footer: { marginTop: 18, fontSize: 12, color: '#a9b1d6', textAlign: 'center' },
};

// ---------- Helpers ----------
const isObject = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);

function resolveTags(parsed) {
  if (isObject(parsed) && parsed.containerVersion && Array.isArray(parsed.containerVersion.tag)) {
    return parsed.containerVersion.tag;
  }
  if (Array.isArray(parsed.container) &&
      parsed.container[0] &&
      parsed.container[0].containerVersion &&
      Array.isArray(parsed.container[0].containerVersion.tag)) {
    return parsed.container[0].containerVersion.tag;
  }
  throw new Error('Could not find tags in JSON. Expected "containerVersion.tag".');
}

function extractGA4Rows(tags) {
  const GA4_TYPES = new Set(['gaawe', 'googtag']); // GA4 Event + GA4 Config
  const rows = [];
  (tags || []).forEach((tag) => {
    if (!tag || !GA4_TYPES.has(tag.type)) return;

    const tagName = tag?.name || '';
    // Keep GA4 Config rows with blank eventName (per your request)
    const eventName =
      (tag?.parameter || []).find((p) => p?.key === 'eventName')?.value || '';

    const keyTables = ['eventSettingsTable', 'configSettingsTable'];
    (tag?.parameter || []).forEach((param) => {
      if (!param || !keyTables.includes(param.key)) return;
      const list = Array.isArray(param.list) ? param.list : [];
      list.forEach((item) => {
        const map = Array.isArray(item?.map) ? item.map : [];
        let parameter = '';
        let value = '';
        map.forEach((m) => {
          if (m?.key === 'parameter') parameter = m?.value ?? '';
          if (m?.key === 'parameterValue') value = m?.value ?? '';
        });
        if (parameter) {
          rows.push({ tagName, eventName, parameter, value });
        }
      });
    });
  });
  return rows;
}

function deduplicateRows(rows) {
  if (!Array.isArray(rows)) return [];
  const seen = new Set();
  const unique = [];
  for (const r of rows) {
    const key = `${r.tagName}||${r.eventName}||${r.parameter}||${r.value}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(r);
    }
  }
  return unique;
}

function toCSV(rows) {
  if (!Array.isArray(rows)) rows = [];
  const esc = (v) => {
    if (v == null) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ['Tag Name', 'GA4 Event Name', 'Parameter', 'Value'];
  const lines = [header, ...rows.map((r) => [r.tagName, r.eventName, r.parameter, r.value].map(esc))];
  return lines.map((cols) => cols.join(',')).join('\n');
}

function saveCSV(filename, csvText) {
  const safeName = typeof filename === 'string' && filename.trim() ? filename.trim() : 'GA4_Events_and_Parameters.csv';
  const safeText = typeof csvText === 'string' ? csvText : '';
  const blob = new Blob([safeText], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------- Component ----------
export default function GTMGA4Extractor() {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState(''); // '', 'ok', 'err'
  const [dragOver, setDragOver] = useState(false);
  const [verbose, setVerbose] = useState(false);
  const consoleRef = useRef(null);

  const canDownload = useMemo(() => Array.isArray(rows) && rows.length > 0, [rows]);

  const log = (...args) => {
    if (!consoleRef.current) return;
    consoleRef.current.textContent +=
      args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a, null, 2))).join(' ') + '\n';
  };
  const clearLog = () => {
    if (!consoleRef.current) return;
    consoleRef.current.textContent = '';
  };
  const setStatusMsg = (msg, type = '') => {
    setStatus(msg);
    setStatusType(type);
  };

  async function parseFile(file) {
    clearLog();
    setStatusMsg('Reading file…', '');
    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error('Invalid JSON. Please upload a valid GTM export (.json).');
      }

      if (verbose) {
        const preview = JSON.stringify(parsed, null, 2);
        log('Parsed JSON (preview):', preview.length > 2000 ? preview.slice(0, 2000) + '… (truncated)' : preview);
      }

      const tags = resolveTags(parsed);
      log(`Found ${tags.length} tags in container.`);
      let extracted = extractGA4Rows(tags);

      // Deduplicate rows per your request
      extracted = deduplicateRows(extracted);

      if (!extracted.length) {
        setRows([]);
        setStatusMsg('No GA4 parameters found (looked for types "gaawe" and "googtag").', 'err');
        log('No GA4 rows matched.');
        return;
      }

      setRows(extracted);
      setStatusMsg(`Ready: ${extracted.length} unique GA4 parameters extracted.`, 'ok');
      log('Sample rows:', extracted.slice(0, Math.min(5, extracted.length)));
    } catch (e) {
      setRows([]);
      setStatusMsg(e.message || 'Unexpected error while processing file.', 'err');
      log('Error:', e.message || String(e));
    }
  }

  const onInputChange = (e) => {
    const file = e.target?.files?.[0];
    if (file) {
      setFileName(file.name);
      parseFile(file);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      setFileName(file.name);
      parseFile(file);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const downloadCSV = () => {
    if (!Array.isArray(rows) || rows.length === 0) {
      setStatusMsg('Nothing to download. Please upload a GTM JSON first.', 'err');
      log('Download aborted: rows empty.');
      return;
    }
    const csv = toCSV(rows);
    if (!csv || typeof csv !== 'string' || csv.trim() === '') {
      setStatusMsg('CSV generation failed. Please re-upload the file.', 'err');
      log('CSV generation returned empty string.');
      return;
    }
    saveCSV('GA4_Events_and_Parameters.csv', csv);
    setStatusMsg('CSV downloaded.', 'ok');
  };

  // ---------- Tests (manual runner) ----------
  const runTests = () => {
    clearLog();
    setStatusMsg('Running tests…', '');

    function assert(name, cond) {
      const ok = !!cond;
      log(`${ok ? '✅' : '❌'} ${name}`);
      if (!ok) throw new Error('Test failed: ' + name);
    }

    // 1) Minimal GA4 Config (googtag)
    const sample1 = {
      containerVersion: {
        tag: [
          {
            name: 'GA4 Config',
            type: 'googtag',
            parameter: [
              {
                key: 'configSettingsTable',
                list: [
                  {
                    map: [
                      { key: 'parameter', value: 'page_location' },
                      { key: 'parameterValue', value: '{{Page URL}}' },
                    ],
                  },
                  {
                    map: [
                      { key: 'parameter', value: 'send_page_view' },
                      { key: 'parameterValue', value: 'True' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    };
    {
      const tags = resolveTags(sample1);
      const r = deduplicateRows(extractGA4Rows(tags));
      assert('Sample1 rows length == 2', r.length === 2);
      assert('Sample1 eventName blank for config', r.every((x) => x.eventName === ''));
    }

    // 2) GA4 Event (gaawe) with eventSettingsTable
    const sample2 = {
      containerVersion: {
        tag: [
          {
            name: 'GA4-All CTA Click-KC',
            type: 'gaawe',
            parameter: [
              { key: 'eventName', value: 'cta_click' },
              {
                key: 'eventSettingsTable',
                list: [
                  {
                    map: [
                      { key: 'parameter', value: 'click_text' },
                      { key: 'parameterValue', value: '{{Click Text}}' },
                    ],
                  },
                  {
                    map: [
                      { key: 'parameter', value: 'link_url' },
                      { key: 'parameterValue', value: '{{Click URL}}' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    };
    {
      const tags = resolveTags(sample2);
      const r = deduplicateRows(extractGA4Rows(tags));
      assert('Sample2 rows length == 2', r.length === 2);
      assert('Sample2 has eventName "cta_click"', r.every((x) => x.eventName === 'cta_click'));
      assert('Sample2 includes link_url param', r.some((x) => x.parameter === 'link_url'));
    }

    // 3) Non-GA4 tag ignored
    const sample3 = { containerVersion: { tag: [{ name: 'UA Event', type: 'ua' }] } };
    {
      const r = deduplicateRows(extractGA4Rows(resolveTags(sample3)));
      assert('Sample3 rows length == 0 for non-GA4 tag', r.length === 0);
    }

    // 4) Alternative shape: container[0].containerVersion.tag
    const sample4 = {
      container: [{ containerVersion: { tag: [{ name: 'GA4 Config', type: 'googtag', parameter: [] }] } }],
    };
    {
      const tags = resolveTags(sample4);
      assert('Sample4 tags resolved via alternative path', Array.isArray(tags) && tags.length === 1);
    }

    // 5) Malformed structure throws resolve error
    {
      let threw = false;
      try {
        resolveTags({ nope: true });
      } catch (e) {
        threw = true;
      }
      assert('Malformed structure throws friendly error', threw);
    }

    // 6) CSV generation & dedupe test
    {
      const dupRows = [
        { tagName: 'T', eventName: 'E', parameter: 'link_url', value: '{{Click URL}}' },
        { tagName: 'T', eventName: 'E', parameter: 'link_url', value: '{{Click URL}}' }, // duplicate
      ];
      const ded = deduplicateRows(dupRows);
      assert('Deduplicate removes duplicate rows', ded.length === 1);
      const csvData = toCSV(ded);
      assert('CSV has header + 1 row', csvData.split('\n').length === 2);
    }

    setStatusMsg('All tests passed ✅', 'ok');
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <header style={styles.header}>
          <div style={styles.logo}>GA4</div>
          <div>
            <h1 style={styles.h1}>GTM JSON → GA4 Events & Parameters → CSV</h1>
            <p style={styles.sub}>
              Upload a GTM export (.json). We’ll extract GA4 tag parameters and include the event name.
            </p>
          </div>
        </header>

        <div
          style={{
            ...styles.grid,
            gridTemplateColumns: window.innerWidth >= 900 ? '1.3fr 1fr' : '1fr',
          }}
        >
          <section style={styles.card}>
            <div
              style={{ ...styles.drop, ...(dragOver ? styles.dropActive : {}) }}
              onClick={() => document.getElementById('fileInput')?.click()}
              onDragEnter={onDragOver}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              role="button"
              tabIndex={0}
            >
              <input id="fileInput" type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={onInputChange} />
              <p><strong>Click to choose a GTM JSON</strong> or drag & drop here</p>
              <div style={styles.chips}>
                <span style={styles.chip}>GA4 Event (type: <code>gaawe</code>)</span>
                <span style={styles.chip}>GA4 Config (type: <code>googtag</code>)</span>
                <span style={styles.chip}>Pulls: <code>eventSettingsTable</code>, <code>configSettingsTable</code></span>
              </div>
              {fileName ? <p style={{ marginTop: 8, color: '#a9b1d6' }}>Uploaded: {fileName}</p> : null}
            </div>

            <div style={styles.row}>
              <button
                style={{ ...styles.btn, ...(canDownload ? {} : { opacity: 0.6, cursor: 'not-allowed' }) }}
                onClick={downloadCSV}
                disabled={!canDownload}
                aria-disabled={!canDownload}
              >
                Download CSV
              </button>
              <button
                style={{ ...styles.btn, ...styles.btnSecondary }}
                onClick={() => {
                  setRows([]);
                  setFileName('');
                  setStatusMsg('Cleared.', '');
                  clearLog();
                }}
              >
                Clear
              </button>
              <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={runTests}>
                Run Tests
              </button>
            </div>
            <div
              style={{
                ...styles.status,
                ...(statusType === 'ok' ? styles.statusOK : {}),
                ...(statusType === 'err' ? styles.statusERR : {}),
              }}
            >
              {status}
            </div>
          </section>

          <section style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>Console</div>
              <label style={{ fontSize: 12, color: '#a9b1d6' }}>
                <input type="checkbox" checked={verbose} onChange={(e) => setVerbose(e.target.checked)} /> Verbose JSON log
              </label>
            </div>
            <div ref={consoleRef} style={styles.consoleWrap} aria-live="polite" />
          </section>
        </div>

        <footer style={styles.footer}>
          Tip: Need extra columns (Tag ID, Triggers, Measurement ID override)? Tell me and I’ll add them.
        </footer>
      </div>
    </div>
  );
}
