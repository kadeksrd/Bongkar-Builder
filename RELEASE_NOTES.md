# Release Notes - Bongkar Canvas Builder v1.2.3-beta

Version 1.2.3-beta introduces full dual-language internationalization (Bahasa Indonesia & English) across both the Bongkar Studio interface and the iframe canvas engine, powered by an ultra-compact dropdown switcher that preserves the clean topbar layout, along with enhanced GitHub pre-release auto-updater detection.

---

### Key Enhancements & Additions in v1.2.3-beta:

1. **Studio-Wide Dual-Language Architecture (i18n):**
   - **Real-Time Client-Side Translation Engine:** Implemented `window.BongkarI18n` in `assets/js/i18n-studio.js`, providing instant translation switching between Indonesian (`id`) and English (`en`) without requiring page reloads.
   - **Complete Studio Coverage:** All primary interface touchpoints are translated, including the Topbar navigation, Sidebar tabs (Inspector, Add, SEO, Icons, Settings), Inspector subtabs (Content, Style, Layout, Logic), Empty state prompts, Typography and Spacing controls, Google 2026 SEO audit labels, and Studio action notifications.
   - **Persistent Preference:** Language selection is automatically saved in `localStorage` (`bongkar_studio_lang`) and persists seamlessly across editor sessions and page loads.

2. **Ultra-Compact Topbar Language Dropdown Switcher:**
   - **Space-Efficient Design:** Engineered as a compact 33px pill dropdown (`[ <i class="fa-solid fa-globe"></i> ID ▾ ]` / `[ EN ▾ ]`) positioned at the far right of the topbar before the exit button.
   - **Zero Viewport Clutter:** Consumes only ~60px of width, leaving the central design/interactive switcher and device preview pills completely spacious and unhindered on 1366px and 1280px laptop screens.
   - **Zero Keyboard Emojis:** Built strictly with Font Awesome 6 vector icons (`fa-globe`, `fa-chevron-down`) for a clean, professional UI.

3. **Synchronized Canvas Engine & Floating Toolbar Localization:**
   - **Cross-Frame Event Synchronization:** Dispatches `BONGKAR_CHANGE_LANG` via `postMessage` from the parent Studio to the canvas iframe.
   - **Contextual Canvas Translation:** Dynamically updates semantic role tags ("IMAGE", "TEXT", "BUTTON", "COLUMN", "SECTION"), floating toolbar tooltips (Wrap, Select Parent, Copy, Cut, Paste, Duplicate, Delete), the hover pop-up badge (`Edit Pop-up`), and canvas notification toasts.

4. **GitHub Pre-Release & Beta Auto-Updater Support:**
   - Enhanced `Bongkar_Builder_Updater` to query `/releases?per_page=5` so that pre-releases (such as `1.2.3-beta`) are detected and eligible for one-click background and manual updates directly within WordPress.
