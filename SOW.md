# Statement of Work (2025-09-25)

## Objective
Ensure the extension reliably copies LinkedIn job content by coordinating the offscreen document lifecycle and handling Chrome 140 focus restrictions on clipboard writes.

## Scope & Tasks
- Maintain the background/offscreen readiness handshake so copy requests wait for the listener.
- Implement a clipboard write strategy inside the offscreen document that copes with `Document is not focused` errors (including safe fallbacks).
- Update documentation/tests to reflect the readiness handshake and the clipboard fallback behavior.

## Deliverables
- Updated extension source code covering the handshake and clipboard fallback.
- Documentation and manual test instructions capturing verification steps.

## Out of Scope
- Feature work unrelated to clipboard copying or LinkedIn data extraction.
