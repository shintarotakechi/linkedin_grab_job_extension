// background.js (service worker, MV3)
// Coordinates offscreen document lifecycle and routes copy requests from content scripts.
const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';
let creatingOffscreen;
let offscreenReady = false;
const offscreenReadyResolvers = [];

function markOffscreenReady() {
  offscreenReady = true;
  while (offscreenReadyResolvers.length > 0) {
    const resolve = offscreenReadyResolvers.shift();
    try {
      resolve();
    } catch (err) {
      console.warn('Failed to resolve offscreen waiter:', err);
    }
  }
}

function waitForOffscreenReady() {
  if (offscreenReady) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    offscreenReadyResolvers.push(resolve);
  });
}

// Ensure offscreen doc exists (Chrome 116+ uses runtime.getContexts).
async function ensureOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });
  if (contexts.length > 0) {
    markOffscreenReady();
    return;
  }

  offscreenReady = false;

  if (creatingOffscreen) {
    await creatingOffscreen;
  } else {
    creatingOffscreen = chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: ['CLIPBOARD'],
      justification: 'Write text/html to the clipboard on behalf of content scripts.'
    }).catch((err) => {
      creatingOffscreen = null;
      throw err;
    });
    try {
      await creatingOffscreen;
    } finally {
      creatingOffscreen = null;
    }
  }

  await waitForOffscreenReady();
}

// Forward copy request to the offscreen document
async function copyViaOffscreen(payload) {
  await ensureOffscreenDocument();
  await waitForOffscreenReady();
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
  if (!msg) {
    return undefined;
  }

  if (msg.type === 'offscreen-ready') {
    markOffscreenReady();
    sendResponse({ ok: true });
    return undefined;
  }

  if (msg.type === 'copy-to-clipboard') {
    (async () => {
      const result = await copyViaOffscreen(msg.payload);
      sendResponse(result);
    })();
    return true; // keep the message channel open for async sendResponse
  }

  return undefined;
});


