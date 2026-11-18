# Changelog - Bongkar Canvas Builder

All notable changes to this project will be documented in this file.

---

## Version 1.2.3 (Stable Release)

Version 1.2.3 is an official stable release introducing full dual-language internationalization (Bahasa Indonesia & English) across both the Bongkar Studio interface and the iframe canvas engine, an Elementor-grade responsive layout engine with device-aware scoped styles, ergonomic device viewports (Desktop, Tablet, Mobile), custom HTML section insertion, non-obtrusive pop-up editing, locked pop-up stability, and seamless WordPress background updates.

### Key Enhancements & Additions in v1.2.3:

1. **Studio-Wide Dual-Language Architecture (i18n):**
   - **Real-Time Client-Side Translation Engine:** Instant language switching between Bahasa Indonesia (`id`) and English (`en`) without requiring page reloads.
   - **Complete Studio Coverage:** All primary interface touchpoints are translated, including Topbar navigation, Sidebar tabs (Inspector, Add, SEO, Icons, Settings), Inspector subtabs (Content, Style, Layout, Logic), Typography, Spacing, Google 2026 SEO audit, and toasts.
   - **Ultra-Compact Topbar Switcher:** Space-efficient 33px pill dropdown (`[ ID ▾ ]` / `[ EN ▾ ]`) positioned at topbar right edge with zero keyboard emojis.

2. **Elementor-Grade Responsive Layout Engine & Device-Aware Inspector:**
   - **Per-Device Scoped Overrides:** Adjustments made in Mobile or Tablet modes (font size, width, flex direction, text align, padding, margin) are saved per-device via dynamic `<style id="bongkar-responsive-styles">`, ensuring mobile styling never overwrites desktop.
   - **Auto-Stacking Layouts:** Multi-column grids and flex containers automatically collapse into clean 100% width vertical stacks on mobile screens (`<= 767px`).
   - **Fluid & Proportional Typography:** Headings automatically scale with fluid clamp formulas on mobile screens, eliminating oversized headlines.
   - **Anti-Blocking Canvas Interaction:** Floating toolbar adapts cleanly with edge-clamping, while inline text editing (`contenteditable`) temporarily dims the toolbar so text selection is 100% free and unhindered.

3. **Ergonomic Device Viewports (Desktop, Tablet, & Mobile):**
   - **Desktop Viewport (1024px Sweet Spot):** Fixed at the official desktop boundary of 1024px so desktop column layouts and navbars never break or drop vertically, fitting naturally and neatly on laptop screens without excessive horizontal scrolling.
   - **Tablet Viewport (768px):** Styled as an elegant tablet device frame with 28px rounded corners and a sleek 6px dark bezel (`#0f172a`), perfectly centered in the workspace.
   - **Mobile Viewport (390px):** Modeled with native smartphone proportions featuring a 44px rounded frame, 6px bezel, Dynamic Island pill indicator at top, and Home bar indicator at bottom.

4. **Custom HTML Section Insertion ("Desain HTML Sendiri"):**
   - **Visual Structure Picker Integration:** Added dedicated `[ Custom HTML / HTML Sendiri ]` options in both the inline in-place section picker and the bottom canvas dropzone.
   - **Direct HTML / AI Importer Modal:** Users can paste raw HTML snippets or AI-generated components (Claude, v0, ChatGPT) with automatic `<section>` semantic wrapping and instant insertion.

5. **Ergonomic Pop-up Editing & Rock-Solid Stability:**
   - **Zero Header Obstruction:** Floating toolbar intelligently docks below elements near the modal header.
   - **Capture-Phase Backdrop Protection:** Intercepts backdrop clicks at window level, preventing third-party scripts from auto-closing modals during editing.
   - **MutationObserver Shield:** Active modals are guarded to keep them securely open during editing.
   - **Direct Trigger Activation:** Clicking or double-clicking any modal trigger widget on the canvas directly opens Pop-up Edit Mode without conflicts.

6. **GitHub Auto-Updater Detection:**
   - Enhanced `Bongkar_Builder_Updater` to support seamless one-click updates directly within the WordPress dashboard.

---

## Version 1.2.2 (Production Release)

Version 1.2.2 is a stable production release introducing custom HTML section insertion, improved pop-up editing with ergonomic toolbar positioning, rock-solid modal stability, canvas hover triggers, precision logo & image replacement, and enhanced private repository auto-updater support.

### Key Enhancements & Fixes in v1.2.2:

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
   - **Topbar Decluttered:** Removed the dedicated Pop-up mode button from the studio topbar to restore a spacious navigation layout. This completely eliminates viewport crowding, text wrapping, and collisions between the Google 2026 SEO Score pill and the mode switcher on standard laptop displays (1366px and 1280px).
   - **Contextual Hover Pill:** Hovering the mouse cursor over any pop-up trigger element on the canvas (such as the floating chat pill, WhatsApp CTA buttons, or modal backdrops) immediately surfaces a sleek floating badge: `[ Edit Pop-up ]`.
   - **Quick Toolbar Action:** Selecting any element configured with modal triggers displays a dedicated `[ Edit Pop-up ]` action on the floating toolbar and the Inspector panel.
   - **Isolated & Locked Modal Edit Mode:** Activating pop-up edit mode locks the modal open securely, allowing team avatars, headings, and consultation forms to be styled and edited without the dialog prematurely auto-closing.

5. **Precision Image & Logo Replacement (Multi-Protocol & Wrapper Support):**
   - **Automatic HTTPS Normalization:** Automatically converts `http://` media URLs to `https://` on SSL-secured WordPress sites. This prevents browsers (including Google Chrome) from blocking uploaded logos and avatars as insecure Mixed Content.
   - **Multi-Wrapper Click Detection:** Enhanced element targeting so that clicking on an image logo opens the WordPress Media Library reliably, whether the image is an standalone `<img>` tag, wrapped inside an anchor link (`<a class="brand-link">`), or enclosed within a styled layout `<div>`.
   - **Canvas Double-Click Shortcut:** Double-clicking any image on the canvas (including modal avatars) immediately opens the WordPress Media Library modal.

6. **Design Mode Event Interception:**
   - Applied capturing-phase event listeners to prevent buttons with inline `onclick` or modal attributes from triggering intrusive navigation or opening pop-ups while in Design Mode, allowing uninterrupted typography and color customization.

7. **Private Repository Auto-Update Support:**
   - Added support for private GitHub repositories using GitHub Personal Access Tokens (PAT).
   - Injected the `Accept: application/octet-stream` header for `/releases/assets/` endpoints to allow direct binary zip downloads while preventing AWS S3 authentication signature collisions during redirects.

---

## Version 1.2.1 (Production Release)

Version 1.2.1 introduced the native GitHub Auto-Updater system, automated CI/CD release packaging via GitHub Actions, native WordPress 5.5+ automated background update support, and cross-domain portability features.

### Key Features & Architectural Additions in v1.2.1:

1. **Native GitHub Auto-Updater Engine:**
   - Implemented `Bongkar_Builder_Updater`, connecting the plugin directly to the official GitHub repository releases API (`https://api.github.com/repos/kadeksrd/Bongkar-Builder/releases/latest`).
   - Hooked into both `pre_set_site_transient_update_plugins` and `site_transient_update_plugins` to register updates seamlessly within the native WordPress update pipeline.
   - Intelligent 12-hour transient caching with automatic cache invalidation during manual update checks (`wp-admin/update-core.php`, `force-check`, or manual refresh).

2. **WordPress 5.5+ Native Auto-Update Integration:**
   - Filtered `auto_update_plugin` to support WordPress's automated background update cron (`wp_maybe_auto_update`).
   - Enabled site administrators to toggle and utilize one-click auto-updates directly from the WordPress Plugins screen.

3. **One-Click Manual Update Checker:**
   - Injected an action link ("Periksa Pembaruan / Check for Updates") into the plugin row within `wp-admin/plugins.php`.
   - Provides immediate feedback notices indicating whether the plugin is up-to-date or if a newer GitHub release is available.

4. **WordPress Plugins API Modal Integration:**
   - Implemented the `plugins_api` filter for `plugin_information` queries, displaying the native WordPress "View version details" modal complete with release notes, compatibility requirements (PHP 7.4+, WP 5.8+), and changelogs.

5. **Post-Install Directory Sanitization:**
   - Leveraged `upgrader_post_install` to automatically ensure the extracted plugin folder matches the active plugin directory name, preventing broken installations caused by custom GitHub archive directory names.

6. **Universal Cross-Domain Clipboard Engine:**
   - Introduced a self-contained clipboard system utilizing HTML comment encapsulation (`<!-- BONGKAR_BUILDER_CLIPBOARD_V1:... -->`).
   - Enables users to copy elements, cards, forms, or full sections on Website A and paste them directly into the canvas of Website B across separate domain names and hosting servers without styling degradation.
