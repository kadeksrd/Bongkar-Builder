# Release Notes - Bongkar Canvas Builder

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
