# Bongkar Canvas Builder (HTML-First Visual Page Builder)

**Version 1.2.3 (Stable Release)**  
A modern, ultra-lightweight, and zero-bloat visual page builder plugin for WordPress. Specifically designed for importing AI-generated layouts (HTML/CSS/JS exported from Claude, v0, ChatGPT, or Figma) and refining them visually on a **Standalone Canvas Studio**—delivering the flexibility of Elementor without the DOM bloat or performance degradation.

---

## Core Philosophy & Architecture

Bongkar Canvas Builder is built on an **HTML-First & Clean DOM Architecture**. Unlike traditional page builders that wrap every heading and paragraph inside 4 to 8 nested `<div>` layers (such as `elementor-widget-wrap` and `elementor-element-populated`), Bongkar Builder produces native, semantic HTML markup.

1. **Zero DOM Bloat:** Outputs clean code comparable to senior developer hand-written markup (`<section>`, `<header>`, `<h2>`, `<p>`).
2. **Green Core Web Vitals:** Typical frontend asset weight remains under 50 KB, maintaining Google PageSpeed scores consistently between 95 and 100.
3. **Independent Draft & Live Separation:** Features an Elementor-grade draft engine. All modifications remain saved as unpublished drafts until explicitly published via the green *Publish* button.

---

## Key Features & System Capabilities

### 1. Dual Canvas Interaction Engine
The studio editor provides two distinct operational modes:
- **Design Mode:** Visually select, reposition, style typography, modify dimensions, and update content with contextual floating action bars.
- **Interactive LIVE Mode (Shortcut: `Ctrl + I`):** Test active page behaviors directly (Swiper sliders, modal pop-ups, hamburger navigation, pricing calculators, FAQ accordions, and WhatsApp webhook forms) exactly as an end-user would experience them, without editor selector overlays.

### 2. Smart Pop-up & Modal Engine
Effortlessly design and refine overlays without disrupting standard page workflows:
- **Contextual Canvas Hover Trigger:** Hovering over any modal trigger widget (such as floating chat buttons, WhatsApp CTA pills, or contact triggers) displays an intuitive floating pill: `[ Edit Pop-up ]`.
- **Locked & Stable Modal Editing:** Opening pop-up edit mode locks the modal dialog open, allowing team avatars, headlines, and form input fields to be customized without the dialog prematurely closing on click.
- **Design Mode Click Interception:** In Design Mode, clicking a modal trigger button selects it for styling rather than triggering native link jumps.

### 3. Professional 4-Subtab Inspector
A structured side-panel organized into four focused workspaces:
- **Content Subtab:** Semantic tag switcher (H1-H6, P, DIV, SPAN), inline text editing, image source and SEO alt text, link destination with new-tab toggle, and direct WhatsApp / Google Sheets webhook integrations.
- **Style Subtab:** Integrated Google Fonts catalogue, responsive font sizing (PX slider), font weight control (300 to 900), text alignment (left, center, right, justify), color palettes, border radius, and box shadows.
- **Layout Subtab:** Universal dimensions (Width & Height supporting %, PX, EM, and AUTO) for all element types (including text nodes and containers), Flexbox direction controls, instant column presets (50:50, 60:40, 70:30, 40:60, 3-column), and responsive padding/margin sliders.
- **Logic & Script Subtab:** Per-element JavaScript code editor, pre-built algorithm presets (Swiper slider, FAQ Accordion, Tab Navigation, Countdown Timer, Form Webhook), inline event listeners (`onclick`, `oninput`, `onsubmit`), and an interactive execution log.

### 4. Precision Image & Media Engine
- **Automatic HTTPS Protocol Normalization:** Automatically converts `http://` media URLs to `https://` on SSL-secured websites, preventing browsers from blocking uploaded logos and avatars as Mixed Content.
- **Multi-Wrapper Click Detection:** Reliably targets images whether clicked directly (`<img>`), via enclosing navigation links (`<a class="logo-link">`), or inside styled card containers (`<div>`).
- **Canvas Double-Click Shortcut:** Double-clicking any image on the canvas (including modal avatars) immediately opens the WordPress Media Library modal.

### 5. In-Place Section Structure Dropzone
Insert new sections with pre-configured column structures (1 Column, 2 Columns 50:50, 2 Columns 66:33, 3 Columns, 4 Columns) directly between existing page sections without jumping to the bottom of the page.

### 6. Universal Cross-Domain Clipboard
A self-contained clipboard mechanism utilizing HTML comment encapsulation:
- Copy (`Ctrl + C`) any element, column, or complete section on **Website A**.
- Open the Bongkar Builder canvas on **Website B** (on a different domain) and paste (`Ctrl + V`).
- The entire layout structure, CSS classes, and inline styles are instantly reproduced.

### 7. Real-Time Google SEO Intelligence & Score
Real-time audit adhering to Google quality guidelines:
- Monitors unique H1 tags, Meta Title length, Meta Description completeness, Social Open Graph card previews, and image Alt text.
- Dynamic SEO score indicator (0–100) integrated into the top studio header.

### 8. Native GitHub Auto-Updater
Connects directly to official GitHub repository releases:
- WordPress automatically notifies administrators when a newer release is published.
- Updates can be executed with a single click via the standard WordPress **Plugins** screen without requiring manual ZIP downloads.
- Full support for both stable releases and pre-releases (beta / release candidate tags).

### 9. Dual-Language Studio Mode (Bahasa Indonesia & English)
- **Instant Translation:** Seamlessly switch between Indonesian (`ID`) and English (`EN`) without reloading the page.
- **Space-Efficient Topbar Dropdown:** A sleek, compact dropdown switcher positioned on the topbar's right side ensures zero layout crowding or overlap on standard laptop viewports.
- **Synchronized Canvas Engine:** Real-time event broadcasting updates floating action tooltips, element semantic badges, and notifications across both the parent Studio and iframe canvas simultaneously.

---

## Comparison: Bongkar Builder vs. Elementor

| Parameter | Elementor | **Bongkar Canvas Builder** |
| :--- | :--- | :--- |
| **DOM Overhead** | Each element is nested inside 4–8 wrapper `<div>` layers | **Zero Wrapper Overlap** (Native semantic tags: `<section>`, `<h2>`, `<p>`) |
| **Frontend Assets** | > 1.5 MB – 3.0 MB of core CSS and JS libraries | **Loads only the specific page CSS and JS (< 50 KB)** |
| **AI / Figma Workflow** | Difficult; widgets must be rebuilt manually one by one | **Paste AI-generated HTML+CSS+JS, renders immediately on canvas** |
| **Google PageSpeed Score** | Frequently degrades to 50–70 on content-heavy pages | **Consistently maintains 95–100 (All Core Web Vitals Green)** |
| **Universal Dimensions** | Restricted to specific container or column elements | **Width & Height controls available for ALL element types** |
| **Panel Organization** | Single long continuous scrolling panel | **Organized into 4 focused Subtabs (Content, Style, Layout, Logic)** |
| **Update Mechanism** | Bound to paid per-domain licensing models | **Native GitHub Auto-Updater (One-click updates via GitHub Releases)** |

---

## Installation Guide

### Method 1: Upload ZIP via WordPress Admin (Recommended)
1. Download the `bongkar-builder.zip` archive from [GitHub Releases](https://github.com/kadeksrd/Bongkar-Builder/releases).
2. Log in to your WordPress Dashboard (`yourdomain.com/wp-admin`).
3. Navigate to **Plugins** -> **Add New Plugin** -> click **Upload Plugin**.
4. Choose the `bongkar-builder.zip` file and click **Install Now**.
5. Click **Activate Plugin**. The **Bongkar Builder** menu will appear in your admin sidebar.

### Method 2: Manual Upload via FTP / File Manager
1. Extract the downloaded ZIP archive to obtain the `bongkar-builder` folder.
2. Connect to your server hosting directory: `wp-content/plugins/`.
3. Upload the `bongkar-builder` directory.
4. Go to **WP Admin** -> **Plugins** and click **Activate** under *Bongkar Canvas Builder*.

---

## Configuring Updates for Private GitHub Repositories

If the repository is set to **Private** on GitHub, GitHub requires an access token to verify permissions before delivering release data and binary downloads.

1. **Generate a GitHub Personal Access Token (Classic):**
   - In GitHub, go to **Settings** -> **Developer Settings** -> **Personal Access Tokens** -> **Tokens (classic)**.
   - Click **Generate new token (classic)**, set the note to `Bongkar Updater`, and check the **`repo`** scope.
   - Click **Generate token** and copy the resulting string (`ghp_...`).
2. **Add the Token to WordPress:**
   - In your WordPress installation's `wp-config.php` file, insert the following line above `/* That's all, stop editing! */`:
     ```php
     define('BONGKAR_BUILDER_GITHUB_TOKEN', 'ghp_your_copied_token_here');
     ```
   - Once configured, WordPress will automatically authenticate against GitHub's API during update checks and binary downloads.

---

## System Requirements
- **WordPress**: Version 5.8 or later (fully tested up to WordPress 6.7+).
- **PHP**: Version 7.4, 8.0, 8.1, 8.2, or 8.3+.
- **Web Server**: Apache, Nginx, LiteSpeed, or Cloudflare.
- **Browsers**: Modern versions of Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge.

---

## Security & Licensing
- Licensed under the **GPL-2.0-or-later**. Free for personal, client, and commercial projects.
- Protected by WordPress Nonce verification (`wp_verify_nonce`), strict capability checks (`current_user_can('edit_pages')`), and Content Shield sanitization.
