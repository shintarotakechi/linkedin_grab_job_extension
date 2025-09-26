# Statement of Work (2025-09-26)

## Objective
Ensure the LinkedIn auto copier resumes copying after navigation, includes the optional "People Who Can Help" section when present, and ships as version 0.1.1.

## Scope & Tasks
- Keep the updated observer logic that reattaches when returning to the jobs search results.
- Extend extraction/formatting to include the optional `job-details-people-who-can-help__section--two-pane artdeco-card ph5 pv4` block when available.
- Update clipboard text/HTML output to surface the additional section clearly without breaking existing format.
- Make sure the manifest version remains bumped to 0.1.1 and adjust manual tests/documentation accordingly.

## Deliverables
- Updated source code capturing the optional "People Who Can Help" data in both text and HTML payloads.
- Manual test notes covering the new section handling and navigation scenario.

## Out of Scope
- Selector rewrites beyond the new section.
- Clipboard formatting changes unrelated to the added section.
