# Manual Test: Offscreen Clipboard Pipeline

## Purpose
Confirm the service worker waits for the offscreen document to report readiness before forwarding copy requests, ensuring the clipboard receives job data.

## Steps
1. Load the unpacked extension in Chrome.
2. Open `chrome://extensions`, toggle the extension off and on, and click **Service worker** to open its console.
3. Visit a LinkedIn job search URL (e.g., the one in `specification.md`) and click a job entry in the left column to open its details panel.
4. Observe the service worker console: the promise resolves with `{ ok: true }` and no "message port closed" or focus-related errors.
5. Paste into a text editor and verify that the clipboard contains the job ID, URL, top card, description, and (when present) the People Who Can Help section.\n6. Navigate to any other LinkedIn jobs page (e.g., a company hub or job view), then return to the search results without refreshing and confirm the toast fires again with fresh clipboard data.

## Expected Result
- The service worker receives `{ ok: true }` from the offscreen document without "message port closed" or "Document is not focused" errors.
- The pasted output matches the format described in `specification.md` after both the initial load and the navigation-away/return cycle, and includes the optional "People Who Can Help" section when it exists.





