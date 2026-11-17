# Release Notes - Bongkar Canvas Builder v1.2.2 (Production Release)

Version 1.2.2 is a stable production release introducing custom HTML section insertion, ergonomic non-obtrusive pop-up editing, rock-solid modal stability, canvas hover triggers, precision logo & image replacement, and enhanced private repository auto-updater support.

---

### Key Enhancements & Additions in v1.2.2:

1. **Custom HTML Section Insertion ("Desain HTML Sendiri"):**
   - **Visual Structure Picker Integration:** Added a dedicated `[ Custom HTML / HTML Sendiri ]` option in both the inline in-place section picker and the bottom canvas dropzone.
   - **Sidebar "Add" Panel Integration:** Added a dedicated quick-insert card under Section Column Structures in the sidebar, allowing one-click custom HTML section insertion.
   - **Direct HTML / AI Importer Modal:** Users can paste raw HTML snippets or AI-generated components (Claude, v0, ChatGPT) with automatic `<section>` semantic wrapping and instant insertion at any chosen canvas position.

2. **Ergonomic & Non-Obtrusive Pop-up Toolbar Positioning:**
   - **Zero Header Obstruction:** Engineered smart vertical toolbar docking inside modals. When an element near the top of a modal dialog (such as team avatars or headlines) is selected, the toolbar intelligently anchors below the element instead of overlapping the modal header.
   - **Smart Vertical Clamping:** Keeps all team member photos, badges, close icons, and input fields 100% visible and accessible during styling.

3. **Rock-Solid Pop-up / Modal Stability (Anti-Disappearing & Anti-Closing):**
   - **Capture-Phase Backdrop Protection:** Intercepts backdrop clicks and mousedown events at the window/document level in the capturing phase, completely preventing third-party or native landing page scripts from auto-closing modals during editing.
   - **MutationObserver Shield:** Active modals are guarded with a MutationObserver while Pop-up Edit Mode is enabled. Any script attempting to set `display: none` or remove visibility classes is immediately overridden to keep the modal securely open.
   - **Direct Trigger Activation:** Clicking or double-clicking any modal trigger widget on the canvas (such as the "Tanya Pak Patrol" pill) automatically opens and locks Pop-up Edit Mode without conflicts.

4. **Smart Canvas Hover Pop-up Trigger (Ergonomic Topbar):**
   - **Topbar Decluttered:** Removed the dedicated Pop-up mode button from the studio topbar to restore a spacious navigation layout. Eliminates viewport crowding on laptop displays (1366px and 1280px).
   - **Contextual Hover Pill:** Hovering the mouse cursor over any pop-up trigger element on the canvas immediately surfaces a sleek floating badge: `[ Edit Pop-up ]`.
   - **Quick Toolbar Action:** Selecting any element configured with modal triggers displays a dedicated `[ Edit Pop-up ]` action on the floating toolbar and Inspector panel.

5. **Precision Image & Logo Replacement (Multi-Protocol & Wrapper Support):**
   - **Automatic HTTPS Normalization:** Automatically converts `http://` media URLs to `https://` on SSL-secured sites, preventing mixed-content blocking in Google Chrome.
   - **Multi-Wrapper Click Detection:** Enhanced element targeting so that clicking on an image logo opens the WordPress Media Library reliably, whether the image is a standalone `<img>`, wrapped inside an anchor link, or in a styled layout `<div>`.
   - **Canvas Double-Click Shortcut:** Double-clicking any image on the canvas opens the WordPress Media Library modal.

6. **Design Mode Event Interception:**
   - Capturing-phase event listeners prevent buttons with inline `onclick` or modal attributes from triggering intrusive navigation while in Design Mode.

7. **Private Repository Auto-Update Support:**
   - Added support for private GitHub repositories using GitHub Personal Access Tokens (PAT).
   - Direct binary zip downloads via `Accept: application/octet-stream`.
