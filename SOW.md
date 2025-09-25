# Statement of Work (2025-09-25)

## Objective
Resolve the clipboard copy failure by ensuring the offscreen document receives copy requests and responds reliably, restoring automatic job detail copying.

## Scope & Tasks
- Inspect current background/offscreen messaging flow and identify why the offscreen context fails to respond.
- Implement reliable coordination between the service worker and offscreen document so copy requests are acknowledged.
- Add minimal logging or diagnostics needed to confirm the fix.
- Update documentation/test artifacts to reflect the new behavior.

## Deliverables
- Updated extension source code with the corrected offscreen messaging.
- Supporting documentation and test artifact demonstrating the behavior.

## Out of Scope
- Broader feature changes beyond fixing the clipboard pipeline.
- UI redesigns or selector updates unrelated to the copy flow.
