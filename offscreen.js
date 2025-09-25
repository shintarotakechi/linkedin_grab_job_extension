// offscreen.js
// Runs in an offscreen document. Only chrome.runtime API is available.
(async function announceReady() {
  try {
    await chrome.runtime.sendMessage({ type: 'offscreen-ready' });
  } catch (err) {
    console.warn('Failed to announce offscreen readiness:', err);
  }
})();

function isFocusError(err) {
  if (!err) return false;
  const message = String(err && err.message || err);
  return err.name === 'NotAllowedError' || message.includes('Document is not focused');
}

async function focusDocument() {
  if (typeof self !== 'undefined' && typeof self.focus === 'function') {
    try {
      self.focus();
    } catch (err) {
      console.debug('Unable to focus offscreen window via self.focus():', err);
    }
  }

  if (document.hasFocus && document.hasFocus()) {
    return;
  }

  const trap = document.createElement('textarea');
  trap.setAttribute('aria-hidden', 'true');
  trap.style.position = 'fixed';
  trap.style.opacity = '0';
  trap.style.pointerEvents = 'none';
  trap.style.width = '1px';
  trap.style.height = '1px';
  trap.tabIndex = -1;
  document.body.appendChild(trap);
  trap.focus({ preventScroll: true });
  document.body.removeChild(trap);
}

async function execCommandFallback(text, html) {
  await focusDocument();
  return new Promise((resolve, reject) => {
    function handleCopy(event) {
      event.preventDefault();
      if (html) {
        event.clipboardData.setData('text/html', html);
      }
      event.clipboardData.setData('text/plain', text || '');
    }

    document.addEventListener('copy', handleCopy, { once: true, capture: true });

    const textarea = document.createElement('textarea');
    textarea.value = text || '';
    textarea.setAttribute('aria-hidden', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    document.body.appendChild(textarea);
    textarea.focus({ preventScroll: true });
    textarea.select();

    try {
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (!ok) {
        throw new Error('execCommand copy returned false');
      }
      resolve();
    } catch (err) {
      document.body.removeChild(textarea);
      reject(err);
    } finally {
      document.removeEventListener('copy', handleCopy, true);
    }
  });
}

async function writeClipboardPayload(payload) {
  const text = payload?.text ?? '';
  const html = payload?.html ?? '';

  await focusDocument();

  try {
    if (typeof ClipboardItem !== 'undefined' && html) {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' })
      });
      await navigator.clipboard.write([item]);
      return;
    }
    if (text) {
      await navigator.clipboard.writeText(text);
      return;
    }
    throw new Error('No content to copy.');
  } catch (err) {
    if (isFocusError(err)) {
      await execCommandFallback(text, html);
      return;
    }
    throw err;
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.target !== 'offscreen') {
    return undefined;
  }

  (async () => {
    try {
      await writeClipboardPayload(msg.payload || {});
      sendResponse({ ok: true });
    } catch (err) {
      console.error('Offscreen copy failed:', err);
      sendResponse({ ok: false, error: String((err && err.message) || err) });
    }
  })();

  return true; // keep channel open for async work
});
