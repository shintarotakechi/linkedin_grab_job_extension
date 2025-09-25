# LinkedIn Job Detail Auto Copier (Personal)

**Goal:** When you open a LinkedIn job in the search results UI, the extension automatically copies the job's *top card* and *full description* to your clipboard, along with the `currentJobId` parsed from the URL.

---

## What gets copied

We extract the contents of:

1. **Top card**  
   CSS: `.job-details-jobs-unified-top-card__container--two-pane`

2. **Description**  
   CSS: `div.jobs-box__html-content.jobs-description-content__text--stretch`  
   *(We intentionally ignore the random obfuscated class like `LqClAPPDAqtYUZbtGyEWnjMdFeOlIrJc`.)*

Both sections are copied to the clipboard as **rich HTML** (primary) **and** **plain text** (fallback). The plain text payload looks like:

```
LinkedIn Job ID: 4304445695
URL: https://www.linkedin.com/jobs/search-results/?currentJobId=4304445695&...

== Top Card ==
...flattened text...

== Description ==
...flattened text...
```

The HTML payload wraps both inner `div`s together and includes a link back to the source URL.

---

## How it works

- A **content script** runs on `https://www.linkedin.com/jobs/*`. It watches for changes in the right‑hand details panel (`.jobs-semantic-search-job-details-wrapper`) using a `MutationObserver` and reacts to SPA URL changes (patches `history.pushState/replaceState` and listens to `popstate`).  
- When a job is loaded or changed, the script grabs the two target elements, builds combined **text** and **HTML**, and asks the background to copy.
- The **service worker** (background) ensures a **Chrome Offscreen Document** is open and forwards the copy request there.
- The **offscreen page** calls the **Clipboard API** (`navigator.clipboard.write`) to place both `text/html` and `text/plain` on your clipboard. This pattern avoids user‑gesture restrictions that often block clipboard writes from content scripts and service workers in MV3.

**Why Offscreen?** In Manifest V3, service workers have no DOM and can't use the Clipboard API directly; the recommended solution is an offscreen document with reason `CLIPBOARD`. See Chrome’s docs and examples.  
*(References: Chrome Offscreen API reference and blog posts — linked in the README section below.)*

---

## Install & use

1. **Download the ZIP** attached to this message and unzip it.  
2. Open `chrome://extensions`, toggle **Developer mode**, click **Load unpacked**, and select the unzipped folder.  
3. Navigate to a LinkedIn job search URL like:  
   `https://www.linkedin.com/jobs/search-results/?keywords=...`  
4. Click any job in the left list. Within ~0.5s you'll see a small toast: **“Copied job ###### to clipboard.”** Paste anywhere to inspect the result.

> Tip: The extension de‑duplicates copies while the same job is re-rendering; it re-copies only when the job or content truly changes.

---

## Customization

Open `content-script.js` and edit:

- `SELECTORS.topCard` – if LinkedIn renames this class in the future.  
- `SELECTORS.description` – stable combo we use today.  
- Debounce timings (`debouncedAttempt` delay `600ms`).  
- The text/HTML layout generated in `formatPlainText()`/`formatHTML()`.

---

## Permissions and why

- `"offscreen"`: create an offscreen document to use the Clipboard API from an extension page (MV3).  
- `"clipboardWrite"`: permission to write to the clipboard.  
- `"scripting"` / `"activeTab"`: standard messaging and script context needs (in practice this runs as a content script defined in the manifest).  
- `"storage"`: reserved for future toggles; not used right now.  
- `host_permissions: https://www.linkedin.com/*`: run on LinkedIn only.

Chrome’s Offscreen API notes (Chrome 109+, MV3) and clipboard guidance: see Google’s official docs. 

---

## Known limitations

- **Fragile selectors:** LinkedIn can change CSS class names at any time. If it breaks, update the selectors at the top of `content-script.js`.
- **Other job entry points:** The script targets the two-pane search UI. If you open a standalone `/jobs/view/##########/` page, it still tries to extract, but coverage is best in search.
- **ToS:** Automating scraping or data extraction may violate LinkedIn’s Terms of Service. Use this only for **personal** purposes and at your own risk.
- **Browser versions:** Requires Chrome **116+** (for `runtime.getContexts`) and MV3 support. The Offscreen API is available from Chrome 109+.  
- **Clipboard quirkiness:** If your OS or a clipboard manager blocks rich HTML, you'll still get a plain text copy.

---

## File tree

```
/ (extension root)
├─ manifest.json
├─ background.js            # MV3 service worker: manages offscreen document; forwards copy
├─ content-script.js        # Extracts target nodes; sends copy requests; shows toast
├─ offscreen.html           # Hidden page to perform Clipboard API writes
├─ offscreen.js
└─ icon128.png
```

---

## References

- **Offscreen API reference (chrome.offscreen)** — reasons, contexts, and examples.  
- **Offscreen Documents in Manifest V3 (Chrome blog)** — clipboard example and rationale.
