# Changelog - Bongkar Canvas Builder

All notable changes to this project will be documented in this file.

---

## Version 1.2.3-beta (Pre-release / Beta)

Version 1.2.3-beta introduces full dual-language internationalization (Bahasa Indonesia & English) across both the Bongkar Studio interface and the iframe canvas engine, custom HTML section insertion, ergonomic non-obtrusive pop-up editing, locked pop-up stability, and enhanced GitHub pre-release auto-updater detection.

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

---

## Version 1.2.2 (Production Release)

Version 1.2.2 introduces an improved pop-up editing experience with an intuitive canvas hover trigger, comprehensive logo and image replacement fixes across all element wrappers, automatic HTTPS normalization to prevent mixed-content blocking, and enhanced private repository auto-updater support.

### Key Enhancements & Fixes in v1.2.2:

1. **Smart Canvas Hover Pop-up Trigger (Ergonomic Topbar):**
   - **Topbar Decluttered:** Removed the dedicated Pop-up mode button from the studio topbar to restore a spacious navigation layout. This completely eliminates viewport crowding, text wrapping, and collisions between the Google 2026 SEO Score pill and the mode switcher on standard laptop displays (1366px and 1280px).
   - **Contextual Hover Pill:** Hovering the mouse cursor over any pop-up trigger element on the canvas (such as the floating chat pill, WhatsApp CTA buttons, or modal backdrops) immediately surfaces a sleek floating badge: `[ Edit Pop-up ]`.
   - **Quick Toolbar Action:** Selecting any element configured with modal triggers displays a dedicated `[ Edit Pop-up ]` action on the floating toolbar and the Inspector panel.
   - **Isolated & Locked Modal Edit Mode:** Activating pop-up edit mode locks the modal open securely, allowing team avatars, headings, and consultation forms to be styled and edited without the dialog prematurely auto-closing.

2. **Precision Image & Logo Replacement (Multi-Protocol & Wrapper Support):**
   - **Automatic HTTPS Normalization:** Automatically converts `http://` media URLs to `https://` on SSL-secured WordPress sites. This prevents browsers (including Google Chrome) from blocking uploaded logos and avatars as insecure Mixed Content.
   - **Multi-Wrapper Click Detection:** Enhanced element targeting so that clicking on an image logo opens the WordPress Media Library reliably, whether the image is an standalone `<img>` tag, wrapped inside an anchor link (`<a class="brand-link">`), or enclosed within a styled layout `<div>`.
   - **Canvas Double-Click Shortcut:** Double-clicking any image on the canvas (including modal avatars) immediately opens the WordPress Media Library modal.

3. **Design Mode Event Interception:**
   - Applied capturing-phase event listeners to prevent buttons with inline `onclick` or modal attributes from triggering intrusive navigation or opening pop-ups while in Design Mode, allowing uninterrupted typography and color customization.

4. **Private Repository Auto-Update Support:**
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
