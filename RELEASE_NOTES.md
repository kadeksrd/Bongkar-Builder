# Release Notes - Bongkar Canvas Builder v1.2.3-beta (Pre-release / Beta)

Version 1.2.3-beta introduces full dual-language internationalization (Bahasa Indonesia & English) across both the Bongkar Studio interface and the iframe canvas engine, custom HTML section insertion, ergonomic non-obtrusive pop-up editing, locked pop-up stability, and enhanced GitHub pre-release auto-updater detection.

---

### Key Enhancements & Additions in v1.2.3-beta:

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

4. **Exhaustive Dual-Language Internationalization (i18n):**
   - **Real-Time Client-Side Translation Engine:** Instant language switching between Bahasa Indonesia (`id`) and English (`en`) without page reloads.
   - **Complete SEO Panel Translation:** 100% of audit checklist items, verdicts, action chips, SERP snippet previews, and social media sharing instructions dynamically localized.
   - **Settings Panel Translation:** Content Shield copy protection modes, anti-inspect security, custom watermark controls, Google Tag (GA4), Meta Pixel, Microsoft Clarity, and custom head/footer inputs fully translated.
   - **Canvas Synchronized Localization:** Fixed iframe message communication (`bongkar-iframe-canvas`) ensuring floating action tooltips, semantic badges, and toast notifications react in real time.

5. **Ultra-Compact Topbar Language Dropdown Switcher:**
   - Designed as a space-efficient 33px pill dropdown (`[ <i class="fa-solid fa-globe"></i> ID ▾ ]` / `[ EN ▾ ]`) positioned at the topbar right edge.
   - Consumes only ~60px of width, leaving the design/interactive mode switcher and device preview pills spacious on 1366px and 1280px displays.
   - Strictly vector icons (Font Awesome 6); zero keyboard emojis.

6. **GitHub Pre-Release & Beta Auto-Updater Support:**
   - Enhanced `Bongkar_Builder_Updater` to query `/releases?per_page=5` so that pre-releases (such as `1.2.3-beta`) are detected and eligible for one-click background and manual updates directly within WordPress.
