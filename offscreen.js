// offscreen.js
// Runs in an offscreen document. Only chrome.runtime API is available.
(async function announceReady() {
  try {
    await chrome.runtime.sendMessage({ type: 'offscreen-ready' });
  } catch (err) {
    console.warn('Failed to announce offscreen readiness:', err);
  }
})();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.target !== 'offscreen') {
    return undefined;
  }

  (async () => {
    const { text, html } = msg.payload || {};
    if (typeof ClipboardItem !== 'undefined' && html) {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text || ''], { type: 'text/plain' })
      });
      await navigator.clipboard.write([item]);
    } else if (text) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error('No content to copy.');
    }
    sendResponse({ ok: true });
  })().catch((err) => {
    console.error('Offscreen copy failed:', err);
    sendResponse({ ok: false, error: String((err && err.message) || err) });
  });

  return true; // keep channel open for async work
});
