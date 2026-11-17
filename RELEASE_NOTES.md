# Release Notes - Bongkar Canvas Builder v1.2.3-beta (Pre-release / Beta)

Version 1.2.3-beta introduces full dual-language internationalization (Bahasa Indonesia & English) across both the Bongkar Studio interface and the iframe canvas engine, powered by an ultra-compact dropdown switcher that preserves the clean topbar layout, along with enhanced GitHub pre-release auto-updater detection, plus all stability and section additions from v1.2.2.

---

### Key Enhancements & Additions in v1.2.3-beta:

1. **Studio-Wide Dual-Language Architecture (i18n):**
   - **Real-Time Client-Side Translation Engine:** Implemented `window.BongkarI18n` in `assets/js/i18n-studio.js`, providing instant translation switching between Indonesian (`id`) and English (`en`) without requiring page reloads.
   - **Complete Studio Coverage:** All primary interface touchpoints are translated, including the Topbar navigation, Sidebar tabs (Inspector, Add, SEO, Icons, Settings), Inspector subtabs (Content, Style, Layout, Logic), Typography and Spacing controls, Google 2026 SEO audit labels, and Studio action notifications.
   - **Persistent Preference:** Language selection is automatically saved in `localStorage` (`bongkar_studio_lang`) and persists seamlessly across editor sessions and page loads.

2. **Ultra-Compact Topbar Language Dropdown Switcher:**
   - **Space-Efficient Design:** Engineered as a compact 33px pill dropdown (`[ <i class="fa-solid fa-globe"></i> ID ▾ ]` / `[ EN ▾ ]`) positioned at the far right of the topbar before the exit button.
   - **Zero Viewport Clutter:** Consumes only ~60px of width, leaving the central design/interactive switcher and device preview pills completely spacious and unhindered on standard laptop screens.
   - **Zero Keyboard Emojis:** Built strictly with Font Awesome 6 vector icons (`fa-globe`, `fa-chevron-down`) for a clean, professional UI.

3. **Synchronized Canvas Engine & Floating Toolbar Localization:**
   - **Cross-Frame Event Synchronization:** Dispatches `BONGKAR_CHANGE_LANG` via `postMessage` from the parent Studio to the canvas iframe.
   - **Contextual Canvas Translation:** Dynamically updates semantic role tags ("IMAGE", "TEXT", "BUTTON", "COLUMN", "SECTION"), floating toolbar tooltips (Wrap, Select Parent, Copy, Cut, Paste, Duplicate, Delete), the hover pop-up badge (`Edit Pop-up`), and canvas notification toasts.

4. **GitHub Pre-Release & Beta Auto-Updater Support:**
   - Enhanced `Bongkar_Builder_Updater` to query `/releases?per_page=5` so that pre-releases (such as `1.2.3-beta`) are detected and eligible for one-click background and manual updates directly within WordPress.

5. **All Latest Feature Additions & Fixes from v1.2.2 Included:**
   - Custom HTML Section Insertion ("Desain HTML Sendiri") in both inline and bottom section pickers.
   - Ergonomic, non-obtrusive floating toolbar positioning in pop-up/modal edit mode.
   - Rock-solid pop-up stability preventing dialogs from auto-closing on click or double-click.

6. **Elementor-Style Full-Width Canvas & Responsive Viewport Engine:**
   - **100% Fluid Desktop Workspace:** Desktop preview mode now fills 100% of the available workspace edge-to-edge naturally (identical to Elementor's canvas), completely eliminating artificial shrinking and dark empty side bars.
   - **Zero Horizontal Overflow:** Enforced strict `overflow-x: hidden` and `min-width: 0` on `.studio-canvas-area`, guaranteeing that horizontal scrollbars never appear on laptop screens.
   - **Clean Elementor Device Frames:** Sized cleanly to standard Elementor breakpoints: Tablet (768px) and Mobile (360px), without obtrusive bezels, fake notches, or blocking home bars.

7. **Elementor-Grade Responsive Layout Engine & Device-Aware Inspector:**
   - **Per-Device Scoped Overrides:** Adjustments made in Mobile (360px) or Tablet (768px) modes (font size, column width, flex direction, text alignment, padding, and margin) are automatically saved per-device via dynamic responsive stylesheet compilation (`<style id="bongkar-responsive-styles">`), ensuring mobile refinements never break the desktop layout.
   - **Auto-Stacking & Zero-Overflow Layouts:** Multi-column grids and flex containers automatically collapse into clean 100% width vertical stacks on mobile screens (`<= 767px`), with outer section padding constrained to prevent excessive desktop padding from squishing content.
   - **Fluid & Proportional Typography:** Headings automatically scale with fluid clamp formulas on mobile screens, eliminating oversized headlines and awkward word wraps.
   - **Anti-Blocking Canvas Interaction:** Floating toolbar adapts into an ultra-compact mode on narrow screens with edge clamping, while inline text editing (`contenteditable`) temporarily dims the toolbar so text selection and cursor placement are 100% free and unhindered.
   - **Live Device Sync Badges:** Interactive device indicator badges across Inspector controls provide instant visual feedback on which device mode is active and highlight customized property overrides.
