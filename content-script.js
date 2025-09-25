// content-script.js
(function() {
  const SELECTORS = {
    wrapper: '.jobs-semantic-search-job-details-wrapper',
    topCard: '.job-details-jobs-unified-top-card__container--two-pane',
    description: 'div.jobs-box__html-content.jobs-description-content__text--stretch, .jobs-description-content__text--stretch'
  };

  let lastFingerprint = null;
  let lastCopiedJobId = null;
  let debounceTimer = null;

  // Patch history to detect LinkedIn SPA URL changes
  function patchHistory(method) {
    const original = history[method];
    history[method] = function() {
      const rv = original.apply(this, arguments);
      window.dispatchEvent(new Event('li-url-change'));
      return rv;
    };
  }
  ['pushState', 'replaceState'].forEach(patchHistory);
  window.addEventListener('popstate', () => window.dispatchEvent(new Event('li-url-change')));

  // Toast UI (isolated via shadow root)
  const toastHost = document.createElement('div');
  const shadow = toastHost.attachShadow({ mode: 'open' });
  const toast = document.createElement('div');
  const style = document.createElement('style');
  style.textContent = `
    .li-toast { 
      position: fixed; right: 16px; bottom: 16px; z-index: 2147483647;
      background: rgba(32, 33, 36, .92); color: #fff; padding: 10px 12px; 
      border-radius: 8px; font: 13px/1.4 -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,.35); opacity: 0; transform: translateY(8px);
      transition: opacity .18s ease, transform .18s ease;
      max-width: 44ch; word-wrap: break-word;
    }
    .li-toast.show { opacity: 1; transform: translateY(0); }
  `;
  toast.className = 'li-toast';
  shadow.append(style, toast);
  document.documentElement.appendChild(toastHost);

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function waitForWrapper() {
    return new Promise(resolve => {
      const existing = document.querySelector(SELECTORS.wrapper);
      if (existing) return resolve(existing);
      const obs = new MutationObserver(() => {
        const el = document.querySelector(SELECTORS.wrapper);
        if (el) {
          obs.disconnect();
          resolve(el);
        }
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
    });
  }

  function getJobIdFromUrl() {
    try {
      const url = new URL(location.href);
      const param = url.searchParams.get('currentJobId');
      if (param) return param;
      // Fallback: /jobs/view/4304445695/ or similar
      const m = location.pathname.match(/\/jobs\/view\/(\d+)\b/);
      if (m) return m[1];
    } catch (e) {}
    return null;
  }

  function normalizeText(s) {
    return (s || '')
      .replace(/\u00A0/g, ' ') // nbsp -> space
      .replace(/[ \t]+/g, ' ')
      .replace(/\s*\n\s*/g, '\n')
      .trim();
  }

  function extract() {
    const topEl = document.querySelector(SELECTORS.topCard);
    const descEl = document.querySelector(SELECTORS.description);
    if (!topEl && !descEl) return null;

    const jobId = getJobIdFromUrl();
    const srcUrl = location.href;

    const topHtml = topEl ? topEl.innerHTML : '';
    const descHtml = descEl ? descEl.innerHTML : '';
    const topText = topEl ? normalizeText(topEl.innerText) : '';
    const descText = descEl ? normalizeText(descEl.innerText) : '';

    return {
      jobId,
      srcUrl,
      topHtml,
      descHtml,
      topText,
      descText
    };
  }

  function fingerprint(payload) {
    return JSON.stringify({
      id: payload.jobId,
      t: payload.topText?.slice(0, 256),
      d: payload.descText?.slice(0, 256)
    });
  }

  function formatPlainText(p) {
    return [
      `LinkedIn Job ID: ${p.jobId || '(unknown)'}`,
      `URL: ${p.srcUrl}`,
      '',
      '== Top Card ==',
      p.topText || '(none)',
      '',
      '== Description ==',
      p.descText || '(none)'
    ].join('\n');
  }

  function formatHTML(p) {
    return `<!doctype html>
<html><head><meta charset="utf-8"></head>
<body>
  <div data-export="linkedin-job" data-job-id="${p.jobId || ''}">
    <p><strong>LinkedIn Job ID:</strong> ${p.jobId || '(unknown)'}<br/>
    <strong>URL:</strong> <a href="${p.srcUrl}">${p.srcUrl}</a></p>
    <hr/>
    <section data-part="top-card">${p.topHtml || ''}</section>
    <hr/>
    <section data-part="description">${p.descHtml || ''}</section>
  </div>
</body></html>`;
  }

  async function copyPayload(p) {
    const text = formatPlainText(p);
    const html = formatHTML(p);
    try {
      const res = await chrome.runtime.sendMessage({
        type: 'copy-to-clipboard',
        payload: { text, html }
      });
      if (res && res.ok) {
        showToast(`Copied job ${p.jobId || ''} to clipboard`);
      } else {
        showToast(`Copy failed${res && res.error ? (': ' + res.error) : ''}`);
        console.warn('Copy failed', res);
      }
    } catch (e) {
      console.error('Message to background failed', e);
      showToast('Copy failed (messaging error)');
    }
  }

  function attemptExtractAndCopy() {
    const payload = extract();
    if (!payload) return;

    const fp = fingerprint(payload);
    if (fp === lastFingerprint) return; // no change

    // Avoid rapid duplicates for the same job
    if (payload.jobId && payload.jobId === lastCopiedJobId) {
      // But only skip if content looks the same
      // (LinkedIn sometimes reflows content repeatedly)
      // Keep lastFingerprint logic to decide
    }

    lastFingerprint = fp;
    lastCopiedJobId = payload.jobId || lastCopiedJobId;
    copyPayload(payload);
  }

  function debouncedAttempt() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(attemptExtractAndCopy, 600);
  }

  async function init() {
    await waitForWrapper();
    // Observe changes in the details pane
    const wrapper = document.querySelector(SELECTORS.wrapper) || document.body;
    const mo = new MutationObserver(debouncedAttempt);
    mo.observe(wrapper, { childList: true, subtree: true });

    // Also react to URL changes
    window.addEventListener('li-url-change', debouncedAttempt, { passive: true });

    // Initial attempt
    debouncedAttempt();

    // Optional: also react immediately when user clicks a job item
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (!t) return;
      // If the click happens inside the left pane list or a job link, try sooner
      if (t.closest && (t.closest('ul.jobs-search__results-list') || t.closest('a[href*="/jobs/view/"]'))) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(attemptExtractAndCopy, 400);
      }
    }, true);
  }

  // Kick off
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
