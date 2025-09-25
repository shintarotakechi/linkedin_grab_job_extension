// background.js (service worker, MV3)
const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';
let creatingOffscreen;

// Ensure offscreen doc exists (Chrome 116+ uses runtime.getContexts).
async function ensureOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);
  // Check if it already exists
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });
  if (contexts.length > 0) return;

  if (creatingOffscreen) {
    await creatingOffscreen;
  } else {
    creatingOffscreen = chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: ['CLIPBOARD'],
      justification: 'Write text/html to the clipboard on behalf of content scripts.'
    });
    await creatingOffscreen;
    creatingOffscreen = null;
  }
}

// Forward copy request to the offscreen document
async function copyViaOffscreen(payload) {
  await ensureOffscreenDocument();
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      target: 'offscreen',
      type: 'offscreen-copy',
      payload
    }, (resp) => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        console.warn('Offscreen copy error:', lastError.message);
        resolve({ ok: false, error: lastError.message });
      } else {
        resolve(resp || { ok: false, error: 'No response from offscreen' });
      }
    });
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg && msg.type === 'copy-to-clipboard') {
      const result = await copyViaOffscreen(msg.payload);
      sendResponse(result);
      return;
    }
  })();
  // Keep the message channel open for async sendResponse
  return true;
});
